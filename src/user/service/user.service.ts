import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserDto } from '../types/user.dto';
import { SearchUsersConfig } from '../types/search.users.config';
import { UserStorage } from '../storage/user.storage';
import { PasswordHelper } from '../password.helper';
import { TokenCreationService } from 'src/security/token.creation.service';
import { LoginResultDto } from '../types/login.result.dto';
import { LoginConfig } from '../types/login.config';
import { CreateUserDto } from '../types/create.user.dto';
import { UpdateUserDto } from '../types/update.user.dto';
import { UpdateUserConfig } from '../types/update.user.config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userStorage: UserStorage,
    private readonly tokenCreationService: TokenCreationService,
  ) {}

  async getUserById(userId: string): Promise<UserDto> {
    const user = await this.userStorage.getUserById(userId);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async searchUsers(config: SearchUsersConfig): Promise<UserDto[]> {
    return await this.userStorage.searchUsers(config);
  }

  async login(loginConfig: LoginConfig): Promise<LoginResultDto> {
    const { email, password } = loginConfig;

    const credentials = await this.userStorage.getUserCredentialsByEmail(email);
    if (!credentials)
      throw new BadRequestException('Login or password is incorrect');

    const { userId, hash, salt, active } = credentials;

    if (!active) throw new ForbiddenException('User is not active');

    if (
      !PasswordHelper.checkPassword({
        password,
        hash,
        salt,
      })
    ) {
      throw new BadRequestException('Login or password is incorrect');
    }

    const sessionToken = this.tokenCreationService.createSessionToken(userId);

    return { sessionToken };
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    const { password, name, email } = createUserDto;

    const existingUser = await this.userStorage.getUserCredentialsByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const { salt, hash } = PasswordHelper.generateSaltAndHash(password);

    return await this.userStorage.createUser({
      name,
      email,
      hash,
      salt,
    });
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const updateUserConfig: UpdateUserConfig = {
      userId,
      name: updateUserDto.name,
      active: updateUserDto.active,
    };

    if (updateUserDto.password) {
      const { salt, hash } = PasswordHelper.generateSaltAndHash(
        updateUserDto.password,
      );
      updateUserConfig.hash = hash;
      updateUserConfig.salt = salt;
    }

    const user = await this.userStorage.updateUser(updateUserConfig);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
