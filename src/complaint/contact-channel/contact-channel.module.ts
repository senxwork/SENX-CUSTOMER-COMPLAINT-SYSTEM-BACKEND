import { Module } from '@nestjs/common';
import { ContactChannelService } from './contact-channel.service';
import { ContactChannelController } from './contact-channel.controller';
import { ContactChannel } from './contact-channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
imports: [TypeOrmModule.forFeature([ContactChannel])],
  providers: [ContactChannelService],
  controllers: [ContactChannelController]
})
export class ContactChannelModule {}
