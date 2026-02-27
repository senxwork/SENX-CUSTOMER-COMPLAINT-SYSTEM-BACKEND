/* eslint-disable prettier/prettier */
import { EntityRepository, Repository } from 'typeorm';
import { ComplaintAttachedFile } from './complaint-attachedfile.entity';
import { CreateComplaintListAttachedFileDto } from './dto/create.complaint-attached-file.dto';




@EntityRepository(ComplaintAttachedFile)
export class ComplaintAttachedFileRepository extends Repository<ComplaintAttachedFile> {

  async createComplaintImageBefore(createComplaintListAttachedFileDto: CreateComplaintListAttachedFileDto): Promise<ComplaintAttachedFile> {

    return
  }
}
