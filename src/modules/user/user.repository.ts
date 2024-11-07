import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Equal, Not, Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

import { CreateUserDto } from '@modules/auth/dto';
import { Avatar, User, Vote } from './entities';
import { IVoteSaveParams, IVoteUpdateParams, VoteType } from './types';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
  ) {}

  public getUsers(limit: number, skip: number): Promise<User[]> {
    return this.userRepository.find({
      take: limit,
      skip,
      relations: { avatar: true },
    });
  }

  public saveEmailVerificationToken(
    userId: string,
    token: string,
  ): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      { emailVerificationToken: token },
    );
  }

  public getUserByEmailVerificationToken(
    emailVerificationToken: string,
  ): Promise<User | null> {
    return this.userRepository.findOneBy({ emailVerificationToken });
  }

  public setVerifiedEmail(userId: string): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      { verifiedEmail: true, emailVerificationToken: null },
    );
  }

  public createUser(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user) as Promise<User>;
  }

  public getUserByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { nickname },
      relations: { avatar: true },
    });
  }

  public getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: { avatar: true },
    });
  }

  public editUser(
    id: string,
    user: Omit<Partial<CreateUserDto>, 'nickname'>,
  ): Promise<UpdateResult> {
    return this.userRepository.update({ id }, { ...user });
  }

  public async softDeleteUser(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  public async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
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

  public async createVote(
    userId: string,
    targetUserId: string,
    voteValue: VoteType,
  ): Promise<UpdateResult> {
    const user = await this.getUserById(userId);
    const targetUser = await this.getUserById(targetUserId);

    if (!user || !targetUser) {
      throw new NotFoundException('User is not found');
    }

    const newVote = new Vote();
    newVote.user = user;
    newVote.targetUser = targetUser;
    newVote.voteValue = voteValue;

    return await this.saveVoteAndUpdateRating({
      voteEntity: newVote,
      userId,
      targetUserId,
      voteValue,
    });
  }

  public async updateVote({
    existingVote,
    userId,
    targetUserId,
    voteValue,
  }: IVoteUpdateParams): Promise<UpdateResult> {
    existingVote.voteValue = voteValue;

    return await this.saveVoteAndUpdateRating({
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
  }: IVoteSaveParams): Promise<UpdateResult> {
    return await this.dataSource.manager.transaction(
      async transactionalEntityManager => {
        if (voteValue === 0) {
          await transactionalEntityManager.remove(voteEntity);
        } else {
          await transactionalEntityManager.save(voteEntity);
        }

        const rating = await this.countRating(userId, targetUserId, voteValue);
        return await transactionalEntityManager.update(User, targetUserId, {
          rating,
        });
      },
    );
  }

  private async countRating(
    userId: string,
    targetUserId: string,
    voteValue: VoteType,
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

  public async saveAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    const newAvatar = new Avatar();
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    newAvatar.user = user;
    newAvatar.avatarUrl = avatarUrl;

    await this.avatarRepository.upsert(newAvatar, ['user']);
  }
}
