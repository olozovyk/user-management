import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Token } from './token.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20, nullable: false })
  nickname: string;

  @Column({ length: 20, nullable: false })
  firstName: string;

  @Column({ length: 20, nullable: false })
  lastName: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany(() => Token, token => token.user)
  token: Token[];
}
