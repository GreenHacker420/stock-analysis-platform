import { IUser } from '@/models/User';

export interface MockUser extends Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> {
  id: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockAnalysts: MockUser[] = [
  {
    id: 'analyst_001',
    email: 'sarah.johnson@stockanalyzer.com',
    name: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    role: 'analyst',
    password: 'analyst123!',
    isActive: true,
    lastLogin: new Date('2024-01-15T10:30:00Z').toISOString(),
    preferences: {
      riskTolerance: 'medium',
      investmentGoals: ['growth', 'income'],
      notifications: {
        email: true,
        push: true,
      },
    },
    createdAt: new Date('2023-06-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T10:30:00Z').toISOString(),
  },
  {
    id: 'analyst_002',
    email: 'michael.chen@stockanalyzer.com',
    name: 'Michael Chen',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'analyst',
    password: 'analyst456!',
    isActive: true,
    lastLogin: new Date('2024-01-14T16:45:00Z').toISOString(),
    preferences: {
      riskTolerance: 'high',
      investmentGoals: ['growth', 'speculation'],
      notifications: {
        email: true,
        push: false,
      },
    },
    createdAt: new Date('2023-07-15T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-14T16:45:00Z').toISOString(),
  },
  {
    id: 'analyst_003',
    email: 'emily.rodriguez@stockanalyzer.com',
    name: 'Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    role: 'analyst',
    password: 'analyst789!',
    isActive: true,
    lastLogin: new Date('2024-01-15T09:15:00Z').toISOString(),
    preferences: {
      riskTolerance: 'low',
      investmentGoals: ['income', 'preservation'],
      notifications: {
        email: true,
        push: true,
      },
    },
    createdAt: new Date('2023-08-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T09:15:00Z').toISOString(),
  },
  {
    id: 'analyst_004',
    email: 'david.kim@stockanalyzer.com',
    name: 'David Kim',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'analyst',
    password: 'analyst101!',
    isActive: true,
    lastLogin: new Date('2024-01-13T14:20:00Z').toISOString(),
    preferences: {
      riskTolerance: 'medium',
      investmentGoals: ['growth', 'diversification'],
      notifications: {
        email: false,
        push: true,
      },
    },
    createdAt: new Date('2023-09-10T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-13T14:20:00Z').toISOString(),
  },
  {
    id: 'analyst_005',
    email: 'lisa.thompson@stockanalyzer.com',
    name: 'Lisa Thompson',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'analyst',
    password: 'analyst202!',
    isActive: true,
    lastLogin: new Date('2024-01-15T11:00:00Z').toISOString(),
    preferences: {
      riskTolerance: 'high',
      investmentGoals: ['growth', 'technology'],
      notifications: {
        email: true,
        push: true,
      },
    },
    createdAt: new Date('2023-10-05T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T11:00:00Z').toISOString(),
  },
];

export const mockInvestors: MockUser[] = [
  {
    id: 'investor_001',
    email: 'john.doe@email.com',
    name: 'John Doe',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    role: 'investor',
    password: 'investor123!',
    isActive: true,
    lastLogin: new Date('2024-01-15T08:30:00Z').toISOString(),
    preferences: {
      riskTolerance: 'medium',
      investmentGoals: ['retirement', 'growth'],
      notifications: {
        email: true,
        push: false,
      },
    },
    createdAt: new Date('2023-05-15T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T08:30:00Z').toISOString(),
  },
  {
    id: 'investor_002',
    email: 'jane.smith@email.com',
    name: 'Jane Smith',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'investor',
    password: 'investor456!',
    isActive: true,
    lastLogin: new Date('2024-01-14T19:45:00Z').toISOString(),
    preferences: {
      riskTolerance: 'low',
      investmentGoals: ['income', 'preservation'],
      notifications: {
        email: true,
        push: true,
      },
    },
    createdAt: new Date('2023-06-20T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-14T19:45:00Z').toISOString(),
  },
  {
    id: 'investor_003',
    email: 'robert.wilson@email.com',
    name: 'Robert Wilson',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150',
    role: 'investor',
    password: 'investor789!',
    isActive: true,
    lastLogin: new Date('2024-01-15T07:15:00Z').toISOString(),
    preferences: {
      riskTolerance: 'high',
      investmentGoals: ['growth', 'speculation'],
      notifications: {
        email: false,
        push: true,
      },
    },
    createdAt: new Date('2023-07-10T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T07:15:00Z').toISOString(),
  },
  {
    id: 'investor_004',
    email: 'maria.garcia@email.com',
    name: 'Maria Garcia',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'investor',
    password: 'investor101!',
    isActive: true,
    lastLogin: new Date('2024-01-13T12:30:00Z').toISOString(),
    preferences: {
      riskTolerance: 'medium',
      investmentGoals: ['education', 'growth'],
      notifications: {
        email: true,
        push: false,
      },
    },
    createdAt: new Date('2023-08-25T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-13T12:30:00Z').toISOString(),
  },
  {
    id: 'investor_005',
    email: 'james.brown@email.com',
    name: 'James Brown',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'investor',
    password: 'investor202!',
    isActive: true,
    lastLogin: new Date('2024-01-14T15:20:00Z').toISOString(),
    preferences: {
      riskTolerance: 'low',
      investmentGoals: ['retirement', 'income'],
      notifications: {
        email: true,
        push: true,
      },
    },
    createdAt: new Date('2023-09-30T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-14T15:20:00Z').toISOString(),
  },
  {
    id: 'investor_006',
    email: 'susan.davis@email.com',
    name: 'Susan Davis',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
    role: 'investor',
    password: 'investor303!',
    isActive: true,
    lastLogin: new Date('2024-01-15T10:45:00Z').toISOString(),
    preferences: {
      riskTolerance: 'high',
      investmentGoals: ['growth', 'technology'],
      notifications: {
        email: false,
        push: false,
      },
    },
    createdAt: new Date('2023-11-15T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T10:45:00Z').toISOString(),
  },
  {
    id: 'investor_007',
    email: 'thomas.anderson@email.com',
    name: 'Thomas Anderson',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'investor',
    password: 'investor404!',
    isActive: true,
    lastLogin: new Date('2024-01-12T16:30:00Z').toISOString(),
    preferences: {
      riskTolerance: 'medium',
      investmentGoals: ['diversification', 'growth'],
      notifications: {
        email: true,
        push: true,
      },
    },
    createdAt: new Date('2023-12-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-12T16:30:00Z').toISOString(),
  },
];

export const mockUsers = [...mockAnalysts, ...mockInvestors];

export default mockUsers;
