export enum Tab {
  TODO = 'TODO',
  CALENDAR = 'CALENDAR',
  IDEAS = 'IDEAS',
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  archivedDate?: string; // YYYY-MM-DD
}

export interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  title: string;
  time?: string;
  completed?: boolean;
}

export interface Idea {
  id: string;
  content: string;
  color: string; // Tailwind color class for background
  createdAt: number;
  tags?: string[];
}

export const PASTEL_COLORS = [
  'bg-red-100',
  'bg-orange-100',
  'bg-amber-100',
  'bg-green-100',
  'bg-emerald-100',
  'bg-teal-100',
  'bg-cyan-100',
  'bg-sky-100',
  'bg-blue-100',
  'bg-indigo-100',
  'bg-violet-100',
  'bg-purple-100',
  'bg-fuchsia-100',
  'bg-pink-100',
  'bg-rose-100',
];