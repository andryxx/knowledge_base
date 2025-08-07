import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { UserStorage } from './user.storage';
import { UserEntity } from '@typeorm/models/user.entity';
import { ArticleEntity } from '@typeorm/models/article.entity';
import { UserDto } from '../types/user.dto';
import { UserCredentialsDto } from '../types/user.credentials.dto';
import { SearchUsersConfig } from '../types/search.users.config';
import { CreateUserConfig } from '../types/create.user.config';
import { UpdateUserConfig } from '../types/update.user.config';
import { dataSourceOptions } from '@typeorm/data.source';

describe('UserStorage (Integration)', () => {
  let userStorage: UserStorage;
  let userRepository: Repository<UserEntity>;
  let module: TestingModule;

  const userId = uuidv7();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dataSourceOptions,
          entities: [UserEntity, ArticleEntity],
          synchronize: false,
          dropSchema: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([UserEntity, ArticleEntity]),
      ],
      providers: [UserStorage],
    }).compile();

    userStorage = module.get<UserStorage>(UserStorage);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  }, 15000);

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    const testUserEntity = userRepository.create({
      id: userId,
      name: 'Test User',
      email: `test@test.com`,
      active: true,
      hash: 'hash_value',
      salt: 'salt_value',
    });

    await userRepository.save(testUserEntity);
  });

  afterEach(async () => {
    await userRepository.delete(userId);
  });

  it('should be defined', () => {
    expect(userStorage).toBeDefined();
  });

  describe('searchUsers', () => {
    it('should return users array with basic search', async () => {
      const config: SearchUsersConfig = {
        limit: 10,
        offset: 0,
      };

      const result = await userStorage.searchUsers(config);

      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBeGreaterThanOrEqual(1);

      result.forEach((user) => {
        expect(user).toBeInstanceOf(UserDto);
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.active).toBeDefined();
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();

        expect(user).not.toHaveProperty('hash');
        expect(user).not.toHaveProperty('salt');
        expect(user).not.toHaveProperty('articles');
      });
    });

    it('should filter by active status', async () => {
      const config: SearchUsersConfig = {
        limit: 10,
        offset: 0,
        active: true,
      };

      const result = await userStorage.searchUsers(config);

      result.forEach((user) => {
        expect(user.active).toBeTruthy();
      });
    });

    it('should filter by name using ILIKE', async () => {
      const config: SearchUsersConfig = {
        limit: 10,
        offset: 0,
        name: 'Test',
      };

      const result = await userStorage.searchUsers(config);
      const testUser = result.find((user) => user.id === userId);

      expect(testUser).toBeDefined();
      expect(testUser.name).toContain('Test');
    });

    it('should respect limit parameter', async () => {
      const config: SearchUsersConfig = {
        limit: 1,
        offset: 0,
      };

      const result = await userStorage.searchUsers(config);

      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should respect offset parameter', async () => {
      const allUsersConfig: SearchUsersConfig = {
        limit: 100,
        offset: 0,
      };
      const allUsers = await userStorage.searchUsers(allUsersConfig);

      const offsetConfig: SearchUsersConfig = {
        limit: 99,
        offset: 1,
      };
      const offsetUsers = await userStorage.searchUsers(offsetConfig);

      expect(offsetUsers.length).toBe(allUsers.length - 1);

      if (offsetUsers.length > 0) {
        expect(offsetUsers[0].id).not.toBe(allUsers[0].id);
      }
    });

    it('should combine multiple filters', async () => {
      const config: SearchUsersConfig = {
        limit: 10,
        offset: 0,
        name: 'Test',
        active: true,
      };

      const [user] = await userStorage.searchUsers(config);

      expect(user?.active).toBeTruthy();
      expect(user?.name.toLowerCase()).toContain('test');
    });

    it('should return empty array when no users match filters', async () => {
      const config: SearchUsersConfig = {
        limit: 10,
        offset: 0,
        name: 'incorrect_name',
      };

      const result = await userStorage.searchUsers(config);

      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe('getUserById', () => {
    it('should return user when found without hash/salt', async () => {
      const result = await userStorage.getUserById(userId);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe(userId);
      expect(result.name).toBe('Test User');
      expect(result.active).toBeTruthy();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      expect(result).not.toHaveProperty('hash');
      expect(result).not.toHaveProperty('salt');
      expect(result).not.toHaveProperty('articles');

      const rawUser = await userRepository.findOne({ where: { id: userId } });
      expect(rawUser.hash).toBe('hash_value');
      expect(rawUser.salt).toBe('salt_value');
    });

    it('should return null when user not found', async () => {
      const nonExistentUserId = uuidv7();

      const result = await userStorage.getUserById(nonExistentUserId);

      expect(result).toBeNull();
    });
  });

  describe('getUserCredentialsByEmail', () => {
    it('should return user credentials when found', async () => {
      const result =
        await userStorage.getUserCredentialsByEmail('test@test.com');

      expect(result).toBeInstanceOf(UserCredentialsDto);
      expect(result.userId).toBe(userId);
      expect(result.hash).toBe('hash_value');
      expect(result.salt).toBe('salt_value');
      expect(result.active).toBeTruthy();

      expect(result).not.toHaveProperty('name');
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });

    it('should return null when user not found by email', async () => {
      const result = await userStorage.getUserCredentialsByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });

    it('should be case insensitive for email search', async () => {
      const upperCaseResult =
        await userStorage.getUserCredentialsByEmail('TEST@TEST.COM');
      const mixedCaseResult =
        await userStorage.getUserCredentialsByEmail('Test@Test.Com');
      const lowerCaseResult =
        await userStorage.getUserCredentialsByEmail('test@test.com');

      [upperCaseResult, mixedCaseResult, lowerCaseResult].forEach((result) => {
        expect(result).toBeInstanceOf(UserCredentialsDto);
        expect(result.userId).toBe(userId);
        expect(result.hash).toBe('hash_value');
        expect(result.salt).toBe('salt_value');
        expect(result.active).toBeTruthy();
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user and return UserDto without sensitive data', async () => {
      const createUserConfig: CreateUserConfig = {
        email: 'newuser@test.com',
        name: 'New User',
        hash: 'new_hash_value',
        salt: 'new_salt_value',
      };

      const result = await userStorage.createUser(createUserConfig);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBeDefined();
      expect(result.name).toBe('New User');
      expect(result.email).toBe('newuser@test.com');
      expect(result.active).toBeTruthy();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      expect(result).not.toHaveProperty('hash');
      expect(result).not.toHaveProperty('salt');

      const rawUser = await userRepository.findOne({
        where: { id: result.id },
      });
      expect(rawUser.hash).toBe('new_hash_value');
      expect(rawUser.salt).toBe('new_salt_value');

      await userRepository.delete(result.id);
    });

    it('should not allow creating users with duplicate email', async () => {
      const createUserConfig: CreateUserConfig = {
        email: 'test@test.com',
        name: 'Duplicate User',
        hash: 'duplicate_hash',
        salt: 'duplicate_salt',
      };

      await expect(userStorage.createUser(createUserConfig)).rejects.toThrow();
    });

    it('should not allow creating users with duplicate email case insensitive', async () => {
      const createUserConfig: CreateUserConfig = {
        email: 'TEST@TEST.COM',
        name: 'Upper Case User',
        hash: 'uppercase_hash',
        salt: 'uppercase_salt',
      };

      await expect(userStorage.createUser(createUserConfig)).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('should update user name and return UserDto without sensitive data', async () => {
      const updateUserConfig: UpdateUserConfig = {
        userId: userId,
        name: 'Updated Name',
      };

      const result = await userStorage.updateUser(updateUserConfig);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe(userId);
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('test@test.com');
      expect(result.active).toBeTruthy();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      expect(result).not.toHaveProperty('hash');
      expect(result).not.toHaveProperty('salt');

      const rawUser = await userRepository.findOne({ where: { id: userId } });
      expect(rawUser.name).toBe('Updated Name');
      expect(rawUser.hash).toBe('hash_value');
      expect(rawUser.salt).toBe('salt_value');
    });

    it('should update user active status', async () => {
      const updateUserConfig: UpdateUserConfig = {
        userId: userId,
        active: false,
      };

      const result = await userStorage.updateUser(updateUserConfig);

      expect(result.id).toBe(userId);
      expect(result.active).toBeFalsy();

      const rawUser = await userRepository.findOne({ where: { id: userId } });
      expect(rawUser.active).toBeFalsy();
    });

    it('should update user hash and salt', async () => {
      const updateUserConfig: UpdateUserConfig = {
        userId: userId,
        hash: 'new_hash_value',
        salt: 'new_salt_value',
      };

      const result = await userStorage.updateUser(updateUserConfig);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe(userId);
      expect(result).not.toHaveProperty('hash');
      expect(result).not.toHaveProperty('salt');

      const rawUser = await userRepository.findOne({ where: { id: userId } });
      expect(rawUser.hash).toBe('new_hash_value');
      expect(rawUser.salt).toBe('new_salt_value');
    });

    it('should update multiple fields at once', async () => {
      const updateUserConfig: UpdateUserConfig = {
        userId: userId,
        name: 'Multi Update User',
        active: false,
        hash: 'multi_hash',
        salt: 'multi_salt',
      };

      const result = await userStorage.updateUser(updateUserConfig);

      expect(result.id).toBe(userId);
      expect(result.name).toBe('Multi Update User');
      expect(result.active).toBeFalsy();

      const rawUser = await userRepository.findOne({ where: { id: userId } });
      expect(rawUser.name).toBe('Multi Update User');
      expect(rawUser.active).toBeFalsy();
      expect(rawUser.hash).toBe('multi_hash');
      expect(rawUser.salt).toBe('multi_salt');
    });

    it('should not update fields when they are not provided', async () => {
      const updateUserConfig: UpdateUserConfig = {
        userId,
      };

      const result = await userStorage.updateUser(updateUserConfig);

      expect(result.id).toBe(userId);
      expect(result.name).toBe('Test User');
      expect(result.active).toBeTruthy();
      expect(result.email).toBe('test@test.com');

      const rawUser = await userRepository.findOne({ where: { id: userId } });
      expect(rawUser.name).toBe('Test User');
      expect(rawUser.active).toBeTruthy();
      expect(rawUser.hash).toBe('hash_value');
      expect(rawUser.salt).toBe('salt_value');
    });

    it('should return null when user not found', async () => {
      const nonExistentUserId = uuidv7();
      const updateUserConfig: UpdateUserConfig = {
        userId: nonExistentUserId,
        name: 'Non Existent User',
      };

      const result = await userStorage.updateUser(updateUserConfig);

      expect(result).toBeNull();
    });

    it('should handle falsy values correctly for active field', async () => {
      const updateUserConfig: UpdateUserConfig = {
        userId: userId,
        active: false,
      };

      const result = await userStorage.updateUser(updateUserConfig);

      expect(result.active).toBeFalsy();

      const updateBackConfig: UpdateUserConfig = {
        userId: userId,
        active: true,
      };

      const backResult = await userStorage.updateUser(updateBackConfig);
      expect(backResult.active).toBeTruthy();
    });
  });
});
