import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ComplaintSubTaskTransectionFileService } from './complaint-sub-task-transection-file.service';

@Controller('complaint-sub-task-transection-file')
export class ComplaintSubTaskTransectionFileController {
  constructor(
    private readonly fileService: ComplaintSubTaskTransectionFileService,
  ) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/complaint_sub_task_transaction',
        filename: function (req, file, cb) {
          const uuid = require('uuid');
          const extension = extname(file.originalname);
          cb(null, 'subtask-tx-' + uuid.v4() + extension);
        },
      }),
    }),
  )
  @Post('/file/:transactionId')
  uploadFile(
    @Param('transactionId') transactionId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const filename = file.filename.toString();
    const filenameType = extname(file.originalname);
    return this.fileService.createAttachedFile(transactionId, filename, filenameType);
  }

  @Get('/file/:imgpath')
  seeUploadedFile(@Param('imgpath') image: string, @Res() res: any) {
    return res.sendFile(image, { root: './uploads/complaint_sub_task_transaction' });
  }
}
