export interface Appointment {
  id: number;
  title: string;
  date: Date;
}

export interface CalendarDay {
  date: Date;
  appointments: Appointment[];
}
