import { IsEmail, IsNotEmpty } from "class-validator";

export class UserCreateDto {
    @IsNotEmpty()
    first_name: string;
    @IsNotEmpty()
    username: string
    @IsNotEmpty()
    last_name: string;
    first_name_en: string;
    first_name_last_name: string
    last_name_en: string;
    nickname: string;
    mobile: string;
    line_id: string;
    title: string;
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsEmail()
    email_company: string;

    @IsNotEmpty()
    role_id: number;
   

}