import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, Length } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'User object ID.',
  })
  id: string;

  @ApiProperty({
    description: 'Date of creation.',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated at.',
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User email.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Whether a user is active or not.',
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'User name.',
    minLength: 1,
    maxLength: 128,
  })
  @IsString()
  @Length(1, 128)
  name: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
