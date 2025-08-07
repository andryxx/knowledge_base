import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchUsersDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'How many objects will be returned',
    default: 20,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @Min(0)
  @Max(50)
  @IsInt()
  limit = 20;

  @ApiPropertyOptional({
    example: 0,
    description: 'How many to skip',
    default: 0,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @Min(0)
  @IsInt()
  offset = 0;

  @ApiPropertyOptional({
    example: 'Jim',
    description: 'Filter users by names.',
    type: String,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active.',
    type: Boolean,
  })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  active: boolean;

  constructor(partial: Partial<SearchUsersDto>) {
    Object.assign(this, partial);
  }
}
