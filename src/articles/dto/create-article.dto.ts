import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ArticleCreateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
