import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ComplaintAttachedFileRepository } from './complaint-attachedfile.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ComplaintAttachedfileService {
  constructor(
    @InjectRepository(ComplaintAttachedFileRepository)
    private complaintFileRepository: ComplaintAttachedFileRepository,
  ) {}
  async createAttachedFile(
    complaintListComplaintId: string,
    file_name: string,
    filenameType: string,
    originalname: string,
  ): Promise<any> {
    try {
      await this.complaintFileRepository.save({
        complaintListComplaintId: complaintListComplaintId,
        file_name: file_name,
        file_type: filenameType,originalname
      });
      return {
        massage: ` already Upload File`,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,

          error: error,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
