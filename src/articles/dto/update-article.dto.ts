import { PartialType } from '@nestjs/swagger';
import { ArticleCreateDto } from './create-article.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateArticleDto extends PartialType(ArticleCreateDto) {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  userUid: string;
}
