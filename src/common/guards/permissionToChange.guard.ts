import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../types';

@Injectable()
export class PermissionToChangeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isThisAdmin = request.user.role === Role.ADMIN;
    const areUserIdsTheSame = request.user.id === request.params.id;

    if (!isThisAdmin && !areUserIdsTheSame) {
      throw new ForbiddenException(
        `You don't have permissions to change this user`,
      );
    }

    return true;
  }
}
