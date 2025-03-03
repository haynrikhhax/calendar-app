import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../shared/services/appointment.service'; // Import the AppointmentService
import { Appointment } from '../../shared/interfaces/calendar-interface';
import { Location } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-day-view',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css'],
})
export class DayViewComponent implements OnInit {
  selectedDate: Date | null = null;
  appointments: Appointment[] = [];
  showForm = false;
  appointmentForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    public appointmentService: AppointmentService
  ) {
    this.appointmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      time: ['', [Validators.required, Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const dateParam = params.get('date');
      if (dateParam) {
        const [month, day, year] = dateParam.split('-');
        this.selectedDate = new Date(+year, +month - 1, +day);
      }
    });

    this.loadAppointmentsForSelectedDay();
  }

  loadAppointmentsForSelectedDay() {
    if (this.selectedDate) {
      this.appointmentService.appointments$.subscribe(appointments => {
        this.appointments = appointments.filter(app =>
          app.date.getDate() === this.selectedDate?.getDate() &&
          app.date.getMonth() === this.selectedDate?.getMonth() &&
          app.date.getFullYear() === this.selectedDate?.getFullYear()
        );
      });
    }
  }

  showHideForm() {
    this.showForm = !this.showForm;
  }

  goBack() {
    this.location.back();
  }

  addAppointment() {
    if (this.appointmentForm.valid && this.selectedDate) {
      const formValue = this.appointmentForm.value;
      const [hours, minutes] = formValue.time.split(':').map((val: string) => parseInt(val));

      const newAppointment: Appointment = {
        id: Math.floor(Math.random() * 1000),
        title: formValue.title,
        date: new Date(this.selectedDate.setHours(hours, minutes)),
      };

      this.appointmentService.addAppointment(newAppointment);
      this.appointmentForm.reset();
    } else {
      this.appointmentForm.markAllAsTouched();
    }
    this.showHideForm();
  }

  deleteAppointment(id: number) {
    this.appointmentService.deleteAppointment(id);
  }
}
