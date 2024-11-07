import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/services';
import { AuthRepository } from './auth.repository';
import { User } from '@modules/user/entities';
import * as createHashUtil from '../../common/utils/create-hash';
import { EmailService } from './email.service';

const mockedUser: Partial<User> = {
  id: '1',
  nickname: 'john',
  password: '12345',
};

const getUserByIdMocked = (nickname: string) => {
  return nickname === mockedUser.nickname ? mockedUser : null;
};

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: Partial<AuthRepository> = {
    saveToken: jest.fn(),
  };
  const usersService: Partial<UserService> = {
    getUserByNickname: jest.fn().mockImplementation(getUserByIdMocked),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        ConfigService,
        { provide: AuthRepository, useValue: authRepository },
        { provide: UserService, useValue: usersService },
        EmailService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  it('should login success', async () => {
    const loginDto = {
      nickname: 'john',
      password: '12345',
    };

    const spyHash = jest.spyOn(createHashUtil, 'createHash');
    spyHash.mockImplementation(password => password);

    const result = await authService.login(loginDto);

    expect(result.user.nickname).toEqual(loginDto.nickname);
    expect(result.user.password).toEqual(loginDto.password);
    expect(result.tokens.accessToken).toBeTruthy();
    expect(result.tokens.refreshToken).toBeTruthy();

    spyHash.mockRestore();
  });

  it('should throw an error when user is not exist', async () => {
    const loginDto = {
      nickname: 'python',
      password: '12345',
    };

    const spyHash = jest.spyOn(createHashUtil, 'createHash');
    spyHash.mockImplementation(password => password);

    await expect(async () => {
      await authService.login(loginDto);
    }).rejects.toThrow();

    spyHash.mockRestore();
  });

  it('should throw an error when password is not correct', async () => {
    const loginDto = {
      nickname: 'john',
      password: 'abc123',
    };

    const spyHash = jest.spyOn(createHashUtil, 'createHash');
    spyHash.mockImplementation(password => password);

    await expect(async () => {
      await authService.login(loginDto);
    }).rejects.toThrow();

    spyHash.mockRestore();
  });
});
