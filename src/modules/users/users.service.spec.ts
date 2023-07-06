import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../common/entities';

type UserType = Omit<User, 'tokens' | 'votes' | 'receivedVotes' | 'avatar'>;
let mockUser: UserType = {
  id: '1',
  nickname: 'john',
  firstName: 'John',
  lastName: 'Walsh',
  password: '12345',
  role: 'user',
  rating: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Partial<UsersRepository> = {
    editUser: jest
      .fn()
      .mockImplementation((id: string, user: Partial<UserType>) => {
        mockUser = { ...mockUser, ...user };
      }),
    getUserById: jest.fn().mockImplementation(() => mockUser),
  };
  let s3Service: Partial<S3Service> = { sendFile: jest.fn() };
  let configService: Partial<ConfigService> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
        { provide: S3Service, useValue: s3Service },
        { provide: UsersRepository, useValue: usersRepository },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    s3Service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should change firstName', async () => {
    const editedUser = await usersService.editUser(
      '1',
      { firstName: 'John I' },
      'user',
    );
    expect(editedUser.firstName).toBe('John I');
  });

  it('should change password', async () => {
    const oldPassword = mockUser.password;
    const editedUser = await usersService.editUser(
      '1',
      { password: '123' },
      'user',
    );
    expect(editedUser.password).not.toBe(oldPassword);
  });

  it('should throw an error when changing role if current role is not admin', () => {
    expect(async () => {
      return usersService.editUser('1', { role: 'admin' }, 'user');
    }).rejects.toThrow();
  });

  it('should throw an error when not passing any property to change', () => {
    expect(async () => {
      return usersService.editUser('1', {}, 'user');
    }).rejects.toThrow();
  });
});
