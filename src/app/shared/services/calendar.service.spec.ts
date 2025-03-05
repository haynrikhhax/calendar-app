import { TestBed } from '@angular/core/testing';
import { CalendarService } from './calendar.service';
import { Appointment } from '../interfaces/calendar-interface';

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalendarService],
    });

    service = TestBed.inject(CalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect time overlap between appointments', () => {
    const existingAppointments: Appointment[] = [
      { id: 1, date: new Date('2025-03-10'), title: 'Meeting', startTime: new Date('2025-03-10T10:00:00'), endTime: new Date('2025-03-10T11:00:00') },
    ];

    const overlappingAppointment: Appointment = {
      id: 2, date: new Date('2025-03-10'), title: 'Doctor Visit', startTime: new Date('2025-03-10T10:30:00'), endTime: new Date('2025-03-10T11:30:00')
    };

    const nonOverlappingAppointment: Appointment = {
      id: 3, date: new Date('2025-03-10'), title: 'Lunch', startTime: new Date('2025-03-10T12:00:00'), endTime: new Date('2025-03-10T13:00:00')
    };

    expect(service.hasTimeOverlap(overlappingAppointment, existingAppointments)).toBeTrue();
    expect(service.hasTimeOverlap(nonOverlappingAppointment, existingAppointments)).toBeFalse();
  });

  it('should generate correct days in a month with appointments', () => {
    const currentMonth = new Date('2025-03-01');
    const mockAppointments: Appointment[] = [
      { id: 1, date: new Date('2025-03-10'), title: 'Meeting', startTime: new Date('2025-03-10T10:00:00'), endTime: new Date('2025-03-10T11:00:00') },
      { id: 2, date: new Date('2025-03-10'), title: 'Doctor', startTime: new Date('2025-03-10T14:00:00'), endTime: new Date('2025-03-10T15:00:00') },
    ];

    service.generateMonthDays(currentMonth, mockAppointments);

    service.daysInMonth$.subscribe(days => {
      expect(days.length).toBe(31);
      const day10 = days.find(day => day.date.getDate() === 10);
      expect(day10).toBeDefined();
      expect(day10?.appointments.length).toBe(2);
      expect(day10?.appointmentCount).toBe(2);
    });
  });

  it('should correctly format dates', () => {
    const date = new Date('2025-03-10');
    expect(service.formatDate(date)).toBe('03-10-2025');
  });
});
