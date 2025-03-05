import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DayViewService } from './day-view.service';
import { AppointmentDialogComponent } from '../../appointment-dialog/appointment-dialog.component';
import { Appointment } from '../interfaces/calendar-interface';

describe('DayViewService', () => {
  let service: DayViewService;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AppointmentDialogComponent>>;

  beforeEach(() => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);

    TestBed.configureTestingModule({
      providers: [
        DayViewService,
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    service = TestBed.inject(DayViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open the appointment dialog with an existing appointment', () => {
    const mockAppointment: Appointment = {
      id: 1,
      date: new Date('2025-03-05'),
      title: 'Test Appointment',
      startTime: new Date('2025-03-05T10:00:00'),
      endTime: new Date('2025-03-05T11:00:00'),
    };

    mockDialogRef.afterClosed.and.returnValue(of(mockAppointment));
    mockDialog.open.and.returnValue(mockDialogRef as MatDialogRef<AppointmentDialogComponent>);

    service.openAppointmentDialog(new Date('2025-03-05'), mockAppointment).subscribe(result => {
      expect(result).toEqual(mockAppointment);
    });

    expect(mockDialog.open).toHaveBeenCalledWith(AppointmentDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({
        id: mockAppointment.id,
        title: mockAppointment.title,
        startTime: '10:00',
        endTime: '11:00',
      }),
    }));
  });

  it('should open the appointment dialog without an existing appointment and default to the provided hour', () => {
    mockDialogRef.afterClosed.and.returnValue(of(null));
    mockDialog.open.and.returnValue(mockDialogRef as MatDialogRef<AppointmentDialogComponent>);

    service.openAppointmentDialog(new Date('2025-03-05'), null, 14).subscribe(result => {
      expect(result).toBeNull();
    });

    expect(mockDialog.open).toHaveBeenCalledWith(AppointmentDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({
        selectedDate: new Date('2025-03-05'),
        startTime: '14:00',
      }),
    }));
  });

  it('should correctly convert date to time string', () => {
    const date = new Date('2025-03-05T08:30:00');
    expect(service.getTimeFromDate(date)).toBe('08:30');
  });
});
