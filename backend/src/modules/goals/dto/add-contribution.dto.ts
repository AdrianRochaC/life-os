import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AddContributionDto {
  @ApiProperty({ example: 500000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'El abono debe ser mayor que 0.' })
  amount: number;

  @ApiPropertyOptional({ example: 'Abono quincena noviembre', maxLength: 200 })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value?.trim(),
  )
  @IsString()
  @MaxLength(200)
  note?: string;

  @ApiPropertyOptional({ example: '2026-11-11T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

