import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  GoalCategory,
  GoalPriority,
  GoalStatus,
} from '../goals.constants.js';

export class QueryGoalsDto {
  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiPropertyOptional({ enum: GoalCategory })
  @IsOptional()
  @IsEnum(GoalCategory)
  category?: GoalCategory;

  @ApiPropertyOptional({ enum: GoalPriority })
  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @ApiPropertyOptional({ description: 'Buscar por título o descripción' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

