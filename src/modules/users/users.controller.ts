import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { UsersService } from './users.service';
import { AuthGuard, ProtectUserChangesGuard } from 'src/common/guards';
import { mapUserOutput } from '../../common/utils';
import { EditUserDto, QueryPaginationDto, VoteDto } from 'src/common/dto';
import { ITokenPayload, IUser } from 'src/common/types';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  public async getUsers(
    @Query() query: QueryPaginationDto,
  ): Promise<{ users: IUser[] }> {
    const limit = query.limit || 20;
    const page = query.page || 1;

    const users = await this.userService.getUsers(limit, page);

    const usersToReturn: IUser[] = users.map(user => mapUserOutput(user));

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

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    res.set('Last-Modified', user.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(user),
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
    const updatedUser = await this.userService.editUser(
      params.id,
      body,
      req.user.role,
    );

    if (!updatedUser) {
      throw new NotFoundException('User is not found');
    }

    res.set('Last-Modified', updatedUser.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(updatedUser),
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  public deleteUser(@Param() params: { id: string }) {
    this.userService.deleteUser(params.id);
  }

  @Post(':id/voting')
  @UseGuards(AuthGuard)
  @UseGuards(ProtectUserChangesGuard)
  @HttpCode(201)
  public async vote(
    @Req() req,
    @Param() params: { id: string },
    @Query() query: VoteDto,
  ) {
    const userId = req.user.id;
    const targetUserId = params.id;
    const vote = query.vote;

    await this.userService.vote(userId, targetUserId, vote);

    return {
      message: 'The vote is counted',
    };
  }
}
