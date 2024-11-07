import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { UserService } from '../services';
import { UserExistingGuardByNickname } from '../guards';
import { mapUserOutput } from '@common/utils';
import { GetAllUsersApiDto, GetPublicUserApiDto } from '../dto/api';
import { QueryPaginationDto } from '../dto';
import { IPublicUser } from '../types';
import { User } from '../entities';

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
  @UseGuards(UserExistingGuardByNickname)
  public async getUserByNickname(
    // param is needed for swagger:
    @Param('nickname') nickname: string,
    @Req() req: Request & { user: User },
    @Res() res: Response<{ user: IPublicUser }>,
  ) {
    res.json({
      user: mapUserOutput(req.user),
    });
  }
}
