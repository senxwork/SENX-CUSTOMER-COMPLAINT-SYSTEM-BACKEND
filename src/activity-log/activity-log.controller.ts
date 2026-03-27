import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Get('notifications/:departmentId')
  async getNotifications(
    @Param('departmentId') departmentId: string,
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByDepartment(departmentId, userId, Number(limit) || 30);
  }

  @Get('notifications/:departmentId/unread-count')
  async getUnreadCount(
    @Param('departmentId') departmentId: string,
    @Query('userId') userId: string,
  ) {
    const count = await this.service.countUnread(departmentId, userId);
    return { count };
  }

  @Get('ticket-unread-map')
  async getTicketUnreadMap(
    @Query('departmentId') departmentId: string,
    @Query('ticketIds') ticketIds: string,
  ) {
    const ids = ticketIds ? ticketIds.split(',').filter(Boolean) : [];
    return this.service.countUnreadByTickets(departmentId, ids);
  }

  @Post('notifications/mark-ticket-read')
  async markTicketAsRead(@Body() body: { departmentId: string; ticketId: string; userId?: string }) {
    await this.service.markTicketAsRead(body.departmentId, body.ticketId, body.userId);
    return { success: true };
  }

  @Post('notifications/mark-read')
  async markAsRead(@Body() body: { userId: string; activityLogIds: string[] }) {
    await this.service.markAsRead(body.userId, body.activityLogIds);
    return { success: true };
  }

  @Post('notifications/mark-all-read')
  async markAllAsRead(@Body() body: { userId: string; departmentId: string }) {
    await this.service.markAllAsRead(body.userId, body.departmentId);
    return { success: true };
  }
}
