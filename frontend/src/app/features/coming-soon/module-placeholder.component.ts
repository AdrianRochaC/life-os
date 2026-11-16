import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export interface ModuleRoadmapData {
  titleKey: string;
  subtitleKey: string;
  endpoints: string[];
  featureKeys: string[];
}

@Component({
  selector: 'app-module-placeholder',
  imports: [TranslatePipe],
  template: `
    @if (data(); as info) {
      <section class="placeholder">
        <span class="tag">{{ 'comingSoon.badge' | t }}</span>
        <h1>{{ info.titleKey | t }}</h1>
        <p>{{ info.subtitleKey | t }}</p>

        <div class="cards">
          <article class="card">
            <h3>{{ 'comingSoon.plannedFeatures' | t }}</h3>
            <ul>
              @for (item of info.featureKeys; track item) {
                <li>{{ item | t }}</li>
              }
            </ul>
          </article>

          <article class="card">
            <h3>{{ 'comingSoon.apiArchitecture' | t }}</h3>
            <ul>
              @for (ep of info.endpoints; track ep) {
                <li><code>{{ ep }}</code></li>
              }
            </ul>
          </article>
        </div>
      </section>
    }
  `,
  styles: `
    .placeholder {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tag {
      align-self: flex-start;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.28rem 0.72rem;
      border-radius: 999px;
      background: var(--accent-primary-soft);
      color: var(--accent-primary);
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      letter-spacing: -0.02em;
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      max-width: 65ch;
      line-height: 1.5;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.35rem;
      box-shadow: var(--shadow-card);

      h3 {
        margin: 0 0 0.75rem;
        font-size: 1rem;
      }

      ul {
        margin: 0;
        padding-left: 1.15rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      code {
        color: var(--accent-primary);
        font-size: 0.84rem;
      }
    }
  `,
})
export class ModulePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly data = toSignal(
    this.route.data.pipe(map((d) => d as ModuleRoadmapData)),
  );
}
