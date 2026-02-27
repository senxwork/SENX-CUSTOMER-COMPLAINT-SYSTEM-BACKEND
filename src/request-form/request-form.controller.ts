import { Body, Controller, Get, Post } from '@nestjs/common';
import { RequestFormService } from './request-form.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateRequestFormDto } from './dto/requestForm.dto';

@Controller('request-form')
export class RequestFormController {
    emailList = 'thawonp@sena.co.th'
    constructor(private requestFormService: RequestFormService, private readonly mailerService: MailerService) {
    }
    @Post()
    createRequest(@Body() body: CreateRequestFormDto,): Promise<string> {
        const { ...data } = body;
        try {
            try {

                return this.requestFormService.create({
            ...data,
        });
            } catch (error) {

            }
            /* 
                        this.mailerService.sendMail({
                            to: this.emailList, // List of receivers email address
                            from: '"Sen X Online System" <victorymanagement.cloud@gmail.com>', // Senders email address
                            subject: 'แจ้งเตือนขอใช้บริการผู้ใช้งานในระบบสารสนเทศ',
                            template: 'requestForm', // The `.pug` or `.hbs` extension is appended automatically.
                            context: {  // Data to be sent to template engine.
                                dataBody: body
                            },
                        }).then((success) => {
                            console.log(success)
                        }) */
            /*   .catch((err) => {
                  console.log(err)
              }); */
        } catch (error) {

        }
        return;
    }
    @Get()
    async all() {
        return this.requestFormService.all();
    }
}
