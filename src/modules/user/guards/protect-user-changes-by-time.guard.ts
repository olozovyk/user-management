import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '@modules/user/services';
import { RequestWithTokenPayload } from '@modules/auth/types';

@Injectable()
export class ProtectUserChangesByTimeGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithTokenPayload>();

    const ifUnmodifiedSinceHeader = request.get('If-unmodified-since');

    if (!ifUnmodifiedSinceHeader) {
      throw new HttpException(
        'Header If-unmodified-since was not passed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const id = request.params.id;
    const user = await this.userService.getUserById(id);

    const updatedAtTimestamp = user.updatedAt.setMilliseconds(0);
    const ifUnmodifiedSinceTimestamp = new Date(
      ifUnmodifiedSinceHeader,
    ).setMilliseconds(0);

    if (updatedAtTimestamp !== ifUnmodifiedSinceTimestamp) {
      throw new BadRequestException(
        'The user information is not up to date. Set correct "If-unmodified-since" header',
      );
    }

    return true;
  }
}
