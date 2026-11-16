import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy.js';
import { AddContributionDto } from './dto/add-contribution.dto.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { QueryGoalsDto } from './dto/query-goals.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalsService } from './goals.service.js';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva meta de compra o ahorro' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar metas con filtros y resumen general' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryGoalsDto,
  ) {
    return this.goalsService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una meta por ID' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.goalsService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información o estado de una meta' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.userId, id, dto);
  }

  @Post(':id/contributions')
  @ApiOperation({ summary: 'Registrar un abono hacia una meta' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  addContribution(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AddContributionDto,
  ) {
    return this.goalsService.addContribution(user.userId, id, dto);
  }

  @Delete(':id/contributions/:contributionId')
  @ApiOperation({ summary: 'Eliminar un abono y recalcular el progreso' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  @ApiParam({ name: 'contributionId', description: 'ObjectId del abono' })
  removeContribution(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('contributionId', ParseObjectIdPipe) contributionId: string,
  ) {
    return this.goalsService.removeContribution(
      user.userId,
      id,
      contributionId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una meta' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.goalsService.remove(user.userId, id);
  }
}
