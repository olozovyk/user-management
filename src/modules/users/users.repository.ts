import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../../dto/createUser.dto';

@Injectable()
export class UsersRepository {
  constructor(private dataSource: DataSource) {}

  private userRepository = this.dataSource.getRepository('User');

  createUser(user: CreateUserDto) {
    return this.userRepository.save(user);
  }

  getUserByNickname(nickname: string) {
    return this.userRepository.findOneBy({ nickname });
  }

  getUserById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  editUser(id: number, user: Omit<Partial<CreateUserDto>, 'nickname'>) {
    return this.userRepository.update({ id }, { ...user });
  }
}
