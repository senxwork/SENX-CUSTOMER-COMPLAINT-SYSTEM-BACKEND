import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { APP_GUARD } from "@nestjs/core";
import { PermissionGuard } from "./permission/permission.guard";
import { AuthApiModule } from './auth-api/auth-api.module';
import { PermissionCategoryModule } from './permission-category/permission-category.module';
import { ProjectModule } from './project/project.module';
import { FeatureModule } from './feature/feature.module';
import { StaffTypeModule } from './staff-type/staff-type.module';
import { ComplaintListModule } from './complaint/complaint-list/complaint-list.module';

import { ComplaintTransactionModule } from './complaint/complaint-transaction/complaint-transaction.module';

import { ComplaintJobCatagoryModule } from './complaint/complaint-job-catagory/complaint-job-catagory.module';
import { ComplaintTransactionAttachedfileModule } from './complaint/complaint-transaction-attachedfile/complaint-transaction-attachedfile.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ComplaintDeletionRequestModule } from './complaint/complaint-deletion-request/complaint-deletion-request.module';
import { RequestFormModule } from './request-form/request-form.module';
import { HttpModule } from '@nestjs/axios';
import { PositionModule } from './position/position.module';
import { JobDepartmentModule } from './job-department/job-department.module';
import { ComplaintAttachedfileModule } from './complaint/complaint-attachedfile/complaint-attachedfile.module';
import { ContactChannelModule } from './complaint/contact-channel/contact-channel.module';
import { BusinessUnitModule } from './complaint/business-unit/business-unit.module';
import { OmPersonsModule } from './complaint/om-persons/om-persons.module';
import { DepartmentModule } from './complaint/departments/department.module';
import { ComplaintSubTaskModule } from './complaint/complaint-sub-task/complaint-sub-task.module';
import { ComplaintSubTaskTransactionModule } from './complaint/complaint-sub-task-transaction/complaint-sub-task-transaction.module';
import { ComplaintSubTaskTransectionFileModule } from './complaint/complaint-sub-task-transection-file/complaint-sub-task-transection-file.module';
import { TagModule } from './complaint/tags/tag.module';
import { TicketCategoryModule } from './complaint/ticket-category/ticket-category.module';
import { TicketSubCategoryModule } from './complaint/ticket-sub-category/ticket-sub-category.module';
import { PublicTicketAccessModule } from './complaint/public-ticket-access/public-ticket-access.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  imports: [
    UserModule,
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'complaint.center.notification@gmail.com',
          pass: 'bekw fapq elma upzl'
        }
      },
      defaults: {
        from: '"CUSTOMER COMPLAINT CENTER" <complaint.center.notification@gmail.com>',
      },
      template: {
        dir: process.cwd() + '/template/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
   TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
       database: 'customer_service_db_last',
      autoLoadEntities: true,
      synchronize: true, // TEMPORARY: Run migration-followup-to-complaint.sql first, then set back to true
    }),
   /*   TypeOrmModule.forRoot({
      type: 'postgres',
      host: '172.18.0.2',
      port: 5432,
      username: 'root',
      password: '2023@Rasa',
      database: 'costomer_complant_center_db',
      autoLoadEntities: true,
      synchronize: true,
    }), */
  
    AuthModule,
    CommonModule,
    RoleModule,
    PermissionModule,
    AuthApiModule,
    PermissionCategoryModule,
    ProjectModule,
    FeatureModule,
    StaffTypeModule,
    ComplaintListModule,
    ComplaintTransactionModule,
    ComplaintJobCatagoryModule,
    ComplaintTransactionAttachedfileModule,
    ComplaintDeletionRequestModule,
    RequestFormModule,
    HttpModule,
    PositionModule,
    JobDepartmentModule,
    ComplaintAttachedfileModule,
    ContactChannelModule,
    BusinessUnitModule,
    OmPersonsModule,
    DepartmentModule,
    ComplaintSubTaskModule,
    ComplaintSubTaskTransactionModule,
    ComplaintSubTaskTransectionFileModule,
    TagModule,
    TicketCategoryModule,
    TicketSubCategoryModule,
    PublicTicketAccessModule,
    SystemSettingsModule,
    ActivityLogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ],

})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        '/complaint-attachedfile/file/(.*)',
        '/complaint-transaction-attachedfile/file/(.*)',
        '/complaint-sub-task-transection-file/file/(.*)',
        '/api/complaint-attachedfile/file/(.*)',
        '/api/complaint-transaction-attachedfile/file/(.*)',  
        '/api/complaint-sub-task-transection-file/file/(.*)',
        '/users/forgot-password',
        '/users/reset-password/(.*)',
        '/api/users/forgot-password',
        '/api/users/reset-password/(.*)',
        '/public/(.*)',
        '/api/public/(.*)',
        '/complaint-sub-task/file/(.*)',
        '/api/complaint-sub-task/file/(.*)',
        '/api/users/file/(.*)'
      )
      .forRoutes('');
  }
}
