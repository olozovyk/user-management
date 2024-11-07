import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { isArray } from 'class-validator';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string = exception.message;

    if (exception.getResponse) {
      const response = exception.getResponse() as {
        message: string | string[];
      };

      if (response.message) {
        message = isArray(response.message)
          ? response.message.join(', ')
          : response.message;
      }
    }

    this.logger.error(JSON.stringify({ status, message }));

    response.status(status).json({ message });
  }
}
