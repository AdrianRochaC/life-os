import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddContributionDto } from './dto/add-contribution.dto.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { QueryGoalsDto } from './dto/query-goals.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalPriority, GoalStatus } from './goals.constants.js';
import type {
  GoalsListResponse,
  GoalsSummary,
  SerializedContribution,
  SerializedGoal,
} from './goals.types.js';
import { Goal, GoalContribution, GoalDocument } from './schemas/goal.schema.js';

const PRIORITY_WEIGHT: Record<GoalPriority, number> = {
  [GoalPriority.HIGH]: 0,
  [GoalPriority.MEDIUM]: 1,
  [GoalPriority.LOW]: 2,
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Handles goal creation, filtering, progress math, and saving contributions. */
@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goal.name)
    private readonly goalModel: Model<GoalDocument>,
  ) {}

  async create(dto: CreateGoalDto): Promise<SerializedGoal> {
    const initialAmount = dto.currentAmount ?? 0;
    const contributions: GoalContribution[] = [];

    if (initialAmount > 0) {
      contributions.push({
        _id: new Types.ObjectId(),
        amount: initialAmount,
        note: 'Ahorro inicial',
        date: new Date(),
      });
    }

    const status = this.resolveStatus(initialAmount, dto.targetAmount);

    const created = await this.goalModel.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priority: dto.priority,
      status,
      targetAmount: dto.targetAmount,
      currentAmount: initialAmount,
      monthlySavingTarget: dto.monthlySavingTarget,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      referenceUrl: dto.referenceUrl,
      contributions,
    });

    return this.serializeGoal(created);
  }

  async findAll(query: QueryGoalsDto): Promise<GoalsListResponse> {
    const filter = this.buildFilter(query);

    const [docs, allForSummary] = await Promise.all([
      this.goalModel.find(filter).sort({ createdAt: -1 }).exec(),
      this.goalModel
        .find({}, { targetAmount: 1, currentAmount: 1, status: 1 })
        .lean()
        .exec(),
    ]);

    const items = docs
      .map((doc) => this.serializeGoal(doc))
      .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);

    return {
      summary: this.computeSummary(allForSummary),
      items,
    };
  }

  async findOne(id: string): Promise<SerializedGoal> {
    const goal = await this.findDocumentOrThrow(id);
    return this.serializeGoal(goal);
  }

  async update(id: string, dto: UpdateGoalDto): Promise<SerializedGoal> {
    const goal = await this.findDocumentOrThrow(id);

    if (dto.title !== undefined) goal.title = dto.title;
    if (dto.description !== undefined) goal.description = dto.description;
    if (dto.category !== undefined) goal.category = dto.category;
    if (dto.priority !== undefined) goal.priority = dto.priority;
    if (dto.targetAmount !== undefined) goal.targetAmount = dto.targetAmount;
    if (dto.currentAmount !== undefined) goal.currentAmount = dto.currentAmount;
    if (dto.monthlySavingTarget !== undefined) {
      goal.monthlySavingTarget = dto.monthlySavingTarget;
    }
    if (dto.targetDate !== undefined) {
      goal.targetDate = new Date(dto.targetDate);
    }
    if (dto.referenceUrl !== undefined) goal.referenceUrl = dto.referenceUrl;

    goal.status = this.resolveStatus(
      goal.currentAmount,
      goal.targetAmount,
      dto.status ?? goal.status,
    );

    const saved = await goal.save();
    return this.serializeGoal(saved);
  }

  async addContribution(
    id: string,
    dto: AddContributionDto,
  ): Promise<SerializedGoal> {
    const goal = await this.findDocumentOrThrow(id);

    goal.contributions.push({
      _id: new Types.ObjectId(),
      amount: dto.amount,
      note: dto.note,
      date: dto.date ? new Date(dto.date) : new Date(),
    });

    goal.currentAmount = Number((goal.currentAmount + dto.amount).toFixed(2));
    goal.status = this.resolveStatus(
      goal.currentAmount,
      goal.targetAmount,
      goal.status === GoalStatus.PAUSED ? GoalStatus.ACTIVE : goal.status,
    );

    const saved = await goal.save();
    return this.serializeGoal(saved);
  }

  async removeContribution(
    goalId: string,
    contributionId: string,
  ): Promise<SerializedGoal> {
    const goal = await this.findDocumentOrThrow(goalId);
    const index = goal.contributions.findIndex(
      (item) => item._id.toString() === contributionId,
    );

    if (index === -1) {
      throw new NotFoundException(
        `No se encontró el abono "${contributionId}" en esta meta.`,
      );
    }

    const [removed] = goal.contributions.splice(index, 1);
    goal.currentAmount = Math.max(
      0,
      Number((goal.currentAmount - removed.amount).toFixed(2)),
    );
    goal.status = this.resolveStatus(
      goal.currentAmount,
      goal.targetAmount,
      goal.status === GoalStatus.PAUSED ? GoalStatus.PAUSED : undefined,
    );

    const saved = await goal.save();
    return this.serializeGoal(saved);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deleted = await this.goalModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`No se encontró la meta con id "${id}".`);
    }
    return { deleted: true, id };
  }

  private async findDocumentOrThrow(id: string): Promise<GoalDocument> {
    const goal = await this.goalModel.findById(id).exec();
    if (!goal) {
      throw new NotFoundException(`No se encontró la meta con id "${id}".`);
    }
    return goal;
  }

  private buildFilter(query: QueryGoalsDto): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.priority) filter.priority = query.priority;

    if (query.search?.trim()) {
      const pattern = new RegExp(escapeRegex(query.search.trim()), 'i');
      filter.$or = [{ title: pattern }, { description: pattern }];
    }

    return filter;
  }

  private resolveStatus(
    currentAmount: number,
    targetAmount: number,
    requestedStatus?: GoalStatus,
  ): GoalStatus {
    if (requestedStatus === GoalStatus.PAUSED) {
      return GoalStatus.PAUSED;
    }
    if (currentAmount >= targetAmount) {
      return GoalStatus.COMPLETED;
    }
    return GoalStatus.ACTIVE;
  }

  private computeSummary(
    goals: Array<{
      targetAmount: number;
      currentAmount: number;
      status: GoalStatus;
    }>,
  ): GoalsSummary {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(
      (goal) => goal.status === GoalStatus.ACTIVE,
    ).length;
    const completedGoals = goals.filter(
      (goal) => goal.status === GoalStatus.COMPLETED,
    ).length;

    const totalTargetAmount = goals.reduce(
      (sum, goal) => sum + goal.targetAmount,
      0,
    );
    const totalSavedAmount = goals.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0,
    );

    const overallProgressPercent =
      totalTargetAmount > 0
        ? roundPercent(Math.min(100, (totalSavedAmount / totalTargetAmount) * 100))
        : 0;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalSavedAmount,
      overallProgressPercent,
    };
  }

  private serializeGoal(goal: GoalDocument): SerializedGoal {
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    const progressPercent =
      goal.targetAmount > 0
        ? roundPercent(
            Math.min(100, (goal.currentAmount / goal.targetAmount) * 100),
          )
        : 0;

    let estimatedMonthsToComplete: number | null = null;
    if (remainingAmount === 0) {
      estimatedMonthsToComplete = 0;
    } else if (goal.monthlySavingTarget && goal.monthlySavingTarget > 0) {
      estimatedMonthsToComplete = Math.ceil(
        remainingAmount / goal.monthlySavingTarget,
      );
    }

    const contributions: SerializedContribution[] = [...goal.contributions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((item) => ({
        id: item._id.toString(),
        amount: item.amount,
        note: item.note,
        date: new Date(item.date).toISOString(),
      }));

    return {
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remainingAmount,
      progressPercent,
      monthlySavingTarget: goal.monthlySavingTarget,
      estimatedMonthsToComplete,
      targetDate: goal.targetDate?.toISOString(),
      referenceUrl: goal.referenceUrl,
      contributions,
      createdAt: goal.createdAt?.toISOString(),
      updatedAt: goal.updatedAt?.toISOString(),
    };
  }
}

