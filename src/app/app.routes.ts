import { Routes } from '@angular/router';
import { MeetingNotes } from './pages/meeting-notes/meeting-notes';
import { About } from './pages/about/about';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'meeting-notes',
    pathMatch: 'full',
  },
  {
    path: 'meeting-notes',
    component: MeetingNotes,
  },
  {
    path: 'about',
    component: About,
  },
];
