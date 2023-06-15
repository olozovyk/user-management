import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { VoteValues } from '../types';
import { IsIn } from 'class-validator';
import { Type } from 'class-transformer';

@Entity({ name: 'votes' })
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.votes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => User, user => user.receivedVotes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  targetUser: User;

  @Column({
    nullable: true,
  })
  @Type(() => Number)
  @IsIn(VoteValues)
  voteValue: number;
}
