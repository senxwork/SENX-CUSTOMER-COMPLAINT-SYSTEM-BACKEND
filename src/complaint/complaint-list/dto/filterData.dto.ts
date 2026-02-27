import { IsEmail, IsNotEmpty, isNotEmpty } from "class-validator";

export class FilterDataDto {
    targetMonth: string;
    date_job_completed: string
    date_job_approved: string
    job_detail: string
    followupJobCatagoryId: string
    status: string
    user_created: string
    project: string
    projectPermistion:string
    responsible_persons:any
    
   


}
