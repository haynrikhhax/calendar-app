import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { Router } from '@angular/router';
import { AppointmentDialogService } from '../shared/services/appointment-dialog.service';
import { CalendarService } from '../shared/services/calendar.service';
import { of } from 'rxjs';
import { Appointment } from '../shared/interfaces/calendar-interface';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAppointmentDialogService: jasmine.SpyObj<AppointmentDialogService>;
  let mockCalendarService: jasmine.SpyObj<CalendarService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAppointmentDialogService = jasmine.createSpyObj('AppointmentDialogService', ['getAppointmentsForMonth', 'updateAppointmentDate']);
    mockCalendarService = jasmine.createSpyObj('CalendarService', ['generateMonthDays', 'formatDate', 'hasTimeOverlap']);

    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AppointmentDialogService, useValue: mockAppointmentDialogService },
        { provide: CalendarService, useValue: mockCalendarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch appointments on init', () => {
    const mockAppointments: Appointment[] = [];
    mockAppointmentDialogService.getAppointmentsForMonth.and.returnValue(of(mockAppointments));
    mockCalendarService.daysInMonth$ = of([]);

    component.ngOnInit();

    expect(mockAppointmentDialogService.getAppointmentsForMonth).toHaveBeenCalledWith(component.currentMonth);
  });

  it('should navigate to selected date', () => {
    const mockDate = new Date('2025-03-10');
    mockCalendarService.formatDate.and.returnValue('03-10-2025');
    component.selectDate({ date: mockDate });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/calendar/03-10-2025']);
  });

  it('should move to the previous month and fetch appointments', () => {
    spyOn(component, 'fetchAppointments');
    const currentMonth = new Date(component.currentMonth);
    component.previousMonth();

    expect(component.currentMonth.getMonth()).toBe(currentMonth.getMonth() - 1);
    expect(component.fetchAppointments).toHaveBeenCalled();
  });

  it('should move to the next month and fetch appointments', () => {
    spyOn(component, 'fetchAppointments');
    const currentMonth = new Date(component.currentMonth);
    component.nextMonth();

    expect(component.currentMonth.getMonth()).toBe(currentMonth.getMonth() + 1);
    expect(component.fetchAppointments).toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
