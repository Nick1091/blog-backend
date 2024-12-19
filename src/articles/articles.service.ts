import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Article, Prisma, Role } from '@prisma/client';
import { JWTPayload } from 'src/auth/auth.interface';
import { ERRORS_MSGS } from 'src/common';
import { UpdateArticleDto } from './dto';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ArticleWhereUniqueInput;
    where?: Prisma.ArticleWhereInput;
    orderBy?: Prisma.ArticleOrderByWithRelationInput;
  }): Promise<Article[]> {
    const { skip, take, cursor, where, orderBy } = params;
    try {
      return await this.prismaService.article.findMany({
        skip,
        take,
        where,
        cursor,
        orderBy,
      });
    } catch (error) {
      this.logger.error('Not found articles');
      throw new NotFoundException(ERRORS_MSGS.ARTICLE.ARTICLES_NOT_FOUND);
    }
  }

  async createOne(data: Prisma.ArticleCreateInput): Promise<Article> {
    return this.prismaService.article.create({ data }).catch(() => {
      throw new BadRequestException();
    });
  }

  async findOne(uid: string): Promise<Article> {
    const article = await this.prismaService.article.findUnique({
      where: { uid },
    });

    if (!article) {
      throw new NotFoundException(ERRORS_MSGS.ARTICLE.ARTICLE_NOT_FOUND);
    }

    return article;
  }

  async updateOne(
    params: {
      uid: string;
      data: UpdateArticleDto;
    },
    jwtUser: JWTPayload,
  ): Promise<Article> {
    const { uid, data } = params;
    if (!data.userUid) {
      throw new BadRequestException(ERRORS_MSGS.ARTICLE.INVALID_USER_ID);
    }

    const isOwner = jwtUser.sub === data.userUid;
    const isAdmin = jwtUser.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException();
    }

    try {
      return await this.prismaService.article.update({
        where: { uid, userUid: data.userUid },
        data,
      });
    } catch (error) {
      this.logger.error('Article not updated', error);
      throw new BadRequestException(ERRORS_MSGS.ARTICLE.ARTICLE_NOT_FOUND);
    }
  }

  async deleteOne(params: { uid: string; jwtUser: JWTPayload }) {
    const { uid, jwtUser } = params;
    const article = await this.prismaService.article.findUnique({
      where: { uid },
    });

    if (!article) {
      throw new NotFoundException(ERRORS_MSGS.ARTICLE.ARTICLE_NOT_FOUND);
    }

    const isOwner = jwtUser.sub === article.userUid;
    const isAdmin = jwtUser.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException();
    }

    await this.prismaService.article.delete({
      where: { uid },
    });
    return;
  }
}
