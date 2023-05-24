import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class AuthRepository {
  constructor(private dataSource: DataSource) {}

  private userRepository = this.dataSource.getRepository('User');

  createUser(user: CreateUserDto) {
    return this.userRepository.save(user);
  }

  getAllUsers() {
    return this.userRepository.find();
  }
}
