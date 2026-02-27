import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplaintTransactionAttachedFileRepository } from './complaint-transaction-attachedfile.repository';

@Injectable()
export class ComplaintTransactionAttachedfileService {
    constructor(
        @InjectRepository(ComplaintTransactionAttachedFileRepository)
        private complaintTransactionAttachedFileRepository: ComplaintTransactionAttachedFileRepository,


    ) { }
    async createAttachedFile(
        complaintTransactionId: string,
        file_name: string,
        filenameType:string

    ): Promise<any> {
        try {


            await this.complaintTransactionAttachedFileRepository.save({
                complaintTransactionId: complaintTransactionId,
                file_name: file_name,
                file_type: filenameType,
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
