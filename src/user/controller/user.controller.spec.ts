import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { v7 as uuidv7 } from 'uuid';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../types/create.user.dto';
import { UpdateUserDto } from '../types/update.user.dto';
import { LoginDto } from '../types/login.dto';
import { SearchUsersDto } from '../types/search.users.dto';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: DeepMocked<UserService>;

  const userId = uuidv7();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    })
      .useMocker(createMock)
      .compile();

    userController = module.get<UserController>(UserController);
    mockUserService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('login', () => {
    it('should call user service', async () => {
      const loginDto = new LoginDto({});

      await userController.login(new Response(), loginDto);

      expect(mockUserService.login).toHaveBeenCalledTimes(1);
      expect(mockUserService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('searchUsers', () => {
    it('should call user service', async () => {
      const searchUsersDto = new SearchUsersDto({});

      await userController.searchUsers(searchUsersDto);

      expect(mockUserService.searchUsers).toHaveBeenCalledTimes(1);
      expect(mockUserService.searchUsers).toHaveBeenCalledWith(searchUsersDto);
    });
  });

  describe('getUserById', () => {
    it('should call user service', async () => {
      await userController.getUserById(userId);

      expect(mockUserService.getUserById).toHaveBeenCalledTimes(1);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('createUser', () => {
    it('should call user service', async () => {
      const createUserDto = new CreateUserDto();

      await userController.createUser(createUserDto);

      expect(mockUserService.createUser).toHaveBeenCalledTimes(1);
      expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should call user service', async () => {
      const updateUserDto = new UpdateUserDto();

      await userController.updateUser(userId, updateUserDto);

      expect(mockUserService.updateUser).toHaveBeenCalledTimes(1);
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });
});
