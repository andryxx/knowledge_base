import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email.',
    minLength: 1,
    maxLength: 128,
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  @Length(1, 128)
  email: string;

  @ApiProperty({
    description: 'User name.',
    minLength: 1,
    maxLength: 128,
  })
  @IsString()
  @Length(1, 128)
  name: string;

  @ApiProperty({
    description: 'User password.',
    minLength: 5,
    maxLength: 128,
  })
  @IsString()
  @Length(5, 128)
  password: string;
} 