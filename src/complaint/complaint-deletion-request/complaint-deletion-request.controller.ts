import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RequestDelteDto } from './dto/requestDelte.dto';
import { ComplaintDeletionRequestService } from './complaint-deletion-request.service';

@Controller('complaint-deletion-request')
export class ComplaintDeletionRequestController {
    emailList = 'thawonp@sena.co.th'
    constructor(private readonly mailerService: MailerService, private complaintDeletionRequestService: ComplaintDeletionRequestService) { }
    @Post()
    requestDelete(@Body() body: RequestDelteDto,): Promise<string> {

        try {
            try {
                this.complaintDeletionRequestService.create({
                    complaintJobCatagory: body.complaintJobCatagory.catagory_name,
                    deletion_request: body.deletion_request,
                    project: body.project.project_name_th,
                    complaintListComplaintId: body.complaint_id,
                    status: body.status,
                    userReqest: body.userReqest,
                    system_name: 'Complaint List'

                });
            } catch (error) {

            }

            this.mailerService.sendMail({
                to: this.emailList, // List of receivers email address
                from: '"Sen X Online System" <victorymanagement.cloud@gmail.com>', // Senders email address
                subject: 'แจ้งเตือนขอลบข้อมูล',
                template: 'deleteReqeus', // The `.pug` or `.hbs` extension is appended automatically.
                context: {  // Data to be sent to template engine.
                    dataBody: body
                },
            }).then((success) => {
                console.log(success)
            })
                .catch((err) => {
                    console.log(err)
                });
        } catch (error) {

        }
        return;
    }
    @Get('/:complaintListComplaintId')
    async all(@Param('complaintListComplaintId') complaintListComplaintId: any) {
        return await this.complaintDeletionRequestService.findOneofRequestDelete(complaintListComplaintId);

    }
}
