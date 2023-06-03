import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class ProtectUserChangesGuard implements CanActivate {
  constructor(private userService: UsersService) {}

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

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    const updatedAtTimestamp = user.updatedAt.setMilliseconds(0);
    const ifUnmodifiedSinceTimestamp = new Date(
      request.get('If-unmodified-since'),
    ).setMilliseconds(0);

    if (updatedAtTimestamp > ifUnmodifiedSinceTimestamp) {
      throw new BadRequestException('The user information is not up to date');
    }

    return true;
  }
}
