
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRequestFormDto {

    @IsNotEmpty()
    prefix: string;
    @IsNotEmpty()
    first_name_th: string;
    @IsNotEmpty()
    last_name_th: string;
    @IsNotEmpty()
    first_name_en: string;
    @IsNotEmpty()
    last_name_en: string;
    @IsNotEmpty()
    telephone: string;
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    request_category: boolean;
    @IsNotEmpty()
    request_system: string;
    remark: string;
    @IsNotEmpty()
    projects: any;

}
