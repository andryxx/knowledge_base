import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserStorage } from './storage/user.storage';
import { JwtModule } from '@nestjs/jwt';
import { SecurityModule } from 'src/security/security.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'typeorm/models/user.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, UserStorage],
  imports: [JwtModule, SecurityModule, TypeOrmModule.forFeature([UserEntity])],
  exports: [UserService],
})
export class UserModule {}
