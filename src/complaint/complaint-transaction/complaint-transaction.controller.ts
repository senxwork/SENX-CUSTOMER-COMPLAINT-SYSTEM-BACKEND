import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ComplaintTransactionService } from './complaint-transaction.service';
import { ComplaintTransactionDto } from './dto/create.complaint-transaction.dto';
import { ComplaintTransaction } from './complaint-transaction.entity';
import { ActivityLogService } from '../../activity-log/activity-log.service';

@Controller('complaint-transaction')
export class ComplaintTransactionController {
  constructor(
    private complaintTransactionService: ComplaintTransactionService,
    private readonly activityLogService: ActivityLogService,
  ) {}
  @Post('/create/:complaintListComplaintId')
  public async createProject(
    @Param('complaintListComplaintId') complaintListComplaintId: string,
    @Body() complaintTransactionDto: ComplaintTransactionDto,
  ): Promise<ComplaintTransaction> {
    try {
      const result = await this.complaintTransactionService.updatebackground_imageFloor(
        complaintListComplaintId,
        complaintTransactionDto,
      );

      // Activity Log
      await this.activityLogService.log({
        complaint_id: complaintListComplaintId,
        action_type: 'ADD_CASE_COMMENT',
        action_detail: complaintTransactionDto.complaint_transaction_detail,
        performed_by: (complaintTransactionDto as any).performed_by || null,
      });

      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Please check data and try again',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  @Get(':complaint_id')
  async get(@Param('complaint_id') complaint_id: string) {
    return this.complaintTransactionService.getData(complaint_id);
  }
}
