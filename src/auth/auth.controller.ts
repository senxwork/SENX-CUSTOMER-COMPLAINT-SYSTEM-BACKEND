import {
    BadRequestException,
    Body, ClassSerializerInterceptor,
    Controller,
    Get,
    NotFoundException,
    Post, Put,
    Req,
    Res, UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserService } from "../user/user.service";
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from "./models/register.dto";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from 'express';
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class AuthController {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private authService: AuthService
    ) {
    }

    @Post('register')
    async register(@Body() body: any) {
        console.log(body)
        const hashed = await bcrypt.hash(body.password, 12);
        const username = body.username
        const user = await this.userService.findOne({ username });
        if (user) {
            throw new NotFoundException('Username มีการใช้งานในระบบแล้ว');
        }
        return this.userService.create({
            username: body.username,
            email: body.email,
            mobile: body.mobile,
            first_name_last_name: body.first_name_last_name,
            password: hashed,
            role: '38af21d1-fd4d-4451-b8ba-3c0c8375e398',
            department:body.department,
            jobDepartment:'d6fe6a0a-cb36-405a-87a0-dd4a981c2a1f'
        });
    }
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string,
        @Res({ passthrough: true }) response: Response
    ) {
        const user = await this.userService.findOne({ username });
        

        if (!user) {
            throw new NotFoundException('ไม่พบผู้ใช้งานนี้');
        }

        if (user.active === false) {
            throw new NotFoundException('ผู้ใช้งานนี้ถูกปิดการใช้งาน');
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new BadRequestException('รหัสผ่านไม่ถูกต้อง');
        }

        const jwt = await this.jwtService.signAsync({ user_id: user.user_id });

         response.cookie('jwt', jwt, { httpOnly: true });
        const accessToken: string = await this.jwtService.signAsync({ user_id: user.user_id });
        return user;
    }

    @UseGuards(AuthGuard)
    @Get('user')
    async user(@Req() request: Request) {
        const user_id = await this.authService.userId(request);
        return this.userService.findOne({ user_id }, ['role','role.permissions','jobDepartment']);
    }


    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt');

        return {
            message: 'Success'
        }
    }
}
