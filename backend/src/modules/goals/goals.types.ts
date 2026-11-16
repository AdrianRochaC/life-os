import {
  GoalCategory,
  GoalPriority,
  GoalStatus,
} from './goals.constants.js';

export interface SerializedContribution {
  id: string;
  amount: number;
  note?: string;
  date: string;
}

export interface SerializedGoal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  monthlySavingTarget?: number;
  estimatedMonthsToComplete: number | null;
  targetDate?: string;
  referenceUrl?: string;
  contributions: SerializedContribution[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalsSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalSavedAmount: number;
  overallProgressPercent: number;
}

export interface GoalsListResponse {
  summary: GoalsSummary;
  items: SerializedGoal[];
}

