import { Routes } from '@angular/router';

export const calendarRoutes: Routes = [
  {
    path: 'calendar',
    loadComponent: () => import('./calendar.component').then(m => m.CalendarComponent),
  },
  {
    path: 'calendar/:date',
    loadComponent: () => import('./day-view/day-view.component').then(m => m.DayViewComponent),
  },
];
