import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
