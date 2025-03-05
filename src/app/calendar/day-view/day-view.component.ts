import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppointmentDialogService } from '../../shared/services/appointment-dialog.service';
import { Appointment } from '../../shared/interfaces/calendar-interface';
import { Location } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DayViewService } from '../../shared/services/day-view.service';
import { switchMap, take } from 'rxjs';

@Component({
  selector: 'app-day-view',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css'],
})

export class DayViewComponent {
  selectedDate!: Date;
  appointments: Appointment[] = [];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  appointmentsByHour: Record<number, Appointment[]> = {};

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    public appointmentDialogService: AppointmentDialogService,
    public dialog: MatDialog,
    public dayViewService: DayViewService
  ) {
    this.initialize();
  }

  initialize() {
    this.route.paramMap.subscribe((params) => {
      const dateParam = params.get('date');

      if (dateParam) {
        const [month, day, year] = dateParam.split('-');

        this.selectedDate = new Date(+year, +month - 1, +day);
        this.loadAppointmentsForSelectedDay();
      }
    });
  }

  openDialog(appointment: Appointment | null = null, hour: number) {
    this.dayViewService.openAppointmentDialog(this.selectedDate, appointment, hour)
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.loadAppointmentsForSelectedDay();
        }
      });
  }

  loadAppointmentsForSelectedDay() {
    this.appointmentDialogService.filterAppointmentsByDate(this.selectedDate)
      .pipe(
        take(1),
        switchMap(filteredAppointments => {
          this.appointments = filteredAppointments;
          return this.appointmentDialogService.groupAppointmentsByHour(filteredAppointments);
        }),
        take(1)
      )
      .subscribe(groupedAppointments => {
        this.appointmentsByHour = groupedAppointments;
      });
  }

  goBack() {
    this.location.back();
  }

  deleteAppointment(id: number) {
    this.appointmentDialogService.deleteAppointment(id);
    this.loadAppointmentsForSelectedDay();
  }
}
