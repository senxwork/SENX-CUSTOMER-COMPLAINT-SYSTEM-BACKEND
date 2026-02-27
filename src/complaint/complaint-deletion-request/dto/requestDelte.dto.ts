/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RequestDelteDto {
    @IsNotEmpty()
    complaint_id: string;
    @IsNotEmpty()
    complaintJobCatagory: {
        catagory_name: string
    };
    deletion_request: string
    @IsNotEmpty()
    userReqest: string;
    @IsNotEmpty()
    project: {
        project_name_th: string
    };
    status:string
}
