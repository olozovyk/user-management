import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class ProtectUserChangesGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.get('If-unmodified-since')) {
      throw new HttpException(
        'Header If-unmodified-since was not passed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const id = request.params.id;
    const user = await this.userService.getUserById(id);

    const updatedAtTimestamp = user.updatedAt.setMilliseconds(0);
    const ifUnmodifiedSinceTimestamp = new Date(
      request.get('If-unmodified-since'),
    ).setMilliseconds(0);

    if (updatedAtTimestamp !== ifUnmodifiedSinceTimestamp) {
      throw new BadRequestException(
        'The user information is not up to date. Set correct last-modified header',
      );
    }

    return true;
  }
}
