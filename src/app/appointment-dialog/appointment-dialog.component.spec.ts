import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentDialogComponent } from './appointment-dialog.component';
import { AppointmentDialogService } from '../shared/services/appointment-dialog.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { validateTimeOrder } from '../shared/validators/time-validator';

describe('AppointmentDialogComponent', () => {
  let component: AppointmentDialogComponent;
  let fixture: ComponentFixture<AppointmentDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AppointmentDialogComponent>>;
  let mockAppointmentDialogService: jasmine.SpyObj<AppointmentDialogService>;

  const mockData = {
    id: null,
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    selectedDate: new Date()
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockAppointmentDialogService = jasmine.createSpyObj('AppointmentDialogService', [
      'formatDate', 'formatTime', 'extractAppointmentDetails', 'hasTimeConflict',
      'createAppointmentObject', 'updateAppointment', 'addAppointment'
    ]);

    mockAppointmentDialogService.formatDate.and.returnValue('2025-03-05');
    mockAppointmentDialogService.formatTime.and.callFake((time: string) => time);
    mockAppointmentDialogService.extractAppointmentDetails.and.returnValue({
      startTime: new Date(),
      endTime: new Date()
    });
    mockAppointmentDialogService.appointments$ = of([]);

    await TestBed.configureTestingModule({
      imports: [AppointmentDialogComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: AppointmentDialogService, useValue: mockAppointmentDialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with given data', () => {
    expect(component.appointmentForm.value).toEqual({
      id: null,
      title: '',
      date: '2025-03-05',
      startTime: '09:00',
      endTime: '10:00'
    });
  });

  it('should mark form as invalid if required fields are missing', () => {
    component.appointmentForm.patchValue({ title: '' });
    expect(component.appointmentForm.valid).toBeFalse();
  });

  it('should close the dialog when cancel is called', () => {
    component.cancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should add a new appointment when addAppointment is called', () => {
    spyOn(component, 'saveAppointment');
    component.addAppointment();
    expect(component.saveAppointment).toHaveBeenCalledWith(false);
  });

  it('should update an appointment when updateAppointment is called', () => {
    spyOn(component, 'saveAppointment');
    component.updateAppointment();
    expect(component.saveAppointment).toHaveBeenCalledWith(true);
  });

  it('should validate time order using custom validator', () => {
    component.appointmentForm.setValidators(validateTimeOrder());
    component.appointmentForm.patchValue({ startTime: '11:00', endTime: '10:00' });
    component.appointmentForm.updateValueAndValidity();
    expect(component.appointmentForm.errors).toBeTruthy();
  });
});
