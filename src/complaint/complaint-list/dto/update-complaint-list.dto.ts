import { IsEmail, IsNotEmpty, isNotEmpty } from "class-validator";

export class UpdateComplaintListDto {
    @IsNotEmpty()
    date_assignment: string;
    date_job_completed: string
    date_job_approved: string
    @IsNotEmpty()
    job_detail: string
    complaintJobCatagory: string
    project: string
    complaintTakeTime: string
    due_date:string


}
