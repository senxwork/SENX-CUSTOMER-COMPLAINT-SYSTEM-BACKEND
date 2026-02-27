import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintSubTaskTransectionFile } from './complaint-sub-task-transection-file.entity';

@Injectable()
export class ComplaintSubTaskTransectionFileService {
  constructor(
    @InjectRepository(ComplaintSubTaskTransectionFile)
    private readonly fileRepository: Repository<ComplaintSubTaskTransectionFile>,
  ) {}

  async createAttachedFile(
    transactionId: string,
    fileName: string,
    fileType: string,
  ): Promise<any> {
    const file = this.fileRepository.create({
      file_name: fileName,
      file_type: fileType,
      subTaskTransaction: { id: transactionId } as any,
    });
    return this.fileRepository.save(file);
  }

  async findByTransactionId(transactionId: string): Promise<ComplaintSubTaskTransectionFile[]> {
    return this.fileRepository.find({
      where: { subTaskTransaction: { id: transactionId } },
    });
  }
}
