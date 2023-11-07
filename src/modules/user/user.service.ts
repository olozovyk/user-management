import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserRepository } from './user.repository';
import {
  createHash,
  getExtensionFromOriginalName,
  getSkipForPagination,
} from '@common/utils';
import { User } from './entities';
import { CreateUserDto, EditUserDto } from '@common/dto';
import { Role, RoleType } from '@common/types';
import { S3Service } from './s3.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {}

  public getUsers(limit: number, page: number): Promise<User[]> {
    const skip = getSkipForPagination(limit, page);
    return this.userRepository.getUsers(limit, skip);
  }

  public async createUser(user: CreateUserDto): Promise<User> {
    const password = createHash(user.password);

    const userToCreate = {
      ...user,
      password,
    };

    const existingUser = await this.getUserByNickname(user.nickname);

    if (existingUser) {
      throw new BadRequestException('Such a nickname already in use.');
    }

    return this.userRepository.createUser(userToCreate);
  }

  public getUserByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.getUserByNickname(nickname);
  }

  public getUserById(id: string): Promise<User> {
    return this.userRepository.getUserById(id);
  }

  public async editUser(
    id: string,
    body: Partial<EditUserDto>,
    userRole: RoleType,
  ): Promise<User> {
    const { firstName, lastName, password, role } = body;

    if (!firstName && !lastName && !password && !role) {
      throw new BadRequestException('Nothing to change');
    }

    const newPassword = password ? createHash(password) : undefined;

    const userToEdit: Omit<Partial<EditUserDto>, 'nickname'> = {};

    if (role && userRole !== Role.ADMIN) {
      throw new ForbiddenException(`You don't have the required permissions`);
    }

    if (role) {
      userToEdit.role = role;
    }

    if (firstName) {
      userToEdit.firstName = firstName;
    }

    if (lastName) {
      userToEdit.lastName = lastName;
    }

    if (password) {
      userToEdit.password = newPassword;
    }

    await this.userRepository.editUser(id, userToEdit);
    return this.userRepository.getUserById(id);
  }

  public async softDeleteUser(id: string) {
    await this.userRepository.softDeleteUser(id);
  }

  public async deleteUser(id: string) {
    await this.userRepository.deleteUser(id);
  }

  public async vote(
    userId: string,
    targetUserId: string,
    voteValue: number,
  ): Promise<void> {
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot give the vote for yourself');
    }

    const existingVote = await this.userRepository.getVote(
      userId,
      targetUserId,
    );

    if (!existingVote) {
      await this.userRepository.createVoteAndCount(
        userId,
        targetUserId,
        voteValue,
      );
      return;
    }

    if (voteValue === existingVote.voteValue) {
      throw new BadRequestException('You have already voted for this user');
    }

    await this.userRepository.updateVoteAndRating({
      existingVote,
      userId,
      targetUserId,
      voteValue,
    });
  }

  public async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExtension = getExtensionFromOriginalName(file.originalname);
    const key = `${userId}.${fileExtension}`;

    await this.s3Service.sendFile(file.buffer, key);

    const publicUrl = this.configService.getOrThrow('OBJECT_PUBLIC_URL');
    const avatarUrl = publicUrl + key;

    await this.userRepository.saveAvatarUrl(userId, avatarUrl);

    return avatarUrl;
  }
}
