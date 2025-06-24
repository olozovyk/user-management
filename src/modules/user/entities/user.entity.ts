import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Token } from '@modules/auth/entities';
import { Vote } from './vote.entity';
import { Avatar } from './avatar.entity';
import { Role, RoleType } from '../types';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 30 })
  email: string;

  @Column({ default: false })
  verifiedEmail: boolean;

  @Column({ type: 'uuid', unique: true, nullable: true })
  emailVerificationToken: string | null;

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

  @DeleteDateColumn({ nullable: true })
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
