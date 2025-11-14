import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}

export class EnableTwoFactorDto {
  // Vazio - usa o usuário autenticado
}

export class VerifyTwoFactorDto {
  @ApiProperty()
  @IsString()
  token: string;
}



