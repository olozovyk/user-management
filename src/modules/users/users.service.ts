import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from '../../dto/createUser.dto';
import { getSkipForPagination } from 'src/utils';
import { User } from 'src/entities/user.entity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  public getUsers(limit: number, page: number): Promise<User[]> {
    const skip = getSkipForPagination(limit, page);
    return this.userRepository.getUsers(limit, skip);
  }

  public createUser(user: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(user);
  }

  public getUserByNickname(nickname: string): Promise<User> {
    return this.userRepository.getUserByNickname(nickname);
  }

  public getUserById(id: string): Promise<User> {
    return this.userRepository.getUserById(id);
  }

  public editUser(
    id: string,
    user: Omit<Partial<CreateUserDto>, 'nickname'>,
  ): Promise<UpdateResult> {
    return this.userRepository.editUser(id, user);
  }
}
