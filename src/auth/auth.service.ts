import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}
  createUser(user: CreateUserDto) {
    return this.authRepository.createUser(user);
  }
}
