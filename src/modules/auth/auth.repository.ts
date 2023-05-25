import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthRepository {
  constructor(
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
  ) {}

  private tokenRepository = this.dataSource.getRepository('Token');

  async getTokenByUser(user) {
    return this.tokenRepository.findOneBy({ user });
  }

  async saveToken(token: string, userId: number) {
    const user = await this.usersRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingToken = await this.getTokenByUser(user);

    if (existingToken) {
      return this.tokenRepository.update({ user }, { token });
    }

    return this.tokenRepository.save({ token, user });
  }

  deleteToken(token: string) {
    return this.tokenRepository.delete({ token });
  }
}
