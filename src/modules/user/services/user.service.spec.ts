import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../user.repository';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities';

let mockedUser: Partial<User> = {
  id: '1',
  nickname: 'john',
  firstName: 'John',
  lastName: 'Walsh',
  password: '12345',
  role: 'user',
};

const editUserMocked = (id: string, user: Partial<User>) => {
  mockedUser = { ...mockedUser, ...user };
};

const userRepositoryMocked = {
  editUser: jest.fn().mockImplementation(editUserMocked),
  getUserById: jest.fn().mockImplementation(() => mockedUser),
};

const s3ServiceMocked = { sendFile: jest.fn() };

describe('UsersService', () => {
  let usersService: UserService;
  let usersRepository: Partial<UserRepository> = userRepositoryMocked;
  let s3Service: Partial<S3Service> = s3ServiceMocked;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        ConfigService,
        { provide: S3Service, useValue: s3Service },
        { provide: UserRepository, useValue: usersRepository },
      ],
    }).compile();

    usersService = module.get<UserService>(UserService);
    usersRepository = module.get<UserRepository>(UserRepository);
    s3Service = module.get<S3Service>(S3Service);
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
    const oldPassword = mockedUser.password;
    const editedUser = await usersService.editUser(
      '1',
      { password: '123' },
      'user',
    );
    expect(editedUser.password).not.toBe(oldPassword);
  });

  it('should throw an error when changing role if current role is not admin', async () => {
    await expect(async () => {
      await usersService.editUser('1', { role: 'admin' }, 'user');
    }).rejects.toThrow();
  });

  it('should throw an error when not passing any property to change', async () => {
    await expect(async () => {
      await usersService.editUser('1', {}, 'user');
    }).rejects.toThrow();
  });
});
