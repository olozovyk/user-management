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
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { AuthGuard } from '@modules/auth/guards';
import {
  PermissionToChangeGuard,
  ProtectUserChangesGuard,
  UserExistingGuard,
} from './guards';

import { mapUserOutput } from '@common/utils';
import { EditUserDto, QueryPaginationDto, VoteDto } from './dto';
import { ITokenPayload, IUser } from '@common/types';
import {
  AvatarApiDto,
  FileUploadApiDto,
  GetAllUsersApiDto,
  GetUserApiDto,
} from '@modules/user/dto/api';

@Controller('users')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Get all users
   */
  @Get()
  @ApiOkResponse({ type: GetAllUsersApiDto })
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

  /**
   * Get user by ID
   */
  @Get(':id')
  @ApiOkResponse({ type: GetUserApiDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  @UseGuards(UserExistingGuard)
  public async getUserById(
    @Param('id') id: string,
    @Res() res: Response<{ user: IUser }>,
  ) {
    const user = await this.userService.getUserById(id);

    res.set('Last-Modified', user.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(user),
    });
  }

  /**
   * Edit user
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiOkResponse({ description: 'An updated user', type: GetUserApiDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @UseGuards(
    AuthGuard,
    UserExistingGuard,
    PermissionToChangeGuard,
    ProtectUserChangesGuard,
  )
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

  /**
   * Delete user
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'User is deleted' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, UserExistingGuard, PermissionToChangeGuard)
  public async deleteUser(@Param('id') id: string) {
    await this.userService.softDeleteUser(id);
  }

  /**
   * Submit a vote for the user
   */
  @Post(':id/rating')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'User ID you vote for' })
  @ApiOkResponse({ description: 'The vote is counted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @UseGuards(AuthGuard, UserExistingGuard, ProtectUserChangesGuard)
  @HttpCode(HttpStatus.OK)
  public async vote(
    @Req() req: Request & { user: ITokenPayload },
    @Param('id') targetUserId: string,
    @Body() { vote }: VoteDto,
  ) {
    const userId = req.user.id;
    await this.userService.vote(userId, targetUserId, vote);

    return {
      message: vote === 0 ? 'The vote is removed' : 'The vote is received',
    };
  }

  /**
   * Upload user avatar
   */
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
    type: FileUploadApiDto,
  })
  @ApiCreatedResponse({ type: AvatarApiDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @UseGuards(
    AuthGuard,
    UserExistingGuard,
    PermissionToChangeGuard,
    ProtectUserChangesGuard,
  )
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
