import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PublicTicketAccessService } from './public-ticket-access.service';
import { ActivityLogService } from '../../activity-log/activity-log.service';

@Controller('public/ticket')
export class PublicTicketAccessController {
  constructor(
    private readonly service: PublicTicketAccessService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get(':token')
  async getTicket(@Param('token') token: string) {
    const result = await this.service.getTicketByToken(token);
    if (!result) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Post(':token/comment')
  async addComment(
    @Param('token') token: string,
    @Body() body: { transaction_detail: string },
  ) {
    try {
      const result = await this.service.addComment(token, body.transaction_detail);

      // Activity Log - get access info for logging
      const access = await this.service.findByToken(token);
      await this.activityLogService.log({
        sub_task_id: access?.subTask?.id,
        complaint_id: access?.subTask?.parent?.complaint_id,
        action_type: 'PUBLIC_ADD_COMMENT',
        action_detail: body.transaction_detail,
        performed_by: access?.contact_name,
        ref_number: access?.subTask?.ticket_number,
      });

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add comment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':token/status')
  async updateStatus(
    @Param('token') token: string,
    @Body() body: { status: string },
  ) {
    try {
      // Get access info before update for logging
      const access = await this.service.findByToken(token);
      const result = await this.service.updateStatus(token, body.status);

      // Activity Log
      const statusLabels = { inprogress: 'กำลังดำเนินการ', completed: 'เสร็จสิ้น' };
      await this.activityLogService.log({
        sub_task_id: access?.subTask?.id,
        complaint_id: access?.subTask?.parent?.complaint_id,
        action_type: 'PUBLIC_UPDATE_STATUS',
        action_detail: `เปลี่ยนสถานะเป็น "${statusLabels[body.status] || body.status}" (จาก Email Link)`,
        performed_by: access?.contact_name,
        ref_number: access?.subTask?.ticket_number,
        metadata: { new_status: body.status },
      });

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
