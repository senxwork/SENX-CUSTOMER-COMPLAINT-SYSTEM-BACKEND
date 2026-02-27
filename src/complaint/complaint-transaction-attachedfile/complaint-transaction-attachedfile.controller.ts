import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ComplaintTransactionAttachedfileService } from './complaint-transaction-attachedfile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('complaint-transaction-attachedfile')
export class ComplaintTransactionAttachedfileController {
  constructor(private complaintTransactionAttachedfileService: ComplaintTransactionAttachedfileService) {}
    @UseInterceptors(
      FileInterceptor('file', {

        storage: diskStorage({
          destination: './uploads/complaint_transaction',
          filename: function (req, file, cb) {
              var uuid = require('uuid');
             let extension = extname(file.originalname)
            cb(null,'before'+'-'+ uuid.v4()+ extension);
          },
        }),
      }),
    )
    @Post('/file/:complaintTransactionId')
    uploadFile(@Param('complaintTransactionId') complaintTransactionId: string,@UploadedFile() file: Express.Multer.File) : Promise<string>{
      const filename = file.filename.toString()
      const filenameType = extname(file.originalname)
      return this.complaintTransactionAttachedfileService.createAttachedFile(complaintTransactionId,filename,filenameType);
    }
    @Get('/file/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads/complaint_transaction' });

  }}
