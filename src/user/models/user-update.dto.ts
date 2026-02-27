import { IsNotEmpty } from "class-validator";

export class UserUpdateDto {
    first_name_last_name?: string;
    email?: string;
    role_id?: number;
    job_departments_id?:string
    username?:string
    assign_permission?:string
    mobile?:string
    active?:string
    department?:string
   
   
}




