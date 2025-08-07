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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiParam,
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
    summary: 'Create article',
    description: 'Create a new article with the provided data.',
  })
  @ApiCreatedResponse({
    description: 'Article successfully created',
    type: ArticleDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
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
    summary: 'Search articles',
    description: 'Search articles with optional filters. Supports pagination and various search criteria.',
  })
  @ApiOkResponse({
    description: 'Articles found successfully',
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
    summary: 'Get article by ID',
    description: 'Retrieve a specific article by its unique identifier.',
  })
  @ApiParam({
    name: 'articleId',
    description: 'The unique identifier of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Article found successfully',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({
    description: 'Article not found',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to access this article',
  })
  @UseGuards(ArticleAccessGuard)
  @Get(':articleId')
  async getArticleById(
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<ArticleDto> {
    return this.articleService.getArticleById(articleId);
  }

  @ApiOperation({
    summary: 'Update article',
    description: 'Update an existing article with new data. Only the provided fields will be updated.',
  })
  @ApiParam({
    name: 'articleId',
    description: 'The unique identifier of the article to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Article successfully updated',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({
    description: 'Article not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this article',
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
    summary: 'Delete article',
    description: 'Permanently delete an article by its ID. This action cannot be undone.',
  })
  @ApiParam({
    name: 'articleId',
    description: 'The unique identifier of the article to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({
    description: 'Article successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Article not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to delete this article',
  })
  @UseGuards(AuthGuard, ArticleAccessGuard)
  @Delete(':articleId')
  async deleteArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<void> {
    return this.articleService.deleteArticle(articleId);
  }
}
