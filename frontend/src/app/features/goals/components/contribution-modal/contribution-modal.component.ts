import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AddContributionPayload, Goal } from '../../models/goal.model';

@Component({
  selector: 'app-contribution-modal',
  imports: [ReactiveFormsModule, MoneyPipe, TranslatePipe],
  templateUrl: './contribution-modal.component.html',
  styleUrl: './contribution-modal.component.scss',
})
export class ContributionModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly goal = input.required<Goal>();
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly close = output<void>();
  readonly submitContribution = output<AddContributionPayload>();

  readonly quickAmounts = [50000, 100000, 250000, 500000];

  readonly form = this.fb.nonNullable.group({
    amount: [100000, [Validators.required, Validators.min(1)]],
    note: ['', [Validators.maxLength(200)]],
    date: [new Date().toISOString().slice(0, 10)],
  });

  setAmount(amount: number): void {
    this.form.patchValue({ amount });
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: AddContributionPayload = {
      amount: Number(raw.amount),
    };

    if (raw.note.trim()) {
      payload.note = raw.note.trim();
    }
    if (raw.date) {
      payload.date = raw.date;
    }

    this.submitContribution.emit(payload);
  }
}
