import { IsEmail, IsString, MinLength } from 'class-validator';
import { Match } from 'src/common';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  @Match('password')
  passwordRepeat: string;
}
