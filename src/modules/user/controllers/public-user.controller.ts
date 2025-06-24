import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { UserService } from '../services';
import { mapUserOutput } from '@common/utils';
import { GetAllUsersApiDto, GetPublicUserApiDto } from '../dto/api';
import { QueryPaginationDto } from '../dto';
import { IPublicUser } from '../types';

@Controller('public/users')
@ApiTags('User (public)')
export class PublicUser {
  constructor(private userService: UserService) {}

  /**
   * Get all users
   */
  @Get()
  @ApiOkResponse({ type: GetAllUsersApiDto })
  public async getUsers(
    @Query() query: QueryPaginationDto,
  ): Promise<{ users: IPublicUser[] }> {
    const limit = query.limit || 20;
    const page = query.page || 1;

    const users = await this.userService.getUsers(limit, page);

    return {
      users: users.map(user => mapUserOutput(user)),
    };
  }

  /**
   * Get user by nickname
   */
  @Get(':nickname')
  @ApiOkResponse({ type: GetPublicUserApiDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  public async getUserByNickname(
    @Param('nickname') nickname: string,
    @Res() res: Response<{ user: IPublicUser }>,
  ) {
    const user = await this.userService.getUserByNickname(nickname);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    res.json({
      user: mapUserOutput(user),
    });
  }
}
