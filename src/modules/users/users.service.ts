import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from '../../common/dto';
import { createHash, getSkipForPagination } from 'src/common/utils';
import { User } from 'src/common/entities/user.entity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    private configService: ConfigService,
  ) {}

  public getUsers(limit: number, page: number): Promise<User[]> {
    const skip = getSkipForPagination(limit, page);
    return this.userRepository.getUsers(limit, skip);
  }

  public async createUser(user: CreateUserDto): Promise<User> {
    const password = createHash({
      password: user.password,
      algorithm: this.configService.get('HASH_ALGORITHM'),
      localSalt: this.configService.get('LOCAL_SALT'),
      iterations: Number(this.configService.get('ITERATIONS')),
      keylen: Number(this.configService.get('KEYLEN')),
    });

    const userToCreate = {
      ...user,
      password,
    };

    const existingUser = await this.getUserByNickname(user.nickname);

    if (existingUser) {
      throw new BadRequestException('Such a nickname already in use.');
    }

    return this.userRepository.createUser(userToCreate);
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

  public deleteUser(id: string) {
    this.userRepository.deleteUser(id);
  }
}
