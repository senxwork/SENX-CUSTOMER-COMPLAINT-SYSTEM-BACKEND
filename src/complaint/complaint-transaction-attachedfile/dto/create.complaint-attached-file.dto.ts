/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateComplaintAttachedFileDto {
  @IsNotEmpty()
  file_name: string;
  @IsNotEmpty()
  file_type: string;
 @IsNotEmpty()
complaintTransactionId:string

}
