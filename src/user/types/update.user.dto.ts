import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, Length, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User name.',
    minLength: 1,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  name?: string;

  @ApiPropertyOptional({
    description: 'User password.',
    minLength: 5,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(5, 128)
  password?: string;

  @ApiPropertyOptional({
    description: 'User active status.',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
