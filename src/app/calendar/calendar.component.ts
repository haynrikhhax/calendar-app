import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Appointment } from '../shared/interfaces/calendar-interface';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { AppointmentDialogService } from '../shared/services/appointment-dialog.service';
import { MatButtonModule } from '@angular/material/button';
import { CalendarService } from '../shared/services/calendar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DragDropModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    RouterModule,
    MatButtonModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  currentMonth: Date = new Date();
  daysInMonth: { date: Date; appointments: Appointment[] }[] = [];
  selectedDate: Date | null = null;
  appointments: Appointment[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private appointmentDialogService: AppointmentDialogService,
    private calendarService: CalendarService
  ) { }

  ngOnInit() {
    this.fetchAppointments();
  }

  fetchAppointments() {
    this.appointmentDialogService.getAppointmentsForMonth(this.currentMonth)
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(appointments => {
        this.appointments = appointments;
        this.calendarService.generateMonthDays(this.currentMonth, appointments);
      });

    this.calendarService.daysInMonth$
      .pipe(takeUntil(this.destroy$))
      .subscribe(days => {
        this.daysInMonth = days;
      });
  }

  selectDate(day: { date: Date }) {
    const formattedDate = this.calendarService.formatDate(day.date);
    this.router.navigate([`/calendar/${formattedDate}`]);
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.fetchAppointments();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.fetchAppointments();
  }

  dropAppointment(event: CdkDragDrop<{ appointments: Appointment[]; date: Date }>) {
    if (event.previousContainer === event.container) {
      return;
    }

    const targetDay = event.container.data;
    const appointment: Appointment = event.item.data;

    if (this.calendarService.hasTimeOverlap(appointment, targetDay.appointments)) {
      alert("Cannot move appointment: Time slot is already occupied!");
      return;
    }

    this.appointmentDialogService.updateAppointmentDate(appointment.id, targetDay.date);
    this.fetchAppointments();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
