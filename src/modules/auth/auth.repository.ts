import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UsersRepository } from '../users/users.repository';
import { Token } from 'src/common/entities/token.entity';

@Injectable()
export class AuthRepository {
  constructor(
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
  ) {}

  private tokenRepository = this.dataSource.getRepository('Token');

  public async saveToken(token: string, userId: string): Promise<void> {
    const user = await this.usersRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingToken = await this.getTokenRecord(token);

    if (existingToken) {
      this.tokenRepository.update({ token }, { token });
    }

    this.tokenRepository.save({ token, user });
  }

  public deleteToken(token: string): void {
    this.tokenRepository.delete({ token });
  }

  private getTokenRecord(token: string): Promise<Token> {
    return this.tokenRepository.findOneBy({ token }) as Promise<Token>;
  }
}
