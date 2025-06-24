import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '@modules/user/services';
import { RequestWithUserEntity } from '../types';

@Injectable()
export class UserExistingNicknameGuard implements CanActivate {
  constructor(private usersService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUserEntity>();

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
