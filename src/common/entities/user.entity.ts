import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Token } from './token.entity';
import { Role, RoleType } from '../types';
import { Vote } from './vote.entity';
import { Avatar } from './avatar.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  nickname: string;

  @Column({ length: 20 })
  firstName: string;

  @Column({ length: 20 })
  lastName: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: RoleType;

  @Column({
    default: 0,
  })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Token, token => token.user)
  tokens: Token[];

  @OneToMany(() => Vote, vote => vote.user)
  votes: Vote[];

  @OneToMany(() => Vote, vote => vote.targetUser)
  receivedVotes: Vote[];

  @OneToOne(() => Avatar, avatar => avatar.user, { cascade: true })
  avatar: Avatar;
}
