import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { AddContributionDto } from './dto/add-contribution.dto.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { QueryGoalsDto } from './dto/query-goals.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalsService } from './goals.service.js';

@ApiTags('goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva meta de compra o ahorro' })
  create(@Body() dto: CreateGoalDto) {
    return this.goalsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar metas con filtros y resumen general' })
  findAll(@Query() query: QueryGoalsDto) {
    return this.goalsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una meta por ID' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.goalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información o estado de una meta' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, dto);
  }

  @Post(':id/contributions')
  @ApiOperation({ summary: 'Registrar un abono hacia una meta' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  addContribution(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AddContributionDto,
  ) {
    return this.goalsService.addContribution(id, dto);
  }

  @Delete(':id/contributions/:contributionId')
  @ApiOperation({ summary: 'Eliminar un abono y recalcular el progreso' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  @ApiParam({ name: 'contributionId', description: 'ObjectId del abono' })
  removeContribution(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('contributionId', ParseObjectIdPipe) contributionId: string,
  ) {
    return this.goalsService.removeContribution(id, contributionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una meta' })
  @ApiParam({ name: 'id', description: 'ObjectId de la meta' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.goalsService.remove(id);
  }
}

