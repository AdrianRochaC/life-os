import { Component, computed, input, output, signal } from '@angular/core';
import { LocalizedDatePipe } from '../../../../shared/pipes/localized-date.pipe';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { GOAL_CATEGORY_MAP, Goal } from '../../models/goal.model';

const RING_CIRCUMFERENCE = 2 * Math.PI * 22;

@Component({
  selector: 'app-goal-card',
  imports: [MoneyPipe, TranslatePipe, LocalizedDatePipe],
  templateUrl: './goal-card.component.html',
  styleUrl: './goal-card.component.scss',
})
export class GoalCardComponent {
  readonly goal = input.required<Goal>();

  readonly contribute = output<Goal>();
  readonly edit = output<Goal>();
  readonly togglePause = output<Goal>();
  readonly remove = output<Goal>();
  readonly removeContribution = output<{
    goalId: string;
    contributionId: string;
  }>();

  readonly showHistory = signal(false);
  readonly ringCircumference = RING_CIRCUMFERENCE;

  readonly categoryMeta = computed(
    () => GOAL_CATEGORY_MAP[this.goal().category] ?? GOAL_CATEGORY_MAP.other,
  );

  readonly ringOffset = computed(() => {
    const pct = Math.min(100, Math.max(0, this.goal().progressPercent));
    return RING_CIRCUMFERENCE * (1 - pct / 100);
  });

  toggleHistory(): void {
    this.showHistory.update((current) => !current);
  }
}
