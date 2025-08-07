import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsString, Length } from 'class-validator';
import { UserDto } from 'src/user/types/user.dto';
import { AccessEnum } from '@typeorm/models/article.entity';

export class ArticleDto {
  @ApiProperty({
    description: 'Article object UUID.',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Date of creation.',
    type: Date,
    example: '2025-01-07T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated at.',
    type: Date,
    example: '2025-01-07T15:45:30.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Whether an artcle is active or not.',
    example: true,
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'Article header.',
    minLength: 1,
    maxLength: 128,
    example: 'Сара Керриган, Королева клинков.',
  })
  @IsString()
  @Length(1, 128)
  header: string;

  @ApiProperty({
    description: 'Article content.',
    example: 'Сара Керриган - одна из самых знаковых персонажей вселенной StarCraft...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Article tags.',
    example: ['starcraft', 'kerrigan', 'zerg', 'biography'],
  })
  @IsArray()
  tags: string[];

  @ApiProperty({
    description: 'Article access.',
    enum: AccessEnum,
    example: AccessEnum.PUBLIC,
  })
  @IsEnum(AccessEnum)
  access: AccessEnum;

  @ApiProperty({
    description: 'Article author user UUID.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  userId: string;

  @ApiProperty({
    description: 'Article author.',
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      createdAt: '2025-01-01T12:00:00.000Z',
      updatedAt: '2025-01-01T12:00:00.000Z',
      email: 'jim.raynor@example.com',
      active: true,
      name: 'Jim Raynor',
    },
  })
  author: UserDto;

  constructor(partial: Partial<ArticleDto>) {
    Object.assign(this, partial);
  }
}
