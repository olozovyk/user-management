import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { UsersService } from './users.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ITokenPayload, IUser, Role } from 'src/common/types';
import { User } from 'src/common/entities/user.entity';
import { QueryPaginationDto } from 'src/common/dto';
import { ProtectUserChangesGuard } from 'src/common/guards/protectUserChanges.guard';
import { EditUserDto } from 'src/common/dto';
import { createHash } from 'src/common/utils';
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  @Get()
  public async getUsers(
    @Query() query: QueryPaginationDto,
  ): Promise<{ users: IUser[] }> {
    const limit = query.limit || 20;
    const page = query.page || 1;

    const users = (await this.userService.getUsers(limit, page)) as User[];

    const usersToReturn: IUser[] = users.map(user => ({
      id: user.id,
      nickname: user.nickname,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));

    return {
      users: usersToReturn,
    };
  }

  @Get(':id')
  public async getUserById(
    @Param() params: { id: string },
    @Res() res: Response<{ user: IUser }>,
  ) {
    const user = await this.userService.getUserById(params.id);

    res.set('Last-Modified', user.updatedAt.toUTCString());
    res.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(ProtectUserChangesGuard)
  public async editUser(
    @Param() params: { id: string },
    @Body() body: Partial<EditUserDto>,
    @Req() req: Request & { user: ITokenPayload },
    @Res() res: Response<{ user: IUser }>,
  ) {
    const id = params.id;
    const { nickname, firstName, lastName, password, role } = body;

    if (nickname) {
      throw new HttpException(
        'You can not change the nickname',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!firstName && !lastName && !password && !role) {
      throw new HttpException('Nothing to change', HttpStatus.BAD_REQUEST);
    }

    const newPassword = password
      ? createHash({
          password,
          algorithm: this.configService.get('HASH_ALGORITHM'),
          localSalt: this.configService.get('LOCAL_SALT'),
          iterations: Number(this.configService.get('ITERATIONS')),
          keylen: Number(this.configService.get('KEYLEN')),
        })
      : undefined;

    const userToEdit: Omit<Partial<EditUserDto>, 'nickname'> = {};

    if (firstName) {
      userToEdit.firstName = firstName;
    }

    if (lastName) {
      userToEdit.lastName = lastName;
    }

    if (password) {
      userToEdit.password = newPassword;
    }

    if (role && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException(`You don't have the necessary rights`);
    }

    if (role) {
      userToEdit.role = role;
    }

    const resultOfUpdate = await this.userService.editUser(id, userToEdit);

    if (!resultOfUpdate) {
      throw new HttpException(
        'User is not updated',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const updatedUser = (await this.userService.getUserById(id)) as User;

    res.set('Last-Modified', updatedUser.updatedAt.toUTCString());
    res.json({
      user: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
      },
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  public async deleteUser(@Param() params: { id: string }) {
    await this.userService.deleteUser(params.id);
  }
}
