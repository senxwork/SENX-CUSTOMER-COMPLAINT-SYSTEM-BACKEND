import { IsEmail, IsNotEmpty, isNotEmpty } from "class-validator";

export class CreateComplaintListDto {
    @IsNotEmpty()
    job_detail: string
    job_catagory_id: string
    status: string
    user_created: string
    project_id: string
    subject:string
    job_departments_id:string
    contact_channel_id:string
    business_unit_id:string
     customer_name:string
    house_name:string
    telephone:string
    email:string
    tags:string[]
    parent_id:string
}
