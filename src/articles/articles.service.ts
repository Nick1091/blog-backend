import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ArticleCreateDto } from './dto/create-article.dto';
import { Article } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArticlesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.article.findMany();
  }

  async createOne(articleCreateDto: ArticleCreateDto): Promise<Article> {
    const date = new Date().toISOString();
    const request = this.prismaService.article.create({
      data: {
        ...articleCreateDto,
        updatedAt: date,
        createdAt: date,
      },
    });
    console.log(request);
    return request;
  }
}
