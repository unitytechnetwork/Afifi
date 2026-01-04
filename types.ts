
export enum InspectionStatus {
  DRAFT = 'DRAFT',
  PENDING_SYNC = 'PENDING_SYNC',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  DEFECTS = 'DEFECTS'
}

export enum ItemStatus {
  PENDING = 'PENDING',
  OK = 'OK',
  DEFECT = 'DEFECT'
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: ItemStatus;
  remarks?: string;
  photo?: string;
  zone?: string;
}

export interface Inspection {
  id: string;
  title: string;
  location: string;
  date: string;
  status: InspectionStatus;
  itemsCompleted: number;
  totalItems: number;
  technician: string;
  technicianId?: string; // ID of the assigned technician
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Supervisor' | 'Technician';
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  pin?: string;
}
