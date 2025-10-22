export type Language = 'ar' | 'en' | 'de';

export type Theme = 'light' | 'dark';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  imported?: boolean;
}

export interface ProfileSettings {
  workDaysPerWeek: number;
  workHoursPerDay: number;
  defaultBreakMinutes: number;
  annualVacationDays: number;
  officialHolidays: Holiday[];
  country?: string;
}

export type LogType = 'work' | 'sickLeave' | 'vacation' | 'officialHoliday';

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: LogType;
  startTime: string | null; // ISO string
  endTime: string | null; // ISO string
  breakMinutes: number;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO string
  reminderMinutes: number; // minutes before due date
  isCompleted: boolean;
}