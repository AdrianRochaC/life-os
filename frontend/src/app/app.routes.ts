import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import type { ModuleRoadmapData } from './features/coming-soon/module-placeholder.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'goals',
        pathMatch: 'full',
      },
      {
        path: 'goals',
        loadComponent: () =>
          import(
            './features/goals/pages/goals-page/goals-page.component'
          ).then((m) => m.GoalsPageComponent),
      },
      {
        path: 'finances',
        loadComponent: () =>
          import(
            './features/coming-soon/module-placeholder.component'
          ).then((m) => m.ModulePlaceholderComponent),
        data: {
          titleKey: 'comingSoon.finances.title',
          subtitleKey: 'comingSoon.finances.subtitle',
          featureKeys: [
            'comingSoon.finances.f1',
            'comingSoon.finances.f2',
            'comingSoon.finances.f3',
            'comingSoon.finances.f4',
          ],
          endpoints: [
            'GET /api/accounts & POST /api/accounts',
            'GET /api/transactions?month=2026-11',
            'POST /api/transactions',
            'GET /api/finances/summary',
          ],
        } satisfies ModuleRoadmapData,
      },
      {
        path: 'study',
        loadComponent: () =>
          import(
            './features/coming-soon/module-placeholder.component'
          ).then((m) => m.ModulePlaceholderComponent),
        data: {
          titleKey: 'comingSoon.study.title',
          subtitleKey: 'comingSoon.study.subtitle',
          featureKeys: [
            'comingSoon.study.f1',
            'comingSoon.study.f2',
            'comingSoon.study.f3',
            'comingSoon.study.f4',
          ],
          endpoints: [
            'GET /api/study/subjects & POST /api/study/subjects',
            'PATCH /api/study/tasks/:id',
            'POST /api/study/sessions',
          ],
        } satisfies ModuleRoadmapData,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'goals',
  },
];
