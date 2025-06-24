import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '@modules/user/entities';

@Entity({ name: 'tokens' })
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => UserEntity, user => user.tokens, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
