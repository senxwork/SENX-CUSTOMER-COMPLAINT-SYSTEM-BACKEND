import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ limit: '500mb' }));
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://css.senxgroup.com',

    ],
    credentials: true
  });
  const config = new DocumentBuilder()
    .setTitle('Customer Service Software API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('Customer Service Software API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(1882);
}

bootstrap();
