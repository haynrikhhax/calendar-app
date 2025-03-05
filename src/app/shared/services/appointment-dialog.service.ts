import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment } from '../interfaces/calendar-interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentDialogService {
  private _appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this._appointmentsSubject.asObservable();

  private get appointments(): Appointment[] {
    return this._appointmentsSubject.getValue();
  }

  formatTime(time: string | Date | null | undefined): string {
    if (!time) return '';
    if (typeof time === 'string' && time.includes(':')) return time;
    const d = new Date(time);
    return d instanceof Date && !isNaN(d.getTime()) ? d.toTimeString().slice(0, 5) : '';
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
  }

  extractAppointmentDetails(
    formValue: { startTime: string; endTime: string },
    selectedDate: Date
  ): { startTime: Date; endTime: Date } {
    const [startHours, startMinutes] = formValue.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formValue.endTime.split(':').map(Number);

    const startTime = new Date(selectedDate);
    startTime.setHours(startHours, startMinutes, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHours, endMinutes, 0);

    return { startTime, endTime };
  }

  hasTimeConflict(existingAppointments: Appointment[], startTime: Date, endTime: Date, appointmentId?: number): boolean {
    return existingAppointments
      .filter(app => !(appointmentId && app.id === appointmentId))
      .some(app => {
        const existingStart = new Date(app.startTime);
        const existingEnd = new Date(app.endTime);
        return startTime < existingEnd && endTime > existingStart;
      });
  }

  createAppointmentObject(
    isUpdate: boolean,
    formValue: { id?: number; title: string; startTime: string; endTime: string },
    selectedDate: Date,
    startTime: Date,
    endTime: Date
  ): Appointment {
    return {
      id: isUpdate ? formValue.id! : Math.floor(Math.random() * 1000),
      title: formValue.title,
      date: selectedDate,
      startTime,
      endTime,
    };
  }
  getAppointmentsForMonth(month: Date): Observable<Appointment[]> {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return this.appointments$.pipe(
      map(appointments =>
        appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= startDate && appointmentDate <= endDate;
        })
      )
    );
  }

  getAppointmentById(id: number): Observable<Appointment | undefined> {
    return this.appointments$.pipe(map(appointments => appointments.find(app => app.id === id)));
  }

  addAppointment(appointment: Appointment): void {
    this._appointmentsSubject.next([...this.appointments, appointment]);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const updatedAppointments = this.appointments.map(app =>
      app.id === updatedAppointment.id ? updatedAppointment : app
    );
    this._appointmentsSubject.next(updatedAppointments);
  }

  deleteAppointment(id: number): void {
    this._appointmentsSubject.next(this.appointments.filter(app => app.id !== id));
  }

  updateAppointmentDate(id: number, newDate: Date): void {
    const updatedAppointments = this.appointments.map(appointment => {
      if (appointment.id === id) {
        const updatedStartTime = new Date(newDate);
        const updatedEndTime = new Date(newDate);

        updatedStartTime.setHours(
          new Date(appointment.startTime).getHours(),
          new Date(appointment.startTime).getMinutes(),
          0
        );

        updatedEndTime.setHours(
          new Date(appointment.endTime).getHours(),
          new Date(appointment.endTime).getMinutes(),
          0
        );

        return { ...appointment, date: newDate, startTime: updatedStartTime, endTime: updatedEndTime };
      }
      return appointment;
    });

    this._appointmentsSubject.next(updatedAppointments);
  }

  filterAppointmentsByDate(selectedDate: Date): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map(appointments =>
        appointments.filter(
          app =>
            app.date.getDate() === selectedDate.getDate() &&
            app.date.getMonth() === selectedDate.getMonth() &&
            app.date.getFullYear() === selectedDate.getFullYear()
        )
      )
    );
  }

  groupAppointmentsByHour(appointments: Appointment[]): Observable<Record<number, Appointment[]>> {
    return of(appointments).pipe(
      map(appointments => {
        const appointmentsByHour: Record<number, Appointment[]> = {};
        appointments.forEach(app => {
          const startHour = new Date(app.startTime).getHours();
          if (!appointmentsByHour[startHour]) {
            appointmentsByHour[startHour] = [];
          }
          appointmentsByHour[startHour].push(app);
        });
        return appointmentsByHour;
      })
    );
  }
}
