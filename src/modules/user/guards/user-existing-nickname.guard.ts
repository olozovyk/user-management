import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '@modules/user/services';
import { UserEntity } from '../entities';

@Injectable()
export class UserExistingGuardByNickname implements CanActivate {
  constructor(private usersService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserEntity }>();

    const user = await this.usersService.getUserByNickname(
      request.params.nickname,
    );

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    request.user = user;

    return true;
  }
}
