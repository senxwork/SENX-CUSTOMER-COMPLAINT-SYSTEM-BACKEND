/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ComplaintTransactionDto {
  @IsNotEmpty()
  complaint_transaction_detail: string;
  user_created: any;
}
