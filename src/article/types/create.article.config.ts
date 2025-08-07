import { AccessEnum } from '@typeorm/models/article.entity';

export interface CreateArticleConfig {
  userId: string;
  header: string;
  content: string;
  tags: string[];
  access: AccessEnum;
}