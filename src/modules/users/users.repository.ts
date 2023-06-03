import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

import { User } from 'src/common/entities/user.entity';
import { CreateUserDto } from '../../common/dto';

@Injectable()
export class UsersRepository {
  constructor(private dataSource: DataSource) {}

  private userRepository = this.dataSource.getRepository('User');

  public getUsers(limit: number, skip: number): Promise<User[]> {
    return this.userRepository.find({ take: limit, skip }) as Promise<User[]>;
  }

  public createUser(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user) as Promise<User>;
  }

  public getUserByNickname(nickname: string): Promise<User> {
    return this.userRepository.findOneBy({ nickname }) as Promise<User>;
  }

  public getUserById(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id }) as Promise<User>;
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
}
