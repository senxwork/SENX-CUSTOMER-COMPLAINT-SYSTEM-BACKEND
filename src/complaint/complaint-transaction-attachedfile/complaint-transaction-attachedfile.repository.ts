/* eslint-disable prettier/prettier */
import { EntityRepository, Repository } from 'typeorm';
import { ComplaintTransactionAttachedFile } from './complaint-transaction-attachedfile.entity';
import { CreateComplaintAttachedFileDto } from './dto/create.complaint-attached-file.dto';



@EntityRepository(ComplaintTransactionAttachedFile)
export class ComplaintTransactionAttachedFileRepository extends Repository<ComplaintTransactionAttachedFile> {

  async createComplaintImageBefore(createComplaintAttachedFileDto: CreateComplaintAttachedFileDto): Promise<ComplaintTransactionAttachedFile> {

    return
  }
}
