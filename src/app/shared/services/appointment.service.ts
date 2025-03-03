import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from '../interfaces/calendar-interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private appointmentsSubject: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  getAppointments(): Appointment[] {
    return this.appointmentsSubject.getValue();
  }

  getAppointmentsForMonth(month: Date): Appointment[] {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const filteredAppointments = this.appointmentsSubject.getValue().filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });

    return filteredAppointments;
  }

  addAppointment(appointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    this.appointmentsSubject.next([...currentAppointments, appointment]);
  }

  deleteAppointment(id: number): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    this.appointmentsSubject.next(currentAppointments.filter(app => app.id !== id));
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    const index = currentAppointments.findIndex(app => app.id === updatedAppointment.id);
    if (index !== -1) {
      currentAppointments[index] = updatedAppointment;
      this.appointmentsSubject.next([...currentAppointments]);
    }
  }
}
