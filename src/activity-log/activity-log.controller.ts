import { Controller, Get, Param, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get('by-complaint/:complaintId')
  async getByComplaint(
    @Param('complaintId') complaintId: string,
    @Query('subTaskIds') subTaskIds?: string,
  ) {
    const ids = subTaskIds ? subTaskIds.split(',').filter(Boolean) : [];
    return this.service.findByComplaintWithSubTasks(complaintId, ids);
  }
}
