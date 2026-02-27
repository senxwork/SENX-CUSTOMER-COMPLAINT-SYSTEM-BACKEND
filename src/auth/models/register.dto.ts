import { IsEmail, IsNotEmpty, isNotEmpty } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    first_name: string;

    @IsNotEmpty()
    username: string
    @IsNotEmpty()
    last_name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    password_confirm: string;
    @IsNotEmpty()
    first_name_en: string;
    @IsNotEmpty()
    last_name_en: string;

    nickname: string;

    mobile: string;

    line_id: string;

    title: string;
    @IsNotEmpty()
    staff_type_id: string;
    @IsEmail()
    email_company: string;
    @IsNotEmpty()
    role_id: number;
}
