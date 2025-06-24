import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '@modules/user/services';
import { Request } from 'express';
import { UserEntity } from '../entities';

@Injectable()
export class UserExistingGuard implements CanActivate {
  constructor(private usersService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserEntity }>();

    // if (!request.params.id) {
    //   return true;
    // }

    const user = await this.usersService.getUserById(request.params.id);

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    request.user = user;

    return true;
  }
}
