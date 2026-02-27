/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateComplaintListAttachedFileDto {
  @IsNotEmpty()
  file_name: string;
  @IsNotEmpty()
  file_type: string;
  @IsNotEmpty()
  complaintListComplaintId: string;
   @IsNotEmpty()
  originalname:any
}
