import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GoalCategory,
  GoalPriority,
  GoalStatus,
} from './goals.constants.js';
import { GoalsService } from './goals.service.js';
import { Goal } from './schemas/goal.schema.js';

interface MockGoalRecord {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetAmount: number;
  currentAmount: number;
  monthlySavingTarget?: number;
  targetDate?: Date;
  referenceUrl?: string;
  contributions: Array<{
    _id: Types.ObjectId;
    amount: number;
    note?: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  save: ReturnType<typeof vi.fn>;
}

function makeGoalDoc(overrides: Partial<MockGoalRecord> = {}): MockGoalRecord {
  const doc: MockGoalRecord = {
    _id: new Types.ObjectId(),
    title: 'Moto Yamaha MT-03',
    description: 'Meta principal de movilidad',
    category: GoalCategory.VEHICLE,
    priority: GoalPriority.HIGH,
    status: GoalStatus.ACTIVE,
    targetAmount: 10000,
    currentAmount: 2500,
    monthlySavingTarget: 1500,
    contributions: [],
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
    updatedAt: new Date('2026-11-01T00:00:00.000Z'),
    save: vi.fn(),
    ...overrides,
  };
  doc.save.mockResolvedValue(doc);
  return doc;
}

describe('GoalsService', () => {
  let service: GoalsService;
  let goalModel: {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByIdAndDelete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    goalModel = {
      create: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: getModelToken(Goal.name),
          useValue: goalModel,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
  });

  it('creates a goal with initial contribution and computes progress', async () => {
    const doc = makeGoalDoc({
      contributions: [
        {
          _id: new Types.ObjectId(),
          amount: 2500,
          note: 'Ahorro inicial',
          date: new Date('2026-11-11T00:00:00.000Z'),
        },
      ],
    });
    goalModel.create.mockResolvedValue(doc);

    const result = await service.create({
      title: 'Moto Yamaha MT-03',
      category: GoalCategory.VEHICLE,
      priority: GoalPriority.HIGH,
      targetAmount: 10000,
      currentAmount: 2500,
      monthlySavingTarget: 1500,
    });

    expect(goalModel.create).toHaveBeenCalledTimes(1);
    expect(result.progressPercent).toBe(25);
    expect(result.remainingAmount).toBe(7500);
    expect(result.estimatedMonthsToComplete).toBe(5);
    expect(result.status).toBe(GoalStatus.ACTIVE);
  });

  it('adds contribution and marks goal as completed when reaching target', async () => {
    const doc = makeGoalDoc({
      targetAmount: 5000,
      currentAmount: 4000,
    });
    goalModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(doc),
    });

    const updated = await service.addContribution(doc._id.toString(), {
      amount: 1200,
      note: 'Bono fin de año',
    });

    expect(updated.currentAmount).toBe(5200);
    expect(updated.remainingAmount).toBe(0);
    expect(updated.progressPercent).toBe(100);
    expect(updated.status).toBe(GoalStatus.COMPLETED);
    expect(updated.contributions).toHaveLength(1);
  });

  it('removes contribution and reverts completed status when below target', async () => {
    const contribId = new Types.ObjectId();
    const doc = makeGoalDoc({
      targetAmount: 5000,
      currentAmount: 5000,
      status: GoalStatus.COMPLETED,
      contributions: [
        {
          _id: contribId,
          amount: 1000,
          note: 'Abono duplicado',
          date: new Date(),
        },
      ],
    });
    goalModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(doc),
    });

    const updated = await service.removeContribution(
      doc._id.toString(),
      contribId.toString(),
    );

    expect(updated.currentAmount).toBe(4000);
    expect(updated.status).toBe(GoalStatus.ACTIVE);
    expect(updated.contributions).toHaveLength(0);
  });

  it('returns filtered list sorted by priority alongside overall summary', async () => {
    const lowGoal = makeGoalDoc({
      title: 'Silla ergonómica',
      priority: GoalPriority.LOW,
      targetAmount: 1000,
      currentAmount: 500,
    });
    const highGoal = makeGoalDoc({
      title: 'PC Dev',
      priority: GoalPriority.HIGH,
      targetAmount: 4000,
      currentAmount: 4000,
      status: GoalStatus.COMPLETED,
    });

    const filteredChain = {
      sort: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([lowGoal, highGoal]),
      }),
    };
    const summaryChain = {
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([
          { targetAmount: 1000, currentAmount: 500, status: GoalStatus.ACTIVE },
          {
            targetAmount: 4000,
            currentAmount: 4000,
            status: GoalStatus.COMPLETED,
          },
        ]),
      }),
    };

    goalModel.find
      .mockReturnValueOnce(filteredChain)
      .mockReturnValueOnce(summaryChain);

    const response = await service.findAll({ search: 'a' });

    expect(response.items.map((item) => item.title)).toEqual([
      'PC Dev',
      'Silla ergonómica',
    ]);
    expect(response.summary).toEqual({
      totalGoals: 2,
      activeGoals: 1,
      completedGoals: 1,
      totalTargetAmount: 5000,
      totalSavedAmount: 4500,
      overallProgressPercent: 90,
    });
  });

  it('throws NotFoundException when goal does not exist', async () => {
    goalModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    });

    await expect(
      service.findOne(new Types.ObjectId().toString()),
    ).rejects.toThrow(NotFoundException);
  });
});

