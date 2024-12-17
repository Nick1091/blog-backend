import { Body, Controller, Get, Post } from '@nestjs/common';

import { ArticlesService } from './articles.service';
import { AuthGuard } from '@nestjs/passport';
import { ArticleCreateDto } from './dto/create-article.dto';

import { UseGuards } from '@nestjs/common';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}
  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  createArticle(@Body() body: ArticleCreateDto) {
    return this.articlesService.createOne(body);
  }
}
