import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/createUser.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IUser } from 'src/types';
import { User } from 'src/entities/user.entity';
import { QueryPaginationDto } from 'src/dto';

@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Get()
  public async getUsers(@Query() query: QueryPaginationDto) {
    const limit = query.limit || 20;
    const page = query.page || 1;

    const users = (await this.userService.getUsers(limit, page)) as User[];

    const usersToReturn: IUser[] = users.map(user => ({
      id: user.id,
      nickname: user.nickname,
      firstName: user.firstName,
      lastName: user.lastName,
    }));

    return {
      users: usersToReturn,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  public async editUser(
    @Param() params: { id: string },
    @Body() body: Partial<CreateUserDto>,
  ) {
    const id = params.id;
    const { nickname, firstName, lastName, password } = body;

    if (nickname) {
      throw new HttpException(
        'You can not change the nickname',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!firstName && !lastName && !password) {
      throw new HttpException('Nothing to change', HttpStatus.BAD_REQUEST);
    }

    const newPassword = password
      ? this.authService.createHash(password)
      : undefined;

    const userToEdit: Omit<Partial<CreateUserDto>, 'nickname'> = {};

    if (firstName) {
      userToEdit.firstName = firstName;
    }

    if (lastName) {
      userToEdit.lastName = lastName;
    }

    if (password) {
      userToEdit.password = newPassword;
    }

    const resultOfUpdate = await this.userService.editUser(id, userToEdit);

    if (!resultOfUpdate) {
      throw new HttpException(
        'User is not updated',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const updatedUser = (await this.userService.getUserById(id)) as User;

    return {
      user: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    };
  }
}
