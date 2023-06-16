import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { createHash, getSkipForPagination } from 'src/common/utils';
import { User } from 'src/common/entities/user.entity';
import { CreateUserDto, EditUserDto } from '../../common/dto';
import { Role, RoleType } from '../../common/types';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

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

  public getUserByNickname(nickname: string): Promise<User> {
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
    const { nickname, firstName, lastName, password, role } = body;

    if (nickname) {
      throw new BadRequestException('You can not change the nickname');
    }

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

  public deleteUser(id: string) {
    this.userRepository.deleteUser(id);
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
}
