import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ComplaintListService } from './complaint-list.service';
import { CreateComplaintListDto } from './dto/create-complaint-list.dto';
import { ComplaintJobCatagory } from '../complaint-job-catagory/complaint-job-catagory.entity';
import { UpdateStatusComplaintListDto } from './dto/updateStatus-complaint-list.dto';
import { UpdateComplaintListDto } from './dto/update-complaint-list.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/user/user.service';
import { FilterDataDto } from './dto/filterData.dto';
import { ProjectService } from 'src/project/project.service';
import { ActivityLogService } from '../../activity-log/activity-log.service';
@Controller('complaint-list')
export class ComplaintListController {
  public dataRes: any;
  constructor(
    private complaintService: ComplaintListService,
    private readonly mailerService: MailerService,
    private userService: UserService,
    private projectService: ProjectService,
    private readonly activityLogService: ActivityLogService,
  ) {}
  @Post()
  async allFilter(@Body() body: any, @Query('page') page = 1) {
    return this.complaintService.paginateByFilter(body, page);
  }

  @Post('get-report')
  async getReport(@Body() body: any, @Query('page') page = 1) {
    return this.complaintService.findReport(body, page);
  }

  @Post('department')
  async allFilterByDepartMent(@Body() body: any) {
    return this.complaintService.paginateByFilterByDepartMent(body);
  }

