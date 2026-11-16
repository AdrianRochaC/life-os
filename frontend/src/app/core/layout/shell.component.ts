import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../auth/auth.service';
import { I18nService, SupportedLang } from '../i18n/i18n.service';
import { HealthApiService } from '../services/health-api.service';
import { ThemeService } from '../theme/theme.service';

interface NavItem {
  labelKey: string;
  route: string;
  soon?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  private readonly healthApi = inject(HealthApiService);
  readonly i18n = inject(I18nService);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  readonly navItems: NavItem[] = [
    { labelKey: 'nav.goals', route: '/goals' },
    { labelKey: 'nav.finances', route: '/finances', soon: true },
    { labelKey: 'nav.study', route: '/study', soon: true },
  ];

  readonly statusOk = computed(
    () =>
      !this.healthApi.unreachable() &&
      this.healthApi.state()?.database === 'connected',
  );

  readonly statusText = computed(() => {
    this.i18n.dictionary();
    if (this.healthApi.unreachable()) {
      return this.i18n.t('health.apiDisconnected');
    }
    const health = this.healthApi.state();
    if (!health) {
      return this.i18n.t('health.checking');
    }
    return health.database === 'connected'
      ? this.i18n.t('health.connected')
      : this.i18n.t('health.mongoStatus', { status: health.database });
  });

  ngOnInit(): void {
    this.healthApi.checkHealth();
  }

  refreshHealth(): void {
    this.healthApi.checkHealth();
  }

  switchLang(lang: SupportedLang): void {
    void this.i18n.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
  }
}
