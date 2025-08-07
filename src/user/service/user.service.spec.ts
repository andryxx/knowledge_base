import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStorage } from '../storage/user.storage';
import { UserService } from './user.service';
import { UserCredentialsDto } from '../types/user.credentials.dto';
import { TokenCreationService } from 'src/security/token.creation.service';
import { PasswordHelper } from '../password.helper';

describe('UserService', () => {
  let userService: UserService;
  let mockUserStorage: DeepMocked<UserStorage>;
  let mockTokenCreationService: DeepMocked<TokenCreationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
      .useMocker(createMock)
      .compile();

    userService = module.get<UserService>(UserService);
    mockUserStorage = module.get(UserStorage);
    mockTokenCreationService = module.get(TokenCreationService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return user', async () => {
      await userService.getUserById('');

      expect(mockUserStorage.getUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchUsers', () => {
    it('should return users', async () => {
      await userService.searchUsers({
        limit: 20,
        offset: 0,
      });

      expect(mockUserStorage.searchUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should create user when email does not exist', async () => {
      mockUserStorage.getUserCredentialsByEmail.mockResolvedValue(null);

      await userService.createUser({
        name: 'test',
        email: 'test@test.com',
        password: 'test',
      });

      expect(mockUserStorage.getUserCredentialsByEmail).toHaveBeenCalledWith('test@test.com');
      expect(mockUserStorage.createUser).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = new UserCredentialsDto({
        userId: 'existing-user-id',
        hash: 'existing-hash',
        salt: 'existing-salt',
        active: true,
      });

      mockUserStorage.getUserCredentialsByEmail.mockResolvedValue(existingUser);

      await expect(
        userService.createUser({
          name: 'New User',
          email: 'test@test.com',
          password: 'newpassword',
        })
      ).rejects.toThrow(new ConflictException('User with this email already exists'));

      expect(mockUserStorage.getUserCredentialsByEmail).toHaveBeenCalledWith('test@test.com');
      expect(mockUserStorage.createUser).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      await userService.updateUser('', {
        name: 'test',
        active: true,
        password: 'test',
      });

      expect(mockUserStorage.updateUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    const email = 'test@test.com';
    const password = 'test';
    const { hash, salt } = PasswordHelper.generateSaltAndHash(password);

    it('should return login result', async () => {
      mockUserStorage.getUserCredentialsByEmail.mockResolvedValue(
        new UserCredentialsDto({
          userId: 'uuid',
          hash,
          salt,
          active: true,
        }),
      );

      await userService.login({
        email,
        password,
      });

      expect(mockTokenCreationService.createSessionToken).toHaveBeenCalledWith(
        'uuid',
      );
    });

    it('should throw error if user is not found', async () => {
      mockUserStorage.getUserCredentialsByEmail.mockResolvedValue(null);

      await expect(userService.login({ email, password })).rejects.toThrow(
        'Login or password is incorrect',
      );
    });

    it('should throw error if user is not active', async () => {
      mockUserStorage.getUserCredentialsByEmail.mockResolvedValue(
        new UserCredentialsDto({
          userId: 'uuid',
          hash,
          salt,
          active: false,
        }),
      );

      await expect(userService.login({ email, password })).rejects.toThrow(
        'User is not active',
      );
    });

    it('should throw error if password is incorrect', async () => {
      mockUserStorage.getUserCredentialsByEmail.mockResolvedValue(
        new UserCredentialsDto({
          userId: 'uuid',
          hash,
          salt,
          active: true,
        }),
      );

      await expect(
        userService.login({ email, password: 'incorrect' }),
      ).rejects.toThrow('Login or password is incorrect');
    });
  });
});
