import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class UserExistingGuard implements CanActivate {
  constructor(private usersService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.params.id) {
      return true;
    }

    const user = await this.usersService.getUserById(request.params.id);

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    return true;
  }
}
