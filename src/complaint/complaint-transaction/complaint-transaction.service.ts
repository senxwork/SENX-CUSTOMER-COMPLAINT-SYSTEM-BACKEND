import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ComplaintTransactionRepository } from './complaint-transaction.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplaintTransactionDto } from './dto/create.complaint-transaction.dto';

@Injectable()
export class ComplaintTransactionService {
  constructor(
    @InjectRepository(ComplaintTransactionRepository)
    private complaintTransactionRepository: ComplaintTransactionRepository,
  ) { }
  async updatebackground_imageFloor(
    complaintListComplaintId: string,
    complaintTransactionDto: ComplaintTransactionDto

  ): Promise<any> {
    try {


      const res = await this.complaintTransactionRepository.save({
        complaintListComplaintId: complaintListComplaintId,
        complaint_transaction_detail: complaintTransactionDto.complaint_transaction_detail,
         user_created: complaintTransactionDto.user_created

      });
      return {
        res,
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

async getData(condition): Promise<any> {
    return this.complaintTransactionRepository.find({
      where: { complaintListComplaintId:condition },
      relations:['user_created','complaintTransactionAttachedFile']
    });
  }
}
