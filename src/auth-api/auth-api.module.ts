import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './apiKey.strategy';
import { AuthApiService } from './auth-api.service';


@Module({
  imports: [PassportModule],
  providers: [AuthApiService, ApiKeyStrategy],
})
export class AuthApiModule {}
