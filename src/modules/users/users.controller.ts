import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import {
  AuthGuard,
  PermissionToChangeGuard,
  ProtectUserChangesGuard,
  UserNotFoundGuard,
} from '../../common/guards';
import { mapUserOutput } from '../../common/utils';
import { EditUserDto, QueryPaginationDto, VoteDto } from '../../common/dto';
import { ITokenPayload, IUser } from '../../common/types';
import {
  GetAllUsersResDto,
  GetUserResDto,
  FileUploadDto,
  AvatarResDto,
} from '../../common/dto/openApi';

@Controller('users')
@UseGuards(UserNotFoundGuard)
@ApiTags('Users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: GetAllUsersResDto })
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
  @ApiOkResponse({ type: GetUserResDto })
  @ApiNotFoundResponse({ description: 'User is not found' })
  public async getUserById(
    @Param('id') id: string,
    @Res() res: Response<{ user: IUser }>,
  ) {
    const user = await this.userService.getUserById(id);

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    res.set('Last-Modified', user.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(user),
    });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiOkResponse({ description: 'An updated user', type: GetUserResDto })
  @ApiNotFoundResponse({ description: 'User is not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({
    description: 'The user information is not up to date',
  })
  @UseGuards(AuthGuard, PermissionToChangeGuard, ProtectUserChangesGuard)
  public async editUser(
    @Param('id') id: string,
    @Body() body: EditUserDto,
    @Req() req: Request & { user: ITokenPayload },
    @Res() res: Response<{ user: IUser }>,
  ) {
    const updatedUser = await this.userService.editUser(
      id,
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
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'A user is deleted' })
  @ApiNotFoundResponse({ description: 'User is not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, PermissionToChangeGuard)
  public async deleteUser(@Param('id') id: string) {
    await this.userService.softDeleteUser(id);
  }

  @Post(':id/voting')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiOkResponse({ description: 'The vote is counted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({
    description:
      'You cannot give the vote for yourself. You have already voted for this user.The user information is not up to date',
  })
  @UseGuards(AuthGuard)
  @UseGuards(ProtectUserChangesGuard)
  @HttpCode(HttpStatus.OK)
  public async vote(
    @Req() req: Request & { user: ITokenPayload },
    @Param('id') id: string,
    @Query() query: VoteDto,
  ) {
    const userId = req.user.id;
    const targetUserId = id;
    const vote = query.vote;

    await this.userService.vote(userId, targetUserId, vote);

    return {
      message: 'The vote is counted',
    };
  }

  @Post(':id/avatar')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'jpeg, png, no large than 5MB',
    type: FileUploadDto,
  })
  @ApiCreatedResponse({ type: AvatarResDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({
    description: 'The user information is not up to date',
  })
  @UseGuards(AuthGuard, PermissionToChangeGuard, ProtectUserChangesGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
          }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png)' }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    const avatarUrl = await this.userService.uploadAvatar(id, avatar);

    return {
      avatarUrl,
    };
  }
}
