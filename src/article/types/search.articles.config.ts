import { AccessEnum } from '@typeorm/models/article.entity';

export interface SearchArticlesConfig {
  limit?: number;
  offset?: number;
  active?: boolean;
  access?: AccessEnum;
  tags?: string[];
  header?: string;
  userId?: string;
}
