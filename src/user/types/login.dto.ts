import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address.',
    example: 'admin@admin.com',
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'User password.',
    example: 'admin',
    minLength: 1,
  })
  @IsString()
  @Length(1, 128)
  password: string;

  constructor(partial: Partial<LoginDto>) {
    Object.assign(this, partial);
  }
}
