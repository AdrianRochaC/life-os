import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { GoalCategory, GoalPriority } from '../goals.constants.js';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class CreateGoalDto {
  @ApiProperty({ example: 'Moto Yamaha MT-03', maxLength: 120 })
  @IsString()
  @IsNotEmpty({ message: 'El título de la meta es obligatorio.' })
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @ApiPropertyOptional({
    example: 'Incluye SOAT, casco y matrícula inicial.',
    maxLength: 500,
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: GoalCategory, default: GoalCategory.OTHER })
  @IsOptional()
  @IsEnum(GoalCategory)
  category?: GoalCategory;

  @ApiPropertyOptional({ enum: GoalPriority, default: GoalPriority.MEDIUM })
  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @ApiProperty({ example: 18500000, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'El monto objetivo debe ser mayor o igual a 1.' })
  targetAmount: number;

  @ApiPropertyOptional({ example: 2500000, minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El monto inicial no puede ser negativo.' })
  currentAmount?: number;

  @ApiPropertyOptional({ example: 1200000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlySavingTarget?: number;

  @ApiPropertyOptional({ example: '2027-06-30' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString({}, { message: 'La fecha objetivo debe ser una fecha ISO válida.' })
  targetDate?: string;

  @ApiPropertyOptional({ example: 'https://www.yamaha-motor.com.co/' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUrl(
    { require_protocol: true },
    { message: 'La URL de referencia debe incluir http:// o https://.' },
  )
  @MaxLength(500)
  referenceUrl?: string;
}

