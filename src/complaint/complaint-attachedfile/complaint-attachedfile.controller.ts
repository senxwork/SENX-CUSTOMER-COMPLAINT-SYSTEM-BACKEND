import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ComplaintAttachedfileService } from './complaint-attachedfile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('complaint-attachedfile')
export class ComplaintAttachedfileController {
  constructor(
    private complaintAttachedfileService: ComplaintAttachedfileService,
  ) {}
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/complaint_attachedfile',
        filename: function (req, file, cb) {
          var uuid = require('uuid');
          let extension = extname(file.originalname);
          cb(null, 'before' + '-' + uuid.v4() + extension);
        },
      }),
    }),
  )
  @Post('/file/:complaintListComplaintId')
  uploadFile(
    @Param('complaintListComplaintId') complaintListComplaintId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
      console.log(file)
    const filename = file.filename.toString();
    const filenameType = extname(file.originalname);
     const originalname = file.originalname
    return this.complaintAttachedfileService.createAttachedFile(
      complaintListComplaintId,
      filename,
      filenameType,originalname
    );
  }
  @Get('/file/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads/complaint_attachedfile' });
  }
}
