import { AccessEnum } from '@typeorm/models/article.entity';

export interface UpdateArticleConfig {
  articleId: string;
  active?: boolean;
  header?: string;
  content?: string;
  tags?: string[];
  access?: AccessEnum;
}