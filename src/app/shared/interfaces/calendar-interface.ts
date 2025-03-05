export interface Appointment {
  id: number;
  title: string;
  date: Date;
  startTime: Date;
  endTime: Date;
}

export interface DialogData {
  id?: number;
  title?: string;
  selectedDate?: Date;
  date?: Date;
  startTime?: string;
  endTime?: string;
}
