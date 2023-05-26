import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/createUser.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Patch(':id')
  @UseGuards(AuthGuard)
  async editUser(
    @Param() params: { id: string },
    @Body() body: Partial<CreateUserDto>,
  ) {
    const id = Number(params.id);
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

    const updatedUser = (await this.userService.getUserById(
      id,
    )) as CreateUserDto & { id: number };

    return {
      statusCode: HttpStatus.OK,
      user: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    };
  }
}
