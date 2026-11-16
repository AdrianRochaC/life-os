import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  CreateGoalPayload,
  GOAL_CATEGORY_OPTIONS,
  Goal,
  GoalCategory,
  GoalPriority,
} from '../../models/goal.model';

@Component({
  selector: 'app-goal-form-modal',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './goal-form-modal.component.html',
  styleUrl: './goal-form-modal.component.scss',
})
export class GoalFormModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly goal = input<Goal | null>(null);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly close = output<void>();
  readonly submitGoal = output<CreateGoalPayload>();

  readonly categories = GOAL_CATEGORY_OPTIONS;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(500)]],
    category: ['vehicle' as GoalCategory, [Validators.required]],
    priority: ['high' as GoalPriority, [Validators.required]],
    targetAmount: [0, [Validators.required, Validators.min(1)]],
    currentAmount: [0, [Validators.min(0)]],
    monthlySavingTarget: [0, [Validators.min(0)]],
    targetDate: [''],
    referenceUrl: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    effect(() => {
      const current = this.goal();
      if (current) {
        this.form.patchValue({
          title: current.title,
          description: current.description ?? '',
          category: current.category,
          priority: current.priority,
          targetAmount: current.targetAmount,
          currentAmount: current.currentAmount,
          monthlySavingTarget: current.monthlySavingTarget ?? 0,
          targetDate: current.targetDate
            ? current.targetDate.slice(0, 10)
            : '',
          referenceUrl: current.referenceUrl ?? '',
        });
      } else {
        this.form.reset({
          title: '',
          description: '',
          category: 'vehicle',
          priority: 'high',
          targetAmount: 0,
          currentAmount: 0,
          monthlySavingTarget: 0,
          targetDate: '',
          referenceUrl: '',
        });
      }
    });
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateGoalPayload = {
      title: raw.title.trim(),
      category: raw.category,
      priority: raw.priority,
      targetAmount: Number(raw.targetAmount),
      currentAmount: Number(raw.currentAmount) || 0,
    };

    if (raw.description.trim()) {
      payload.description = raw.description.trim();
    }
    if (Number(raw.monthlySavingTarget) > 0) {
      payload.monthlySavingTarget = Number(raw.monthlySavingTarget);
    }
    if (raw.targetDate) {
      payload.targetDate = raw.targetDate;
    }
    if (raw.referenceUrl.trim()) {
      payload.referenceUrl = raw.referenceUrl.trim();
    }

    this.submitGoal.emit(payload);
  }
}
