import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ContributionModalComponent } from '../../components/contribution-modal/contribution-modal.component';
import { GoalCardComponent } from '../../components/goal-card/goal-card.component';
import { GoalFormModalComponent } from '../../components/goal-form-modal/goal-form-modal.component';
import {
  AddContributionPayload,
  CreateGoalPayload,
  GOAL_CATEGORY_OPTIONS,
  Goal,
  GoalCategory,
  GoalStatus,
} from '../../models/goal.model';
import { GoalsStoreService } from '../../services/goals-store.service';

const HERO_RING_CIRCUMFERENCE = 2 * Math.PI * 34;

@Component({
  selector: 'app-goals-page',
  imports: [
    MoneyPipe,
    TranslatePipe,
    GoalCardComponent,
    GoalFormModalComponent,
    ContributionModalComponent,
  ],
  templateUrl: './goals-page.component.html',
  styleUrl: './goals-page.component.scss',
})
export class GoalsPageComponent implements OnInit {
  readonly store = inject(GoalsStoreService);
  private readonly i18n = inject(I18nService);

  readonly categories = GOAL_CATEGORY_OPTIONS;
  readonly heroRingCircumference = HERO_RING_CIRCUMFERENCE;

  readonly statusTabs: ReadonlyArray<{
    value: GoalStatus | 'all';
    labelKey: string;
  }> = [
    { value: 'all', labelKey: 'goals.filters.all' },
    { value: 'active', labelKey: 'goals.filters.active' },
    { value: 'completed', labelKey: 'goals.filters.completed' },
    { value: 'paused', labelKey: 'goals.filters.paused' },
  ];

  readonly activeStatus = signal<GoalStatus | 'all'>('all');
  readonly activeCategory = signal<GoalCategory | 'all'>('all');
  readonly searchTerm = signal('');

  readonly showFormModal = signal(false);
  readonly editingGoal = signal<Goal | null>(null);
  readonly contributingGoal = signal<Goal | null>(null);
  readonly modalSaving = signal(false);
  readonly modalError = signal<string | null>(null);

  readonly heroRingOffset = computed(() => {
    const pct = Math.min(
      100,
      Math.max(0, this.store.summary().overallProgressPercent),
    );
    return HERO_RING_CIRCUMFERENCE * (1 - pct / 100);
  });

  ngOnInit(): void {
    this.store.loadGoals();
  }

  selectStatus(status: GoalStatus | 'all'): void {
    this.activeStatus.set(status);
    this.applyFilters();
  }

  selectCategory(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as
      | GoalCategory
      | 'all';
    this.activeCategory.set(value);
    this.applyFilters();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.applyFilters();
  }

  openCreateModal(): void {
    this.editingGoal.set(null);
    this.modalError.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(goal: Goal): void {
    this.editingGoal.set(goal);
    this.modalError.set(null);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingGoal.set(null);
    this.modalError.set(null);
  }

  openContributionModal(goal: Goal): void {
    this.modalError.set(null);
    this.contributingGoal.set(goal);
  }

  closeContributionModal(): void {
    this.contributingGoal.set(null);
    this.modalError.set(null);
  }

  saveGoal(payload: CreateGoalPayload): void {
    this.modalSaving.set(true);
    this.modalError.set(null);

    const editing = this.editingGoal();
    const request$ = editing
      ? this.store.updateGoal(editing.id, payload)
      : this.store.createGoal(payload);

    request$.subscribe({
      next: () => {
        this.modalSaving.set(false);
        this.closeFormModal();
      },
      error: (err: unknown) => {
        this.modalSaving.set(false);
        this.modalError.set(this.extractErrorMessage(err));
      },
    });
  }

  saveContribution(payload: AddContributionPayload): void {
    const target = this.contributingGoal();
    if (!target) return;

    this.modalSaving.set(true);
    this.modalError.set(null);

    this.store.addContribution(target.id, payload).subscribe({
      next: () => {
        this.modalSaving.set(false);
        this.closeContributionModal();
      },
      error: (err: unknown) => {
        this.modalSaving.set(false);
        this.modalError.set(this.extractErrorMessage(err));
      },
    });
  }

  toggleGoalPause(goal: Goal): void {
    const nextStatus: GoalStatus =
      goal.status === 'paused' ? 'active' : 'paused';
    this.store.updateGoal(goal.id, { status: nextStatus }).subscribe();
  }

  deleteGoal(goal: Goal): void {
    const confirmed = window.confirm(
      this.i18n.t('goals.states.deleteConfirm', { title: goal.title }),
    );
    if (!confirmed) return;
    this.store.deleteGoal(goal.id).subscribe();
  }

  removeContribution(event: {
    goalId: string;
    contributionId: string;
  }): void {
    this.store
      .removeContribution(event.goalId, event.contributionId)
      .subscribe();
  }

  private applyFilters(): void {
    this.store.loadGoals({
      status:
        this.activeStatus() === 'all'
          ? undefined
          : (this.activeStatus() as GoalStatus),
      category:
        this.activeCategory() === 'all'
          ? undefined
          : (this.activeCategory() as GoalCategory),
      search: this.searchTerm().trim() || undefined,
    });
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const msg = (err.error as { message?: string | string[] } | null)
        ?.message;
      if (Array.isArray(msg)) return msg.join(' · ');
      if (typeof msg === 'string') return msg;
    }
    return this.i18n.t('goalForm.genericError');
  }
}
