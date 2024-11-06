import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger();

export function requestsLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.url === '/api/health') {
    return next();
  }

  const ip = req.headers['x-forwarded-for'];

  logger.log(`${req.method}, path:${req.url}, ${ip}`);
  logger.log(`body: ${JSON.stringify(req.body)}`);
  next();
}
