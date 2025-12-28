
import React from 'react';
import { Inspection, InspectionStatus, User } from './types';

export const MOCK_USER: User = {
  id: '8821',
  name: 'John Doe',
  role: 'Technician',
  email: 'john.doe@firetech.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFG3hbggbYWUwkhRbLza87RiJoSBru6DD1urjf-rI3NLbdzLApml-XUfr5kiW-2-xT6Vf0lHWpYS9laC5OX9Hx5HTcNe82JLtsC-lvdEKZmW_KLfzDO_zFgjC3DQ0OonhSHEQfqRMilc7voYS5mAgDw18tISty5P9O7dS8GxrFgZGodzDjVchh2CZX25jRFPBjlFhk0joRsOsmcKgKgUwt3ln-TfKj_lrXqOsdVrGOdnIml_sgUdS3vfUEasqb256afBDPEGJara4',
  status: 'online'
};

export const RECENT_INSPECTIONS: Inspection[] = [
  {
    id: '4921-A',
    title: 'West Wing Fire Panel',
    location: 'Building A - Level 2',
    date: 'Oct 24, 2023',
    status: InspectionStatus.PENDING_SYNC,
    itemsCompleted: 8,
    totalItems: 12,
    technician: 'John Doe'
  },
  {
    id: '4919-C',
    title: 'Server Room Sprinklers',
    location: 'Building B - Level 1',
    date: 'Oct 23, 2023',
    status: InspectionStatus.DRAFT,
    itemsCompleted: 2,
    totalItems: 5,
    technician: 'John Doe'
  },
  {
    id: '4918-A',
    title: 'Kitchen Heat Sensors',
    location: 'Building A - Level 3',
    date: 'Oct 22, 2023',
    status: InspectionStatus.SUBMITTED,
    itemsCompleted: 15,
    totalItems: 15,
    technician: 'John Doe'
  }
];

export const USERS_LIST: User[] = [
  {
    id: '8821',
    name: 'Mike Ross',
    role: 'Admin',
    email: 'mike.ross@firetech.com',
    avatar: 'https://picsum.photos/id/64/100/100',
    status: 'online'
  },
  {
    id: '9942',
    name: 'Sarah Smith',
    role: 'Supervisor',
    email: 'sarah.s@firetech.com',
    avatar: 'https://picsum.photos/id/65/100/100',
    status: 'online'
  },
  {
    id: '1105',
    name: 'John Doe',
    role: 'Technician',
    email: 'john.doe@firetech.com',
    avatar: 'https://picsum.photos/id/66/100/100',
    status: 'offline'
  }
];
