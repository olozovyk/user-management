import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { UserEntity } from './user.entity';
import { VoteType, VoteValues } from '../types';

@Entity({ name: 'votes' })
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.votes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: UserEntity;

  @ManyToOne(() => UserEntity, user => user.receivedVotes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  targetUser: UserEntity;

  @Column({
    nullable: true,
  })
  @Type(() => Number)
  @IsIn(VoteValues)
  voteValue: VoteType;
}
