import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validateTimeOrder(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;

    if (startTime && endTime) {
      const start = convertToMinutes(startTime);
      const end = convertToMinutes(endTime);

      return end > start ? null : { invalidTimeOrder: true };
    }

    return null;
  };
}

function convertToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
