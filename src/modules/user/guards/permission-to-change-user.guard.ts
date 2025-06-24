import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../types';
import { ITokenPayload } from '@modules/auth/types';

@Injectable()
export class PermissionToChangeUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: ITokenPayload }>();

    const isThisAdmin = request.user.role === Role.ADMIN;
    const isTheSameId = request.user.id === request.params.id;

    if (!isThisAdmin && !isTheSameId) {
      throw new ForbiddenException(
        `You don't have permissions to change this user`,
      );
    }

    return true;
  }
}
