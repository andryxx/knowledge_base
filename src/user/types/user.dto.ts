import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, Length } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'User object UUID.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Date of creation.',
    type: Date,
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated at.',
    type: Date,
    example: '2025-01-01T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User email.',
    example: 'jim.raynor@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Whether a user is active or not.',
    example: true,
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'User name.',
    minLength: 1,
    maxLength: 128,
    example: 'Jim Raynor',
  })
  @IsString()
  @Length(1, 128)
  name: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
