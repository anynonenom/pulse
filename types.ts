
export enum ReservationStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CHECKED_IN = 'checked-in',
  CANCELLED = 'cancelled',
  VOIDED = 'voided'
}

export enum TableZone {
  MAIN_FLOOR = 'Main Floor',
  VIP_LOUNGE = 'VIP Lounge',
  BALCONY = 'Balcony',
  STANDING = 'Standing'
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  table: string;
  zone: TableZone;
  status: ReservationStatus;
  totalAmount: number;
  vip: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  location: string;
  status: 'ACTIVE' | 'SYNCING' | 'OFFLINE' | 'REBOOTING';
  load: string;
  yield: number;
  health: number;
  created_at?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'BREAK' | 'INCIDENT';
  sector: string;
  created_at?: string;
}

export type ViewRole = 'customer' | 'admin' | 'super-admin' | 'zones' | 'access';

export interface AuthUser {
  username: string;
  role: ViewRole;
  token: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface SystemStats {
  globalRevenue: number;
  totalBookings: number;
  activeTenants: number;
  uptime: string;
}
