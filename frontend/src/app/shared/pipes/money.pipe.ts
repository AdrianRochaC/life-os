import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Pipe({
  name: 'money',
  pure: false,
})
export class MoneyPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '$ 0';
    }

    const locale = this.i18n.lang() === 'en' ? 'en-US' : 'es-CO';
    const hasDecimals = !Number.isInteger(value);

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(value);
  }
}
