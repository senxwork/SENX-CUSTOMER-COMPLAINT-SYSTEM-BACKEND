import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.entity';
import * as bcrypt from 'bcryptjs';
import { UserCreateDto } from './models/user-create.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserUpdateDto } from './models/user-update.dto';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { HasPermission } from '../permission/has-permission.decorator';
import { STATUS_CODES } from 'http';
import { UserEditeDto } from './models/user-edit.dto';
import { UserChangePasswordDto } from './models/user-changepassword.dto';
import { UserLineActivateDto } from './models/line-activated.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  private readonly FRONTEND_URL = 'https://css.senxgroup.com';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('list')
  async allUser(@Body() body: any, @Query('page') page = 1) {
    return this.userService.paginateUser(body, page, ['role','jobDepartment']);
  }
  @Get()
  async all(@Query('page') page = 1) {
    return this.userService.paginate(page, ['role','jobDepartment']);
  }
  @Get('userlist')
  async allList(@Body() body: any) {
    return this.userService.all(['role', 'jobDepartment']);
  }

  @Post()
  async create(@Body() body: UserCreateDto): Promise<User> {
    const password = await bcrypt.hash('1234', 12);

    const { role_id, ...data } = body;

    return this.userService.create({
      ...data,
      password,
      role: { id: role_id },
    });
  }

  @Post('filter')
  async allUserByRole(@Body() body: any, @Query('page') page = 1) {
    return this.userService.paginateUserFilterByRole(body, page, ['role','jobDepartment']);
  }

  @Post('filter-department')
  async allUserByDepartment(@Body() body: any) {
 
    return this.userService.paginateUserFilterByDepartment(body);
  }


  @Get(':user_id')
  @HasPermission('users')
  async get(@Param('user_id') user_id: number) {
    return this.userService.findOne({ user_id }, ['role', 'jobDepartment']);
  }

  @Put('info')
  async updateInfo(@Req() request: Request, @Body() body: UserUpdateDto) {
    const user_id = await this.authService.userId(request);

    await this.userService.update(user_id, body);

    return this.userService.findOne({ user_id });
  }

  @Put('edit')
  async editUser(@Req() request: Request, @Body() body: UserEditeDto) {
    const user_id = await this.authService.userId(request);

    await this.userService.update(user_id, body);

    return this.userService.findOne({ user_id });
  }

  @Put('password')
  async updatePassword(
    @Req() request: Request,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    if (!password) {
      throw new BadRequestException('โปรดกรอกรหัสผ่าน!');
    }
    if (!password_confirm) {
      throw new BadRequestException('โปรดกรอกยืนยันรหัสผ่าน!');
    }
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    const user_id = await this.authService.userId(request);

    const hashed = await bcrypt.hash(password, 12);
    await this.userService.update(user_id, {
      password: hashed,
    });
    const userDetail = await this.userService.findOne({ user_id });
    return {
      user: userDetail,
      message: 'เปลี่ยนรหัสผ่าน เสร็จสิ้น',
      STATUS_CODES: 200,
    };
  }

  @Put('change-password/:user_id')
  @HasPermission('users')
  async changePassword(
    @Param('user_id') user_id: number,
    @Body() body: UserChangePasswordDto,
  ) {
    
    const { password, password_confirm } = body;
    console.log(body);
    if (!password) {
      throw new BadRequestException('โปรดกรอกรหัสผ่าน!');
    }
    if (!password_confirm) {
      throw new BadRequestException('โปรดกรอกยืนยันรหัสผ่าน!');
    }
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    const hashed = await bcrypt.hash(password, 12);
    await this.userService.update(user_id, {
      password: hashed,
    });
    const userDetail = await this.userService.findOne({ user_id });
    return {
      user: userDetail,
      message: 'เปลี่ยนรหัสผ่าน เสร็จสิ้น',
      STATUS_CODES: 200,
    };
  }

 
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('กรุณากรอกอีเมล์');
    }

    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new BadRequestException('ไม่พบอีเมล์นี้ในระบบ');
    }

    const token = this.jwtService.sign(
      { userId: user.user_id },
      { expiresIn: '1h' },
    );
    const url = `${this.FRONTEND_URL}/sessions/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - Customer Complaint Center',
      template: 'resetpassword',
      context: {
        name: user.first_name_last_name,
        url: url,
      },
    });

    return { message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล์ของคุณแล้ว' };
  }

  @Put('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    if (!password || !password_confirm) {
      throw new BadRequestException('กรุณากรอกรหัสผ่าน');
    }
    if (password !== password_confirm) {
      throw new BadRequestException('รหัสผ่านไม่ตรงกัน');
    }

    try {
      const { userId } = this.jwtService.verify(token);
      const hashed = await bcrypt.hash(password, 12);
      await this.userService.update(userId, { password: hashed });
      return { message: 'รีเซ็ตรหัสผ่านสำเร็จ' };
    } catch (e) {
      throw new BadRequestException('ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอรีเซ็ตรหัสผ่านใหม่');
    }
  }

  @Put(':user_id')
  @HasPermission('users')
  async update(
    @Param('user_id') user_id: number,
    @Body() body: UserUpdateDto,
    
  ) {
     
    const {
      role_id,
      first_name_last_name,
      email,
      assign_permission,
      job_departments_id,
      department,
      mobile,
      active,
    } = body;
    await this.userService.update(user_id, {
      email: email,
      assign_permission: assign_permission,
      mobile: mobile,
      active: active,
      department:department,
      first_name_last_name:first_name_last_name,
      role: { id: role_id },
      jobDepartment: { job_departments_id: job_departments_id },
    });

    return this.userService.findOne({ user_id });
  }
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile_image',
        filename: function (req, file, cb) {
          var uuid = require('uuid');
          let extArray = file.mimetype.split('/');
          let extension = extArray[extArray.length - 1];
          cb(null, 'profile_image' + '-' + uuid.v4() + '.' + extension);
        },
      }),
    }),
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile_image',
        filename: function (req, file, cb) {
          var uuid = require('uuid');
          let extArray = file.mimetype.split('/');
          let extension = extArray[extArray.length - 1];
          cb(null, 'profile_image' + '-' + uuid.v4() + '.' + extension);
        },
      }),
    }),
  )
  @Put('/file/:user_id')
  ImageProfileUser(
    @Param('user_id') user_id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    const filename = file.filename.toString();
    return this.userService.update(user_id, { profile_image: filename });
  }
  @Get('/file/:imgpath')
  GetImageProfileUser(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads/profile_image' });
  }

  @Delete(':id')
  @HasPermission('users')
  async delete(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
