import { Component, OnInit } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Appointment } from '../shared/interfaces/calendar-interface';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../shared/services/appointment.service';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, DatePipe, DragDropModule, MatIconModule, MatToolbarModule, MatDialogModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date();
  daysInMonth: { date: Date; appointments: Appointment[]; appointmentCount: number }[] = [];
  selectedDate: Date | null = null;
  appointments: Appointment[] = [];

  constructor(private router: Router, private appointmentService: AppointmentService) { }

  ngOnInit() {
    this.generateMonthDays();
    this.fetchAppointments();
  }

  generateMonthDays() {
    const lastDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const days: { date: Date; appointments: Appointment[]; appointmentCount: number }[] = [];

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), i);
      const dayAppointments = this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === date.toDateString();
      });

      days.push({
        date: date,
        appointments: dayAppointments,
        appointmentCount: dayAppointments.length,
      });
    }
    this.daysInMonth = days;
  }

  fetchAppointments() {
    this.appointments = this.appointmentService.getAppointmentsForMonth(this.currentMonth);
    this.generateMonthDays();
  }

  selectDate(day: { date: Date }) {
    const formattedDate = this.formatDate(day.date);
    this.router.navigate([`/calendar/${formattedDate}`]);
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

  previousMonth() {
    const prevMonth = new Date(this.currentMonth);
    prevMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.currentMonth = prevMonth;
    this.fetchAppointments();
  }

  nextMonth() {
    const nextMonth = new Date(this.currentMonth);
    nextMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.currentMonth = nextMonth;
    this.fetchAppointments();
  }
}
