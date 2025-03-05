import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AppointmentDialogService } from '../shared/services/appointment-dialog.service';
import { Appointment, DialogData } from '../shared/interfaces/calendar-interface';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';
import { validateTimeOrder } from '../shared/validators/time-validator';

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatDialogModule, MatButtonModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.css'],
})
export class AppointmentDialogComponent {
  appointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private appointmentDialogService: AppointmentDialogService
  ) {
    this.appointmentForm = this.fb.group({
      id: [this.data.id || null],
      title: [this.data.title || '', [Validators.required, Validators.minLength(3)]],
      date: [this.appointmentDialogService.formatDate(this.data.date || this.data.selectedDate), Validators.required],
      startTime: [this.appointmentDialogService.formatTime(this.data.startTime), [Validators.required, Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      endTime: [this.appointmentDialogService.formatTime(this.data.endTime), [Validators.required, Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    },
      { validators: validateTimeOrder() }
    );
  }

  saveAppointment(isUpdate: boolean) {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const selectedDate = this.data.selectedDate || this.data.date ? new Date(this.data.selectedDate || this.data.date!) : new Date(); // Ensure date is always valid
      const { startTime, endTime } = this.appointmentDialogService.extractAppointmentDetails(formValue, selectedDate);

      this.appointmentDialogService.appointments$
        .pipe(take(1))
        .subscribe(existingAppointments => {
          const hasConflict = this.appointmentDialogService.hasTimeConflict(existingAppointments, startTime, endTime, isUpdate ? formValue.id : undefined);

          if (hasConflict) {
            alert('This time slot is already booked. Please choose another time.');
            return;
          }

          const appointment: Appointment = this.appointmentDialogService.createAppointmentObject(isUpdate, formValue, selectedDate, startTime, endTime);

          if (isUpdate) {
            this.appointmentDialogService.updateAppointment(appointment);
          } else {
            this.appointmentDialogService.addAppointment(appointment);
          }

          this.dialogRef.close(appointment);
        });
    } else {
      this.appointmentForm.markAllAsTouched();
    }
  }

  addAppointment() {
    this.saveAppointment(false);
  }

  updateAppointment() {
    this.saveAppointment(true);
  }

  cancel() {
    this.dialogRef.close();
  }
}
