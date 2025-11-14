import { IsString, IsOptional, IsObject, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  ruleType: string;

  @ApiProperty()
  @IsObject()
  config: Record<string, any>;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

export class UpdateRuleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

export class SimulateRuleDto {
  @ApiProperty()
  @IsObject()
  timeClockData: {
    date: string;
    entry1?: string;
    exit1?: string;
    entry2?: string;
    exit2?: string;
    entry3?: string;
    exit3?: string;
    isHoliday?: boolean;
    isWeekend?: boolean;
    userId: string;
  };

  @ApiProperty()
  @IsObject()
  config: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ruleCode?: string;
}