  @Post('create')
async create(@Body() body: CreateComplaintListDto) {
    try {
      console.log(body);
      const emaildata = await this.userService.find();
      const filterByEmail = emaildata.filter((items: any) => {
        return (
          items.jobDepartment?.job_departments_id === body.job_departments_id &&
          items.assign_permission === true
        );
      });
      console.log(filterByEmail);
      const caseNumber = await this.complaintService.generateCaseNumber();
      this.dataRes = await this.complaintService.create({
        case_number: caseNumber,
        job_detail: body.job_detail,
        status: 'open',
        user_created: body.user_created,
        project: body.project_id,
        complaintJobCatagory: body.job_catagory_id,
        subject: body.subject,
        jobDepartment: body.job_departments_id,
        contactChannel: body.contact_channel_id,
        businessUnit: body.business_unit_id,
        customer_name: body.customer_name,
        house_name: body.house_name,
        telephone: body.telephone,
        email: body.email,
        tags: body.tags,
      });

      // Activity Log
      await this.activityLogService.log({
        complaint_id: this.dataRes.complaint_id,
        action_type: 'CREATE_CASE',
        action_detail: `สร้าง Case ใหม่: ${caseNumber}`,
        performed_by: body.user_created,
        ref_number: caseNumber,
      });

      if (this.dataRes.complaint_id && filterByEmail.length > 0) {
        const complaint_id = this.dataRes.complaint_id;
        const complaintData = await this.complaintService.findOne(
          { complaint_id },
          [
            'user_created',
            'jobDepartment',
            'project',
            'complaintJobCatagory',
            'contactChannel',
          ],
        );
        const emailList = [];
        filterByEmail.forEach((element) => {
          emailList.push(element.email);
        });
        console.log(emailList);
        this.mailerService
          .sendMail({
            to: emailList,
            from:
              '"SENX CUSTOMER SERVICE SYSTEM" <victorymanagement.cloud@gmail.com>',
            subject: 'มี แจ้งเรื่องร้องเรียน/ข้อเสนอแนะ ใหม่มาครับ ✔',
            template: 'createComplaint',
            context: {
              dataRes: complaintData,
              dataBody: complaintData,
            },
          })
          .then((success) => {
            console.log(success);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (error) {
      console.log(error);
    }

    return this.dataRes;
  }

  @Post('create-by-other')
async createByOther(@Body() body: CreateComplaintListDto) {
    try {
      console.log(body);
      const emaildata = await this.userService.find();
      const filterByEmail = emaildata.filter((items: any) => {
        return (
          items.jobDepartment?.job_departments_id === body.job_departments_id &&
          items.assign_permission === true
        );
      });
      console.log(filterByEmail);

      // ค้นหา Project จาก project_id field เพื่อดึง id (UUID) มาใช้
      const projectData = await this.projectService.findByProjectId(body.project_id);
      if (!projectData) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: `Project with project_id "${body.project_id}" not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const projectUUID = projectData.id;
      console.log('Found project:', projectData);

      const caseNumber = await this.complaintService.generateCaseNumber();
      this.dataRes = await this.complaintService.create({
        case_number: caseNumber,
        job_detail: body.job_detail,
        status: 'open',
        user_created: body.user_created,
        project: projectUUID,
        complaintJobCatagory: body.job_catagory_id,
        subject: body.subject,
        jobDepartment: body.job_departments_id,
        contactChannel: body.contact_channel_id,
        businessUnit: body.business_unit_id,
        customer_name: body.customer_name,
        house_name: body.house_name,
        telephone: body.telephone,
        email: body.email,
        tags: body.tags,
      });

      // Activity Log
      await this.activityLogService.log({
        complaint_id: this.dataRes.complaint_id,
        action_type: 'CREATE_CASE_EXTERNAL',
        action_detail: `สร้าง Case จาก API ภายนอก: ${caseNumber}`,
        performed_by: body.user_created,
        ref_number: caseNumber,
      });

      if (this.dataRes.complaint_id && filterByEmail.length > 0) {
        const complaint_id = this.dataRes.complaint_id;
        const complaintData = await this.complaintService.findOne(
          { complaint_id },
          [
            'user_created',
            'jobDepartment',
            'project',
            'complaintJobCatagory',
            'contactChannel',
          ],
        );
        const emailList = [];
        filterByEmail.forEach((element) => {
          emailList.push(element.email);
        });
        console.log(emailList);
        this.mailerService
          .sendMail({
            to: emailList,
            from:
              '"SENX CUSTOMER SERVICE SYSTEM" <victorymanagement.cloud@gmail.com>',
            subject: 'มี แจ้งเรื่องร้องเรียน/ข้อเสนอแนะ ใหม่มาครับ ✔',
            template: 'createComplaint',
            context: {
              dataRes: complaintData,
              dataBody: complaintData,
            },
          })
          .then((success) => {
            console.log(success);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (error) {
      console.log(error);
    }

    return this.dataRes;
  }
  // Optimized endpoint - returns complaints with sub-task data included
  @Get('with-subtasks')
  async getAllWithSubTasks() {
    return this.complaintService.findAllWithSubTasks();
  }

  // Get complaints where any sub-task is assigned to the given department
  @Get('by-subtask-department/:departmentId')
  async getBySubTaskDepartment(@Param('departmentId') departmentId: string) {
    return this.complaintService.findBySubTaskDepartment(departmentId);
  }

  @Get(':complaint_id')
  async get(@Param('complaint_id') complaint_id: string) {
    return this.complaintService.findOne({ complaint_id }, [
      'complaintJobCatagory',
      'complaintTransaction',
      'responsible_persons',
      'user_created',
      'jobDepartment',
      'project',
      'complaintAttachedFile',
      'complaintTransaction.complaintTransactionAttachedFile',
      'omPersons',
      'businessUnit',
      'contactChannel',
      'subTasks',
      'subTasks.department'
    ]);
  }

  @Put('update-status/:complaint_id')
async updateStatus(
    @Param('complaint_id') complaint_id: string,
    @Body() body: UpdateStatusComplaintListDto,
  ) {
    const { performed_by, ...updateData } = body as any;
    const resData = await this.complaintService
      .updateData(complaint_id, updateData)
      .then(async (success) => {
        console.log(success);
        const complaint = await this.complaintService.findOne({ complaint_id }, [
          'user_created',
          'jobDepartment',
          'project',
          'complaintJobCatagory',
          'responsible_persons',
          'contactChannel',
        ]);

        // Activity Log
        const statusLabels = { open: 'Open', inprogress: 'กำลังดำเนินการ', completed: 'เสร็จสิ้น' };
        await this.activityLogService.log({
          complaint_id: complaint_id,
          action_type: 'UPDATE_CASE_STATUS',
          action_detail: `เปลี่ยนสถานะ Case เป็น "${statusLabels[body.status] || body.status}"`,
          performed_by: performed_by || null,
          ref_number: complaint?.case_number,
          metadata: { new_status: body.status },
        });

        console.log(complaint);
        this.mailerService
          .sendMail({
            to: complaint.user_created?.email,
            from:
              '"SENX CUSTOMER SERVICE SYSTEM" <victorymanagement.cloud@gmail.com>',
            subject:
              'เรื่องร้องเรียน/ข้อเสนอแนะ มีการเปลี่ยนแปลงสถานะเป็น ' +
              complaint.status +
              '✔',
            template: 'changeStatusComplaint',
            context: {
              dataRes: complaint,
              dataBody: complaint,
            },
          })
          .then((success) => {
            console.log(success);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Please check data and try again',
          },
          HttpStatus.FORBIDDEN,
        );
      });
    console.log(resData);
  }

  @Put('update-om/:complaint_id')
async updateOm(@Param('complaint_id') complaint_id: string, @Body() body: any) {
    console.log(body);
    const resData = await this.complaintService
      .updateData(complaint_id, { omPersons: body.omPersons_id })
      .then(async (success) => {
        // Activity Log
        await this.activityLogService.log({
          complaint_id: complaint_id,
          action_type: 'ASSIGN_OM',
          action_detail: `มอบหมาย OM`,
          performed_by: body.performed_by || null,
          metadata: { om_persons_id: body.omPersons_id },
        });
        console.log(success);
      })
      .catch((err) => {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Please check data and try again',
          },
          HttpStatus.FORBIDDEN,
        );
      });
  }

  @Put('update-cat/:complaint_id')
async updateCat(
    @Param('complaint_id') complaint_id: string,
    @Body() body: any,
  ) {
    console.log(body);
    const resData = await this.complaintService
      .updateData(complaint_id, {
        complaintJobCatagory: body.job_catagory_id,
        businessUnit: body.businessUnit_id,
        contactChannel: body.contactChannel_id,
        project: body.project_id,
        customer_name:body.customer_name,
        house_name:body.house_name,
        telephone:body.telephone,
        email:body.email,
        job_detail:body.job_detail,
        tags:body.tags,
      })
      .then(async (success) => {
        // Activity Log
        await this.activityLogService.log({
          complaint_id: complaint_id,
          action_type: 'UPDATE_CASE_INFO',
          action_detail: `แก้ไขข้อมูล Case`,
          performed_by: body.performed_by || null,
        });
        console.log(success);
      })
      .catch((err) => {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Please check data and try again',
          },
          HttpStatus.FORBIDDEN,
        );
      });
  }

  @Put('assign-work/:complaint_id')
async AssignWork(
    @Param('complaint_id') complaint_id: string,
    @Body('responsible_persons') ids: string[],
    @Body('performed_by') performed_by: string,
  ) {
    const complaint = await this.complaintService.findOne({ complaint_id }, [
      'user_created',
      'jobDepartment',
      'project',
      'complaintJobCatagory',
      'responsible_persons',
      'contactChannel',
    ]);

    if (ids.length > 0) {
      const emaildata = await this.userService.findAll(ids);
      const emailList = [];
      const emailListName = [];
      emaildata.forEach((element) => {
        emailList.push(element.email);
        emailListName.push(element.first_name_last_name);
      });

      const resData = await this.complaintService.create({
        ...complaint,
        status: 'inprogress',
        responsible_persons: ids.map((user_id) => ({ user_id })),
      });

      // Activity Log
      await this.activityLogService.log({
        complaint_id: complaint_id,
        action_type: 'ASSIGN_WORK',
        action_detail: `มอบหมายงานให้: ${emailListName.join(', ')}`,
        performed_by: performed_by || null,
        ref_number: complaint?.case_number,
        metadata: { responsible_persons: ids, names: emailListName },
      });

      console.log(complaint.user_created?.email);
      const name_assign = emailListName.toString();
      if (resData.complaint_id) {
        this.mailerService
          .sendMail({
            to: emailList,
            from:
              '"SENX CUSTOMER SERVICE SYSTEM" <victorymanagement.cloud@gmail.com>',
            subject:
              'มี เรื่องร้องเรียน/ข้อเสนอแนะt ที่คุณได้รับมอบหมายให้ดำเนินการครับ ✔',
            template: 'assignComplaint',
            context: {
              dataRes: complaint,
              dataBody: complaint,
              name_assign: name_assign,
            },
          })
          .then((success) => {
            console.log(success);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }

  @Put('update/:complaint_id')
async update(
    @Param('complaint_id') complaint_id: string,
    @Body('date_assignment') date_assignment: string,
    @Body('date_job_completed') date_job_completed: string,
    @Body('date_job_approved') date_job_approved: string,
    @Body('job_detail') job_detail: string,
    @Body('complaintJobCatagory') complaintJobCatagory: string,
    @Body('project') project: string,
    @Body('complaintTakeTime') complaintTakeTime: string,
    @Body('due_date') due_date: string,
    @Body('job_audit') job_audit: string,
    @Body('responsible_persons') ids: string[],
  ) {
    await this.complaintService.updateData(complaint_id, {
      date_assignment,
      date_job_completed,
      date_job_approved,
      job_detail,
      complaintJobCatagory,
      project,
      complaintTakeTime,
      due_date,
      job_audit,
    });
    const complaint = await this.complaintService.findOne({ complaint_id });

    // Activity Log
    await this.activityLogService.log({
      complaint_id: complaint_id,
      action_type: 'UPDATE_CASE',
      action_detail: `อัพเดทข้อมูล Case`,
      ref_number: complaint?.case_number,
    });

    return this.complaintService.create({
      ...complaint,
      responsible_persons: ids.map((user_id) => ({ user_id })),
    });
  }
}
