import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { DashboardPage } from './pages/dashboard/dashboard';
import { ExplorerPage } from './pages/explorer/explorer';
import { PatternDetailPage } from './pages/pattern-detail/pattern-detail';
import { PracticePage } from './pages/practice/practice';
import { ProgressPage } from './pages/progress/progress';
import { SettingsPage } from './pages/settings/settings';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', component: DashboardPage },
      { path: 'explorer', component: ExplorerPage },
      { path: 'patterns/:id', component: PatternDetailPage },
      { path: 'practice', component: PracticePage },
      { path: 'progress', component: ProgressPage },
      { path: 'settings', component: SettingsPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
