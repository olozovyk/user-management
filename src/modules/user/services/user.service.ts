import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserRepository } from '../user.repository';
import {
  createHash,
  getExtensionFromOriginalName,
  getSkipValueForPagination,
} from '@common/utils';
import { User } from '../entities';
import { CreateUserDto } from '@modules/auth/dto';
import { EditUserDto } from '../dto';
import { S3Service } from './s3.service';
import { Role, RoleType, VoteType } from '../types';
import { UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {}

  public saveEmailVerificationToken(
    userId: string,
    token: string,
  ): Promise<UpdateResult> {
    return this.userRepository.saveEmailVerificationToken(userId, token);
  }

  public getUserByEmailVerificationToken(
    emailVerificationToken: string,
  ): Promise<User | null> {
    return this.userRepository.getUserByEmailVerificationToken(
      emailVerificationToken,
    );
  }

  public setVerifiedEmail(userId: string): Promise<UpdateResult> {
    return this.userRepository.setVerifiedEmail(userId);
  }

  public getUsers(limit: number, page: number): Promise<User[]> {
    const skip = getSkipValueForPagination(limit, page);
    return this.userRepository.getUsers(limit, skip);
  }

  public async createUser(user: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(user);
  }

  public getUserByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.getUserByNickname(nickname);
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    return user;
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
    const updatedUser = await this.userRepository.getUserById(id);

    if (!updatedUser) {
      throw new NotFoundException('User is not found');
    }

    return updatedUser;
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
    voteValue: VoteType,
  ): Promise<void> {
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot give the vote for yourself');
    }

    const existingVote = await this.userRepository.getVote(
      userId,
      targetUserId,
    );

    if (!existingVote) {
      if (voteValue === 0) {
        throw new BadRequestException('The vote does not exist');
      }

      const updateResult = await this.userRepository.createVote(
        userId,
        targetUserId,
        voteValue,
      );

      if (!updateResult.affected) {
        throw new InternalServerErrorException(`Rating wasn't updated`);
      }

      return;
    }

    if (voteValue === existingVote.voteValue) {
      throw new BadRequestException('You have already voted for this user');
    }

    const updateResult = await this.userRepository.updateVote({
      existingVote,
      userId,
      targetUserId,
      voteValue,
    });

    if (!updateResult.affected) {
      throw new InternalServerErrorException(`Rating wasn't updated`);
    }
  }

  public async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExtension = getExtensionFromOriginalName(file.originalname);
    const key = `${userId}.${fileExtension}`;

    const result = await this.s3Service.sendFile(file.buffer, key);
    if (result === undefined) {
      throw new InternalServerErrorException(`Avatar was not uploaded`);
    }

    const publicUrl = this.configService.getOrThrow('OBJECT_PUBLIC_URL');
    const avatarUrl = publicUrl + key;

    await this.userRepository.saveAvatarUrl(userId, avatarUrl);
    return avatarUrl;
  }
}
