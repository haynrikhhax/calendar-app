import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from '../interfaces/calendar-interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private daysInMonthSubject = new BehaviorSubject<{ date: Date; appointments: Appointment[]; appointmentCount: number }[]>([]);
  daysInMonth$ = this.daysInMonthSubject.asObservable();

  hasTimeOverlap(appointment: Appointment, existingAppointments: Appointment[]): boolean {
    const droppedStartTime = new Date(appointment.startTime);
    const droppedEndTime = new Date(appointment.endTime);

    const getTimeValue = (date: Date) => date.getHours() * 60 + date.getMinutes();
    const droppedStart = getTimeValue(droppedStartTime);
    const droppedEnd = getTimeValue(droppedEndTime);

    return existingAppointments.some((existingAppointment) => {
      const existingStartTime = new Date(existingAppointment.startTime);
      const existingEndTime = new Date(existingAppointment.endTime);

      const existingStart = getTimeValue(existingStartTime);
      const existingEnd = getTimeValue(existingEndTime);

      return (
        (droppedStart >= existingStart && droppedStart < existingEnd) ||
        (droppedEnd > existingStart && droppedEnd <= existingEnd) ||
        (droppedStart <= existingStart && droppedEnd >= existingEnd)
      );
    });
  }

  generateMonthDays(currentMonth: Date, appointments: Appointment[]) {
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const days: { date: Date; appointments: Appointment[]; appointmentCount: number }[] = [];

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const dayAppointments = appointments.filter(appointment =>
        new Date(appointment.date).toDateString() === date.toDateString()
      );

      days.push({
        date: date,
        appointments: dayAppointments,
        appointmentCount: dayAppointments.length,
      });
    }

    this.daysInMonthSubject.next(days);
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }
}
