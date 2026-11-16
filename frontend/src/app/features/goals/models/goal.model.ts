export type GoalCategory =
  | 'vehicle'
  | 'tech'
  | 'home'
  | 'education'
  | 'travel'
  | 'emergency'
  | 'other';

export type GoalPriority = 'high' | 'medium' | 'low';

export type GoalStatus = 'active' | 'completed' | 'paused';

export interface GoalContribution {
  id: string;
  amount: number;
  note?: string;
  date: string;
}

export interface Goal {
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
  contributions: GoalContribution[];
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
  items: Goal[];
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  targetAmount: number;
  currentAmount?: number;
  monthlySavingTarget?: number;
  targetDate?: string;
  referenceUrl?: string;
}

export interface UpdateGoalPayload extends Partial<CreateGoalPayload> {
  status?: GoalStatus;
}

export interface AddContributionPayload {
  amount: number;
  note?: string;
  date?: string;
}

export interface GoalsFilters {
  status?: GoalStatus;
  category?: GoalCategory;
  search?: string;
}

export interface CategoryMeta {
  value: GoalCategory;
  labelKey: string;
  accentColor: string;
  softBg: string;
}

export const GOAL_CATEGORY_OPTIONS: ReadonlyArray<CategoryMeta> = [
  {
    value: 'vehicle',
    labelKey: 'goals.categories.vehicle',
    accentColor: '#ea580c',
    softBg: 'rgba(234, 88, 12, 0.12)',
  },
  {
    value: 'tech',
    labelKey: 'goals.categories.tech',
    accentColor: '#5b5ce6',
    softBg: 'rgba(91, 92, 230, 0.12)',
  },
  {
    value: 'home',
    labelKey: 'goals.categories.home',
    accentColor: '#0d9488',
    softBg: 'rgba(13, 148, 136, 0.12)',
  },
  {
    value: 'education',
    labelKey: 'goals.categories.education',
    accentColor: '#9333ea',
    softBg: 'rgba(147, 51, 234, 0.12)',
  },
  {
    value: 'travel',
    labelKey: 'goals.categories.travel',
    accentColor: '#0284c7',
    softBg: 'rgba(2, 132, 199, 0.12)',
  },
  {
    value: 'emergency',
    labelKey: 'goals.categories.emergency',
    accentColor: '#0ea572',
    softBg: 'rgba(14, 165, 114, 0.12)',
  },
  {
    value: 'other',
    labelKey: 'goals.categories.other',
    accentColor: '#64748b',
    softBg: 'rgba(100, 116, 139, 0.12)',
  },
];

export const GOAL_CATEGORY_MAP: Record<GoalCategory, CategoryMeta> =
  Object.fromEntries(
    GOAL_CATEGORY_OPTIONS.map((item) => [item.value, item]),
  ) as Record<GoalCategory, CategoryMeta>;
