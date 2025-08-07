import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email.',
    minLength: 1,
    maxLength: 128,
    example: 'jim.raynor@starcraft.com',
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  @Length(1, 128)
  email: string;

  @ApiProperty({
    description: 'User name.',
    minLength: 1,
    maxLength: 128,
    example: 'Jim Raynor',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  @Matches(/^[a-zA-Zа-яА-Я\s\-']+$/, {
    message: 'Name can only contain letters, spaces, hyphens and apostrophes',
  })
  name: string;

  @ApiProperty({
    description: 'User password.',
    minLength: 8,
    maxLength: 128,
    example: 'SecurePassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;
} 