import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { Appointment } from '../interfaces/calendar-interface';

describe('AppointmentService', () => {
  let service: AppointmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppointments()', () => {
    it('should return an empty array by default', () => {
      const appointments = service.getAppointments();
      expect(appointments).toEqual([]);
    });
  });

  describe('addAppointment()', () => {
    it('should add a new appointment to the appointments list', () => {
      const newAppointment: Appointment = { id: 1, title: 'Doctor Appointment', date: new Date('2025-03-15T10:00:00') };
      
      service.addAppointment(newAppointment);

      const appointments = service.getAppointments();
      expect(appointments.length).toBe(1);
      expect(appointments[0]).toEqual(newAppointment);
    });
  });

  describe('deleteAppointment()', () => {
    it('should remove an appointment from the list by its id', () => {
      const appointment1: Appointment = { id: 1, title: 'Doctor Appointment', date: new Date('2025-03-15T10:00:00') };
      const appointment2: Appointment = { id: 2, title: 'Meeting', date: new Date('2025-03-16T14:00:00') };
      
      service.addAppointment(appointment1);
      service.addAppointment(appointment2);

      service.deleteAppointment(1);

      const appointments = service.getAppointments();
      expect(appointments.length).toBe(1);
      expect(appointments[0]).toEqual(appointment2);
    });
  });

  describe('updateAppointment()', () => {
    it('should update an existing appointment', () => {
      const appointment: Appointment = { id: 1, title: 'Doctor Appointment', date: new Date('2025-03-15T10:00:00') };
      service.addAppointment(appointment);

      const updatedAppointment: Appointment = { id: 1, title: 'Updated Doctor Appointment', date: new Date('2025-03-15T10:00:00') };
      service.updateAppointment(updatedAppointment);

      const appointments = service.getAppointments();
      expect(appointments.length).toBe(1);
      expect(appointments[0].title).toBe('Updated Doctor Appointment');
    });

    it('should not update the appointment if it does not exist', () => {
      const appointment: Appointment = { id: 1, title: 'Doctor Appointment', date: new Date('2025-03-15T10:00:00') };
      service.addAppointment(appointment);

      const updatedAppointment: Appointment = { id: 2, title: 'Updated Appointment', date: new Date('2025-03-16T14:00:00') };
      service.updateAppointment(updatedAppointment);

      const appointments = service.getAppointments();
      expect(appointments.length).toBe(1);
      expect(appointments[0].title).toBe('Doctor Appointment');
    });
  });

  describe('getAppointmentsForMonth()', () => {
    it('should return appointments for the given month', () => {
      const appointment1: Appointment = { id: 1, title: 'Doctor Appointment', date: new Date('2025-03-15T10:00:00') };
      const appointment2: Appointment = { id: 2, title: 'Meeting', date: new Date('2025-03-16T14:00:00') };
      const appointment3: Appointment = { id: 3, title: 'Workshop', date: new Date('2025-04-01T09:00:00') };
      
      service.addAppointment(appointment1);
      service.addAppointment(appointment2);
      service.addAppointment(appointment3);

      const appointmentsForMarch = service.getAppointmentsForMonth(new Date('2025-03-01'));

      expect(appointmentsForMarch.length).toBe(2);
      expect(appointmentsForMarch).toEqual([appointment1, appointment2]);
    });

    it('should return an empty array if no appointments for the given month', () => {
      const appointment1: Appointment = { id: 1, title: 'Doctor Appointment', date: new Date('2025-03-15T10:00:00') };
      const appointment2: Appointment = { id: 2, title: 'Meeting', date: new Date('2025-03-16T14:00:00') };
      
      service.addAppointment(appointment1);
      service.addAppointment(appointment2);

      const appointmentsForApril = service.getAppointmentsForMonth(new Date('2025-04-01'));

      expect(appointmentsForApril.length).toBe(0);
    });
  });
});
