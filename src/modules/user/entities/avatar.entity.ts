import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'avatars' })
export class Avatar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  avatarUrl: string;

  @OneToOne(() => User, user => user.avatar)
  @JoinColumn()
  user: User;
}
