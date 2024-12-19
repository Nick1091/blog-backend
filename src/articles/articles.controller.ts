import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';

import { ArticlesService } from './articles.service';
import { ArticleCreateDto } from './dto/create-article.dto';

import { Article as ArticleModel } from '@prisma/client';
import { CurrentUser } from 'src/common';
import { JWTPayload } from 'src/auth/auth.interface';
import { UpdateArticleDto } from './dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ArticleModel[]> {
    return await this.articlesService.findAll({});
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOne(
    @Body() body: ArticleCreateDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<ArticleModel> {
    return await this.articlesService.createOne({
      ...body,
      user: { connect: { uid: user.sub } },
    });
  }

  @Get(':uid')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<ArticleModel> {
    return await this.articlesService.findOne(uid);
  }

  @Put(':uid')
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Body() updateUserDto: UpdateArticleDto,
    @CurrentUser() jwtUser: JWTPayload,
  ): Promise<ArticleModel> {
    return await this.articlesService.updateOne(
      {
        uid,
        data: updateUserDto,
      },
      jwtUser,
    );
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @CurrentUser() jwtUser: JWTPayload,
  ) {
    return await this.articlesService.deleteOne({ uid, jwtUser });
  }
}
