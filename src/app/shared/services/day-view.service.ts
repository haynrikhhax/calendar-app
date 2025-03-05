import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Appointment } from '../interfaces/calendar-interface';
import { AppointmentDialogComponent } from '../../appointment-dialog/appointment-dialog.component';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DayViewService {
  private dialogClosedSubject = new Subject<Appointment | null>();
  dialogClosed$ = this.dialogClosedSubject.asObservable();

  constructor(private dialog: MatDialog) {}

  openAppointmentDialog(
    selectedDate: Date,
    appointment: Appointment | null = null,
    hour?: number
  ): Observable<Appointment | null> {
    let dialogRef: MatDialogRef<AppointmentDialogComponent>;

    if (appointment) {
      dialogRef = this.dialog.open(AppointmentDialogComponent, {
        data: {
          id: appointment.id,
          title: appointment.title,
          selectedDate,
          startTime: this.getTimeFromDate(appointment.startTime),
          endTime: this.getTimeFromDate(appointment.endTime),
        },
        maxWidth: '90vh',
        maxHeight: '90vh',
      });
    } else {
      const formattedTime = `${hour?.toString().padStart(2, '0')}:00`;
      dialogRef = this.dialog.open(AppointmentDialogComponent, {
        data: { selectedDate, startTime: formattedTime },
        maxWidth: '90vh',
        maxHeight: '90vh',
      });
    }

    return new Observable<Appointment | null>((observer) => {
      dialogRef.afterClosed().subscribe((result) => {
        this.dialogClosedSubject.next(result);
        observer.next(result);
        observer.complete();
      });
    });
  }

  getTimeFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
