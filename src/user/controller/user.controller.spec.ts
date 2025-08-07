import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../types/create.user.dto';
import { UpdateUserDto } from '../types/update.user.dto';
import { LoginDto } from '../types/login.dto';
import { SearchUsersDto } from '../types/search.users.dto';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: DeepMocked<UserService>;

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
      await userController.login(new Response(), new LoginDto({}));

      expect(mockUserService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchUsers', () => {
    it('should call user service', async () => {
      await userController.searchUsers(new SearchUsersDto({}));

      expect(mockUserService.searchUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should call user service', async () => {
      await userController.getUserById('');

      expect(mockUserService.getUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should call user service', async () => {
      await userController.createUser(new CreateUserDto());

      expect(mockUserService.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    it('should call user service', async () => {
      await userController.updateUser('', new UpdateUserDto());

      expect(mockUserService.updateUser).toHaveBeenCalledTimes(1);
    });
  });
});
