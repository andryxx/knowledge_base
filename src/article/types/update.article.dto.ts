import { PartialType, PickType } from '@nestjs/swagger';
import { ArticleDto } from './article.dto';

export class UpdateArticleDto extends PartialType(
  PickType(ArticleDto, [
    'active',
    'header',
    'content',
    'tags',
    'access',
  ] as const),
) {
  constructor(partial: Partial<UpdateArticleDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
