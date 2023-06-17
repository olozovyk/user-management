import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Equal, Not } from 'typeorm';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

import { User } from 'src/common/entities/user.entity';
import { CreateUserDto } from '../../common/dto';
import { Vote } from '../../common/entities';
import { validateEntity } from '../../common/pipes';
import { IVoteSaveParams, IVoteUpdateParams } from '../../common/types';

@Injectable()
export class UsersRepository {
  constructor(private dataSource: DataSource) {}

  private userRepository = this.dataSource.getRepository<User>('User');
  private voteRepository = this.dataSource.getRepository<Vote>('Vote');

  public getUsers(limit: number, skip: number): Promise<User[]> {
    return this.userRepository.find({ take: limit, skip }) as Promise<User[]>;
  }

  public createUser(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user) as Promise<User>;
  }

  public getUserByNickname(nickname: string): Promise<User> {
    return this.userRepository.findOneBy({ nickname }) as Promise<User>;
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    return user;
  }

  public editUser(
    id: string,
    user: Omit<Partial<CreateUserDto>, 'nickname'>,
  ): Promise<UpdateResult> {
    return this.userRepository.update({ id }, { ...user });
  }

  public deleteUser(id: string): void {
    this.userRepository.softDelete(id);
  }

  public async getVote(
    userId: string,
    targetUserId: string,
  ): Promise<Vote | null> {
    return this.voteRepository.findOneBy({
      user: { id: userId },
      targetUser: { id: targetUserId },
    });
  }

  public async createVoteAndCount(
    userId: string,
    targetUserId: string,
    voteValue: number,
  ): Promise<void> {
    const user = await this.getUserById(userId);
    const targetUser = await this.getUserById(targetUserId);

    const newVote = new Vote();
    newVote.user = user;
    newVote.targetUser = targetUser;
    newVote.voteValue = voteValue;

    await validateEntity(newVote);

    await this.saveVoteAndUpdateRating({
      voteEntity: newVote,
      userId,
      targetUserId,
      voteValue,
    });
  }

  public async updateVoteAndRating({
    existingVote,
    userId,
    targetUserId,
    voteValue,
  }: IVoteUpdateParams): Promise<void> {
    existingVote.voteValue = voteValue;
    await validateEntity(existingVote);

    await this.saveVoteAndUpdateRating({
      voteEntity: existingVote,
      userId,
      targetUserId,
      voteValue,
    });
  }

  private async saveVoteAndUpdateRating({
    voteEntity,
    userId,
    targetUserId,
    voteValue,
  }: IVoteSaveParams) {
    await this.dataSource.manager.transaction(
      async transactionalEntityManager => {
        await transactionalEntityManager.save(voteEntity);

        const rating = await this.countRating(userId, targetUserId, voteValue);

        await transactionalEntityManager.update(User, targetUserId, { rating });
      },
    );
  }

  private async countRating(
    userId: string,
    targetUserId: string,
    voteValue: number,
  ) {
    const sumWithoutUserVote = await this.voteRepository.sum('voteValue', {
      targetUser: {
        id: targetUserId,
      },
      user: {
        id: Not(Equal(userId)),
      },
    });

    return sumWithoutUserVote ? sumWithoutUserVote + voteValue : voteValue;
  }
}
