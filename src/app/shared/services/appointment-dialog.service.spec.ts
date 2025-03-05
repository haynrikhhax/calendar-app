import { TestBed } from '@angular/core/testing';
import { AppointmentDialogService } from './appointment-dialog.service';
import { Appointment } from '../interfaces/calendar-interface';

describe('AppointmentDialogService', () => {
  let service: AppointmentDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentDialogService],
    });

    service = TestBed.inject(AppointmentDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format time correctly', () => {
    expect(service.formatTime('10:30')).toBe('10:30');
    expect(service.formatTime(new Date('2025-03-10T14:45:00'))).toBe('14:45');
    expect(service.formatTime(null)).toBe('');
  });

  it('should format date correctly', () => {
    expect(service.formatDate('2025-03-10')).toBe('2025-03-10');
    expect(service.formatDate(new Date('2025-03-10'))).toBe('2025-03-10');
    expect(service.formatDate(null)).toBe('');
  });

  it('should extract appointment details correctly', () => {
    const formValue = { startTime: '09:00', endTime: '10:30' };
    const selectedDate = new Date('2025-03-10');

    const details = service.extractAppointmentDetails(formValue, selectedDate);

    expect(details.startTime).toEqual(new Date('2025-03-10T09:00:00'));
    expect(details.endTime).toEqual(new Date('2025-03-10T10:30:00'));
  });

  it('should detect time conflicts correctly', () => {
    const existingAppointments: Appointment[] = [
      { id: 1, date: new Date('2025-03-10'), title: 'Meeting', startTime: new Date('2025-03-10T10:00:00'), endTime: new Date('2025-03-10T11:00:00') },
    ];

    const conflictingAppointment: Appointment = {
      id: 2, date: new Date('2025-03-10'), title: 'Doctor', startTime: new Date('2025-03-10T10:30:00'), endTime: new Date('2025-03-10T11:30:00')
    };

    const nonConflictingAppointment: Appointment = {
      id: 3, date: new Date('2025-03-10'), title: 'Lunch', startTime: new Date('2025-03-10T12:00:00'), endTime: new Date('2025-03-10T13:00:00')
    };

    expect(service.hasTimeConflict(existingAppointments, conflictingAppointment.startTime, conflictingAppointment.endTime)).toBeTrue();
    expect(service.hasTimeConflict(existingAppointments, nonConflictingAppointment.startTime, nonConflictingAppointment.endTime)).toBeFalse();
  });

  it('should create an appointment object correctly', () => {
    const formValue = { title: 'Test Event', startTime: '09:00', endTime: '10:00' };
    const selectedDate = new Date('2025-03-10');
    const startTime = new Date('2025-03-10T09:00:00');
    const endTime = new Date('2025-03-10T10:00:00');

    const appointment = service.createAppointmentObject(false, formValue, selectedDate, startTime, endTime);

    expect(appointment.title).toBe('Test Event');
    expect(appointment.startTime).toEqual(startTime);
    expect(appointment.endTime).toEqual(endTime);
    expect(appointment.id).toBeGreaterThan(0);
  });

  it('should get appointments for a specific month', (done) => {
    const mockAppointments: Appointment[] = [
      { id: 1, date: new Date('2025-03-10'), title: 'Meeting', startTime: new Date('2025-03-10T10:00:00'), endTime: new Date('2025-03-10T11:00:00') },
      { id: 2, date: new Date('2025-03-20'), title: 'Conference', startTime: new Date('2025-03-20T14:00:00'), endTime: new Date('2025-03-20T16:00:00') },
    ];

    service['_appointmentsSubject'].next(mockAppointments);

    service.getAppointmentsForMonth(new Date('2025-03-01')).subscribe(filteredAppointments => {
      expect(filteredAppointments.length).toBe(2);
      done();
    });
  });

  it('should add an appointment correctly', () => {
    const newAppointment: Appointment = {
      id: 3,
      date: new Date('2025-03-15'),
      title: 'Lunch',
      startTime: new Date('2025-03-15T12:00:00'),
      endTime: new Date('2025-03-15T13:00:00'),
    };

    service.addAppointment(newAppointment);

    service.appointments$.subscribe(appointments => {
      expect(appointments).toContain(newAppointment);
    });
  });

  it('should update an appointment correctly', () => {
    const existingAppointment: Appointment = {
      id: 1,
      date: new Date('2025-03-10'),
      title: 'Meeting',
      startTime: new Date('2025-03-10T10:00:00'),
      endTime: new Date('2025-03-10T11:00:00'),
    };

    service['_appointmentsSubject'].next([existingAppointment]);

    const updatedAppointment = { ...existingAppointment, title: 'Updated Meeting' };
    service.updateAppointment(updatedAppointment);

    service.appointments$.subscribe(appointments => {
      expect(appointments.find(app => app.id === 1)?.title).toBe('Updated Meeting');
    });
  });

  it('should delete an appointment correctly', () => {
    const appointmentToDelete: Appointment = {
      id: 1,
      date: new Date('2025-03-10'),
      title: 'Meeting',
      startTime: new Date('2025-03-10T10:00:00'),
      endTime: new Date('2025-03-10T11:00:00'),
    };

    service['_appointmentsSubject'].next([appointmentToDelete]);

    service.deleteAppointment(1);

    service.appointments$.subscribe(appointments => {
      expect(appointments.length).toBe(0);
    });
  });

  it('should filter appointments by date', (done) => {
    const mockAppointments: Appointment[] = [
      { id: 1, date: new Date('2025-03-10'), title: 'Meeting', startTime: new Date('2025-03-10T10:00:00'), endTime: new Date('2025-03-10T11:00:00') },
      { id: 2, date: new Date('2025-03-11'), title: 'Conference', startTime: new Date('2025-03-11T14:00:00'), endTime: new Date('2025-03-11T16:00:00') },
    ];

    service['_appointmentsSubject'].next(mockAppointments);

    service.filterAppointmentsByDate(new Date('2025-03-10')).subscribe(filteredAppointments => {
      expect(filteredAppointments.length).toBe(1);
      expect(filteredAppointments[0].title).toBe('Meeting');
      done();
    });
  });

  it('should group appointments by hour', (done) => {
    const mockAppointments: Appointment[] = [
      { id: 1, date: new Date('2025-03-10'), title: 'Meeting', startTime: new Date('2025-03-10T10:00:00'), endTime: new Date('2025-03-10T11:00:00') },
      { id: 2, date: new Date('2025-03-10'), title: 'Conference', startTime: new Date('2025-03-10T10:30:00'), endTime: new Date('2025-03-10T12:00:00') },
    ];

    service.groupAppointmentsByHour(mockAppointments).subscribe(grouped => {
      expect(grouped[10].length).toBe(2);
      expect(grouped[12]).toBeUndefined();
      done();
    });
  });
});
