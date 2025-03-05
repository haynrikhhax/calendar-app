import { FormControl, FormGroup } from '@angular/forms';
import { validateTimeOrder } from './time-validator';

describe('TimeValidator', () => {
  let formGroup: FormGroup;

  beforeEach(() => {
    formGroup = new FormGroup(
      {
        startTime: new FormControl(),
        endTime: new FormControl(),
      },
      { validators: validateTimeOrder() }
    );
  });

  it('should return null if endTime is after startTime', () => {
    formGroup.setValue({ startTime: '10:00', endTime: '11:00' });
    expect(formGroup.errors).toBeNull();
  });

  it('should return an error if endTime is before startTime', () => {
    formGroup.setValue({ startTime: '14:00', endTime: '13:30' });
    expect(formGroup.errors).toEqual({ invalidTimeOrder: true });
  });

  it('should return an error if startTime and endTime are the same', () => {
    formGroup.setValue({ startTime: '12:00', endTime: '12:00' });
    expect(formGroup.errors).toEqual({ invalidTimeOrder: true });
  });

  it('should return null if either startTime or endTime is missing', () => {
    formGroup.setValue({ startTime: '10:00', endTime: null });
    expect(formGroup.errors).toBeNull();

    formGroup.setValue({ startTime: null, endTime: '10:00' });
    expect(formGroup.errors).toBeNull();
  });

  it('should handle empty form values gracefully', () => {
    formGroup.setValue({ startTime: '', endTime: '' });
    expect(formGroup.errors).toBeNull();
  });
});
