import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticleStorage } from 'src/article/storage/article.storage';
import { TokenVerificationService } from 'src/security/token.verification.service';
import { AccessEnum } from '@typeorm/models/article.entity';

@Injectable()
export class ArticleAccessGuard implements CanActivate {
  constructor(
    private readonly tokenVerificationService: TokenVerificationService,
    private readonly articleStorage: ArticleStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const articleId = request.params.articleId;

    const article = await this.articleStorage.getArticleById(articleId);
    if (!article) throw new NotFoundException();

    if (article.access === AccessEnum.PUBLIC) return true;

    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    const userId =
      this.tokenVerificationService.extractUserIdFromSessionToken(token);
    if (!userId) throw new UnauthorizedException();
    request['userId'] = userId;

    if (article.access === AccessEnum.PRIVATE && article.userId === userId)
      return true;

    if (article.access === AccessEnum.RESTRICTED) return true;

    return false;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) return;

    const [type, token] = authorizationHeader.split(' ');
    if (type !== 'Bearer') return;

    if (!token) return;

    return token;
  }
}
