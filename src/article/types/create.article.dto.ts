import { PickType } from '@nestjs/swagger';
import { ArticleDto } from './article.dto';

export class CreateArticleDto extends PickType(ArticleDto, [
  'header',
  'content',
  'tags',
  'access',
] as const) {}
