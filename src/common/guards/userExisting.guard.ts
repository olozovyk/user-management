import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class UserExistingGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

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
