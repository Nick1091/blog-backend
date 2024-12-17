import { PartialType } from '@nestjs/swagger';
import { ArticleCreateDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(ArticleCreateDto) {}
