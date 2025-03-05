import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayViewComponent } from './day-view.component';
import { ActivatedRoute } from '@angular/router';
import { AppointmentDialogService } from '../../shared/services/appointment-dialog.service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DayViewService } from '../../shared/services/day-view.service';
import { of } from 'rxjs';
import { Appointment } from '../../shared/interfaces/calendar-interface';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

describe('DayViewComponent', () => {
  let component: DayViewComponent;
  let fixture: ComponentFixture<DayViewComponent>;
  let mockAppointmentDialogService: jasmine.SpyObj<AppointmentDialogService>;
  let mockDayViewService: jasmine.SpyObj<DayViewService>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  const mockAppointment: Appointment = { id: 1, date: new Date(), startTime: new Date(), endTime: new Date(), title: "Test" };

  beforeEach(async () => {
    mockAppointmentDialogService = jasmine.createSpyObj('AppointmentDialogService', [
      'filterAppointmentsByDate',
      'groupAppointmentsByHour',
      'deleteAppointment'
    ]);
    mockDayViewService = jasmine.createSpyObj('DayViewService', ['openAppointmentDialog']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockAppointmentDialogService.filterAppointmentsByDate.and.returnValue(of([]));
    mockAppointmentDialogService.groupAppointmentsByHour.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DayViewComponent,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AppointmentDialogService, useValue: mockAppointmentDialogService },
        { provide: DayViewService, useValue: mockDayViewService },
        { provide: Location, useValue: mockLocation },
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '03-05-2025' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DayViewComponent);
    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the correct selected date', () => {
    component.initialize();
    expect(component.selectedDate).toEqual(new Date(2025, 2, 5));
  });

  it('should fetch appointments on initialization', () => {
    mockAppointmentDialogService.filterAppointmentsByDate.and.returnValue(of([]));
    mockAppointmentDialogService.groupAppointmentsByHour.and.returnValue(of({}));

    component.loadAppointmentsForSelectedDay();
    expect(mockAppointmentDialogService.filterAppointmentsByDate).toHaveBeenCalledWith(component.selectedDate);
  });

  it('should open dialog and reload appointments if result is true', () => {
    mockDayViewService.openAppointmentDialog.and.returnValue(of(mockAppointment));
    spyOn(component, 'loadAppointmentsForSelectedDay');

    component.openDialog(null, 10);
    expect(mockDayViewService.openAppointmentDialog).toHaveBeenCalled();
    expect(component.loadAppointmentsForSelectedDay).toHaveBeenCalled();
  });

  it('should not reload appointments if dialog result is false', () => {
    mockDayViewService.openAppointmentDialog.and.returnValue(of(null));
    spyOn(component, 'loadAppointmentsForSelectedDay');

    component.openDialog(null, 10);
    expect(mockDayViewService.openAppointmentDialog).toHaveBeenCalled();
    expect(component.loadAppointmentsForSelectedDay).not.toHaveBeenCalled();
  });

  it('should delete an appointment and reload appointments', () => {
    spyOn(component, 'loadAppointmentsForSelectedDay');

    component.deleteAppointment(1);
    expect(mockAppointmentDialogService.deleteAppointment).toHaveBeenCalledWith(1);
    expect(component.loadAppointmentsForSelectedDay).toHaveBeenCalled();
  });

  it('should navigate back on goBack call', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
