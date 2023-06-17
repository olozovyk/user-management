import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ITokenPayload, Role } from '../types';

@Injectable()
export class AuthGuard implements CanActivate {
  private configService = new ConfigService();
  private jwtService = new JwtService();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });

    const payload = this.jwtService.decode(token) as ITokenPayload;

    request.user = payload;

    const isThisVotingPath = !!request.path.match(/voting$/);
    const isThisAdmin = payload.role === Role.ADMIN;
    const areUserIdsTheSame = payload.id !== request.params.id;

    if (!isThisVotingPath && !isThisAdmin && !areUserIdsTheSame) {
      throw new ForbiddenException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.header('authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
