import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompensationDto {
  @ApiProperty()
  @IsNumber()
  requestedHours: number;

  @ApiProperty()
  @IsDateString()
  compensationDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveCompensationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}



