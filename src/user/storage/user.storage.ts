import { Injectable, Logger } from '@nestjs/common';
import { SearchUsersConfig } from '../types/search.users.config';
import { UserDto } from '../types/user.dto';
import { UserCredentialsDto } from '../types/user.credentials.dto';
import { CreateUserConfig } from '../types/create.user.config';
import { UpdateUserConfig } from '../types/update.user.config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UserEntity } from '@typeorm/models/user.entity';

@Injectable()
export class UserStorage {
  private readonly logger = new Logger(UserStorage.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async searchUsers(config: SearchUsersConfig): Promise<UserDto[]> {
    const { limit, offset, name, active } = config;

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      where: {
        active,
        name: name ? ILike(`%${name}%`) : undefined,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        active: true,
        name: true,
        email: true,
      },
    });

    return users.map((user) => new UserDto(user));
  }

  async getUserById(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        active: true,
        name: true,
        email: true,
      },
    });

    if (!user) return null;

    return new UserDto(user);
  }

  async getUserCredentialsByEmail(email: string): Promise<UserCredentialsDto> {
    const user = await this.userRepository.findOne({
      where: { email: ILike(email) },
      select: {
        id: true,
        hash: true,
        salt: true,
        active: true,
      },
    });

    if (!user) return null;

    return new UserCredentialsDto({
      userId: user.id,
      hash: user.hash,
      salt: user.salt,
      active: user.active,
    });
  }

  async createUser(createUserConfig: CreateUserConfig): Promise<UserDto> {
    const newUser = this.userRepository.create({
      ...createUserConfig,
      email: createUserConfig.email.toLowerCase(),
    });

    const { hash, salt, ...user } = await this.userRepository.save(newUser);

    return new UserDto(user);
  }

  async updateUser(updateUserConfig: UpdateUserConfig): Promise<UserDto> {
    const { userId, name, active, hash, salt } = updateUserConfig;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) return null;

    if (name) user.name = name;
    if (active !== undefined) user.active = active;
    if (hash) user.hash = hash;
    if (salt) user.salt = salt;

    const {
      hash: _hash,
      salt: _salt,
      ...updatedUser
    } = await this.userRepository.save(user);

    return new UserDto(updatedUser);
  }
}
