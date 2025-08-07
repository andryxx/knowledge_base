import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Get,
  ParseUUIDPipe,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { ArticleService } from '../service/article.service';
import { CreateArticleDto } from '../types/create.article.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { ArticleDto } from '../types/article.dto';
import { ArticleAccessGuard } from 'src/guards/article.access.guard';
import { UpdateArticleDto } from '../types/update.article.dto';
import { SearchArticlesDto } from '../types/search.articles.dto';
import { TokenVerificationService } from 'src/security/token.verification.service';

@ApiTags('Article')
@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly tokenVerificationService: TokenVerificationService,
  ) {}

  @ApiOperation({
    description: 'Create article.',
  })
  @ApiCreatedResponse({
    description: 'Article created.',
    type: ArticleDto,
  })
  @UseGuards(AuthGuard)
  @Post()
  async createArticle(
    @Request() req,
    @Body() body: CreateArticleDto,
  ): Promise<ArticleDto> {
    const userId = req.userId;

    return this.articleService.createArticle({
      userId,
      ...body,
    });
  }

  @ApiOperation({
    description: 'Search articles.',
  })
  @ApiOkResponse({
    description: 'Articles found.',
    type: [ArticleDto],
  })
  @Get('search')
  async searchArticles(
    @Query() query: SearchArticlesDto,
    @Request() req,
  ): Promise<ArticleDto[]> {
    let userId: string;

    if (req.headers.authorization) {
      const [type, token] = req.headers.authorization.split(' ');
      if (type === 'Bearer') {
        userId =
          this.tokenVerificationService.extractUserIdFromSessionToken(token);
      }
    }

    return this.articleService.searchArticles({
      ...query,
      userId,
    });
  }

  @ApiOperation({
    description: 'Get article by ID.',
  })
  @ApiOkResponse({
    description: 'Article found.',
    type: ArticleDto,
  })
  @UseGuards(ArticleAccessGuard)
  @Get(':articleId')
  async getArticleById(
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<ArticleDto> {
    return this.articleService.getArticleById(articleId);
  }

  @ApiOperation({
    description: 'Update article.',
  })
  @ApiOkResponse({
    description: 'Article updated.',
    type: ArticleDto,
  })
  @UseGuards(AuthGuard, ArticleAccessGuard)
  @Patch(':articleId')
  async updateArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() body: UpdateArticleDto,
  ): Promise<ArticleDto> {
    return this.articleService.updateArticle({
      articleId,
      ...body,
    });
  }

  @ApiOperation({
    description: 'Delete article.',
  })
  @ApiOkResponse({
    description: 'Article deleted.',
    type: ArticleDto,
  })
  @UseGuards(AuthGuard, ArticleAccessGuard)
  @Delete(':articleId')
  async deleteArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<void> {
    return this.articleService.deleteArticle(articleId);
  }
}
