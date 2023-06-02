import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  private configService = new ConfigService();
  private jwtService = new JwtService();
  private logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      const payload = this.jwtService.decode(token) as {
        id: string;
        nickname: string;
      };

      if (payload.id !== request.params.id) {
        this.logger.error(`Ids is different`);
        return false;
      }

      request.user = { id: payload.id, nickname: payload.nickname };

      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.header('authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
