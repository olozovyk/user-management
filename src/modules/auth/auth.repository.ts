import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Token } from '../../common/entities';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthRepository {
  constructor(
    private dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  private tokenRepository = this.dataSource.getRepository<Token>('Token');

  public async saveToken(token: string, userId: string): Promise<void> {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingToken = await this.getTokenRecord(token);

    if (existingToken) {
      await this.tokenRepository.update({ token }, { token });
      return;
    }

    await this.tokenRepository.save({ token, user });
  }

  public async deleteToken(token: string): Promise<void> {
    await this.tokenRepository.delete({ token });
  }

  private getTokenRecord(token: string): Promise<Token | null> {
    return this.tokenRepository.findOneBy({ token });
  }
}
