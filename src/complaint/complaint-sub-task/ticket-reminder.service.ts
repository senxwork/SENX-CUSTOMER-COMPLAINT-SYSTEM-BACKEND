import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ComplaintSubTask } from './complaint-sub-task.entity';
import { Department } from '../departments/department.entity';
import { PublicTicketAccessService } from '../public-ticket-access/public-ticket-access.service';

@Injectable()
export class TicketReminderService {
  private readonly logger = new Logger(TicketReminderService.name);
  private readonly FRONTEND_URL = 'https://css.senxgroup.com';
  private readonly REMINDER_HOURS = 24;

  constructor(
    @InjectRepository(ComplaintSubTask)
    private readonly subTaskRepository: Repository<ComplaintSubTask>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly mailerService: MailerService,
    private readonly publicTicketAccessService: PublicTicketAccessService,
  ) {}

  /**
   * ตรวจทุก 30 นาที หา Ticket ที่ถูกมอบหมายให้หน่วยงานเกิน 24 ชม.
   * แต่ยังไม่มี action (status ยังเป็น open) และยังไม่เคยส่ง reminder
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkOverdueTickets(): Promise<void> {
    this.logger.log('Checking overdue tickets for reminder email...');
    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - this.REMINDER_HOURS);

      const tickets = await this.subTaskRepository.find({
        where: {
          status: 'open',
          department_assigned_at: LessThan(cutoff),
          reminder_sent_at: IsNull(),
          department: { id: Not(IsNull()) },
        },
        relations: [
          'department',
          'parent',
          'parent.project',
          'ticketCategory',
        ],
      });

      this.logger.log(`Found ${tickets.length} overdue ticket(s)`);

      for (const ticket of tickets) {
        await this.sendReminderEmail(ticket);
      }
    } catch (err) {
      this.logger.error(`checkOverdueTickets failed: ${err.message}`);
    }
  }

  private async sendReminderEmail(ticket: ComplaintSubTask): Promise<void> {
    try {
      const department = ticket.department;
      if (!department?.contacts?.length) return;

      const contactsWithEmail = department.contacts.filter((c: any) => c.email);
      if (contactsWithEmail.length === 0) return;

      const parent: any = (ticket as any).parent;
      const project = parent?.project;

      const hoursSinceAssigned = Math.floor(
        (Date.now() - new Date(ticket.department_assigned_at).getTime()) / (1000 * 60 * 60),
      );

      for (const contact of contactsWithEmail) {
        const access = await this.publicTicketAccessService.createAccess(
          ticket.id,
          contact.name,
          contact.email,
        );
        const publicUrl = `${this.FRONTEND_URL}/public/ticket/${access.token}`;

        await this.mailerService.sendMail({
          to: contact.email,
          subject: `[เตือน] Ticket ${ticket.ticket_number} ยังไม่ได้ดำเนินการ (เกิน ${hoursSinceAssigned} ชม.)`,
          template: 'reminderTicket',
          context: {
            dataBody: {
              ticket_number: ticket.ticket_number,
              ticket_detail: ticket.ticket_detail,
              project_name: project?.project_name_th || '-',
              customer_name: parent?.customer_name || '-',
              house_name: parent?.house_name || '-',
              department_name: department.department_name,
              category: (ticket as any).ticketCategory?.category_name || '-',
              urgent: ticket.urgent,
              hours_since_assigned: hoursSinceAssigned,
              due_date: this.formatThaiDate(ticket.due_date),
              assigned_at: this.formatThaiDate(ticket.department_assigned_at),
              contact_name: contact.name,
              public_url: publicUrl,
            },
          },
        });

        this.logger.log(
          `Reminder sent to ${contact.email} for ticket ${ticket.ticket_number}`,
        );
      }

      await this.subTaskRepository.update(ticket.id, {
        reminder_sent_at: new Date(),
      });
    } catch (err) {
      this.logger.error(`sendReminderEmail failed: ${err.message}`);
    }
  }

  private formatThaiDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear() + 543;
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi} น.`;
  }
}
