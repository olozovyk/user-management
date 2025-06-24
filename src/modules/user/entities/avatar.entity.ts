import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'avatars' })
export class Avatar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  avatarUrl: string;

  @OneToOne(() => UserEntity, user => user.avatar)
  @JoinColumn()
  user: UserEntity;
}
