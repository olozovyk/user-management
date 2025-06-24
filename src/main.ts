import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { AppModule } from '@modules/app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '@common/filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { requestsLogger } from './middlewares';

async function bootstrap() {
  process.env.TZ = 'UTC';

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.use(bodyParser.json());
  app.use(requestsLogger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('User Management')
    .setDescription('User Management API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 8080);
}

bootstrap(); // eslint-disable-line
