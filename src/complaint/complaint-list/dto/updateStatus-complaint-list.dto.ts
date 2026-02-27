import { IsEmail, IsNotEmpty, isNotEmpty } from "class-validator";

export class UpdateStatusComplaintListDto {
    @IsNotEmpty()
    status: string;
    date_job_completed:Date
 


}
