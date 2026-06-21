export type Role = 'SUPER_ADMIN' | 'KEPALA_SEKOLAH' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  nip?: string;
  subject?: string;
  class_name?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  subject: string;
  className: string;
}

export interface IndicatorCategory {
  id: string;
  name: string;
  indicators: Indicator[];
}

export interface Indicator {
  id: string;
  categoryId: string;
  number: number;
  text: string;
}

export type ScoreValue = 0 | 1 | 2;

export interface ObservationScore {
  indicatorId: string;
  value: ScoreValue;
}

export interface Observation {
  id: string;
  observerId: string;
  observerName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  date: string;
  scores: ObservationScore[];
  totalScore: number;
  maxScore: number;
  nilai: number;
  category: ScoreCategory;
  createdAt: string;
}

export type ScoreCategory = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';

export type ScheduleStatus = 'Terjadwal' | 'Selesai' | 'Batal';

export interface Schedule {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  observerId: string;
  observerName: string;
  date: string;
  status: ScheduleStatus;
}

export interface DashboardStats {
  totalGuru: number;
  sudahSupervisi: number;
  terjadwal: number;
  belumSupervisi: number;
}

export type Permission =
  | 'view_dashboard'
  | 'view_all_observations'
  | 'view_own_observations'
  | 'create_observation'
  | 'manage_indicators'
  | 'manage_schedules'
  | 'manage_users';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'view_dashboard',
    'view_all_observations',
    'view_own_observations',
    'create_observation',
    'manage_indicators',
    'manage_schedules',
    'manage_users',
  ],
  KEPALA_SEKOLAH: [
    'view_dashboard',
    'view_all_observations',
    'view_own_observations',
    'create_observation',
    'manage_indicators',
    'manage_schedules',
    'manage_users',
  ],
  ADMIN: [
    'view_dashboard',
    'view_all_observations',
    'view_own_observations',
    'create_observation',
    'manage_indicators',
    'manage_schedules',
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  KEPALA_SEKOLAH: 'Kepala Sekolah',
  ADMIN: 'Admin',
};
