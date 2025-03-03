import { Routes } from '@angular/router';
import { calendarRoutes } from './calendar/calendar.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'calendar', pathMatch: 'full' },
  ...calendarRoutes,
];
