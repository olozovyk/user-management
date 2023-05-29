import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersRepository } from '../users/users.repository';
import { User } from 'src/entities/user.entity';
import { Token } from 'src/entities/token.entity';

@Injectable()
export class AuthRepository {
  constructor(
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
  ) {}

  private tokenRepository = this.dataSource.getRepository('Token');

  public async getTokenByUser(user: User): Promise<Token> {
    return this.tokenRepository.findOneBy({ user }) as Promise<Token>;
  }

  public async saveToken(token: string, userId: string): Promise<void> {
    const user = await this.usersRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingToken = await this.getTokenByUser(user);

    if (existingToken) {
      this.tokenRepository.update({ user }, { token });
    }

    this.tokenRepository.save({ token, user });
  }

  public deleteToken(token: string): void {
    this.tokenRepository.delete({ token });
  }
}
