/**
 * Mock Authentication & User Accounts Dataset
 * 8 Agents (divided 4 and 4 into Team A and Team B) + 1 Operations Manager (Sarah)
 */

export const INITIAL_TEAMS = [
  {
    id: 'team-a',
    name: 'Team A',
    displayName: 'Team A (Tech & Operations)',
    headId: 'usr-2',
    headName: 'Alex',
    department: 'Tech & Operations',
    description: 'Technical architecture, systems engineering, and operational workflows'
  },
  {
    id: 'team-b',
    name: 'Team B',
    displayName: 'Team B (Field & Logistics)',
    headId: 'usr-6',
    headName: 'David',
    department: 'Field & Logistics',
    description: 'Field response, dispatch coordination, client infrastructure, and logistics'
  }
];

export const MOCK_USERS = [
  // Overall Head
  {
    id: 'usr-1',
    email: 'sarah@company.com',
    password: 'Password123!',
    name: 'Sarah',
    role: 'Operations Manager',
    department: 'Operations Management',
    teamId: 'all',
    isManager: true,
    isTeamHead: false,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 8, completed: 34, onTimeRate: '99.2%', activeIncidents: 2 }
  },

  // Team A (4 Agents)
  {
    id: 'usr-2',
    email: 'alex@company.com',
    password: 'Password123!',
    name: 'Alex',
    role: 'Technical Lead',
    department: 'Tech & Operations',
    teamId: 'team-a',
    isManager: false,
    isTeamHead: true,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 6, completed: 28, onTimeRate: '98.5%', activeIncidents: 1 }
  },
  {
    id: 'usr-3',
    email: 'marcus@company.com',
    password: 'Password123!',
    name: 'Marcus',
    role: 'Operations Agent',
    department: 'Tech & Operations',
    teamId: 'team-a',
    isManager: false,
    isTeamHead: false,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 5, completed: 22, onTimeRate: '96.8%', activeIncidents: 2 }
  },
  {
    id: 'usr-4',
    email: 'chloe@company.com',
    password: 'Password123!',
    name: 'Chloe',
    role: 'Systems Specialist',
    department: 'Tech & Operations',
    teamId: 'team-a',
    isManager: false,
    isTeamHead: false,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 4, completed: 19, onTimeRate: '97.2%', activeIncidents: 1 }
  },
  {
    id: 'usr-5',
    email: 'liam@company.com',
    password: 'Password123!',
    name: 'Liam',
    role: 'Support Specialist',
    department: 'Tech & Operations',
    teamId: 'team-a',
    isManager: false,
    isTeamHead: false,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 5, completed: 21, onTimeRate: '95.4%', activeIncidents: 1 }
  },

  // Team B (4 Agents)
  {
    id: 'usr-6',
    email: 'david@company.com',
    password: 'Password123!',
    name: 'David',
    role: 'Field Supervisor',
    department: 'Field & Logistics',
    teamId: 'team-b',
    isManager: false,
    isTeamHead: true,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 7, completed: 31, onTimeRate: '98.9%', activeIncidents: 2 }
  },
  {
    id: 'usr-7',
    email: 'elena@company.com',
    password: 'Password123!',
    name: 'Elena',
    role: 'Field Agent',
    department: 'Field & Logistics',
    teamId: 'team-b',
    isManager: false,
    isTeamHead: false,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 6, completed: 25, onTimeRate: '97.0%', activeIncidents: 1 }
  },
  {
    id: 'usr-8',
    email: 'maya@company.com',
    password: 'Password123!',
    name: 'Maya',
    role: 'Logistics Coordinator',
    department: 'Field & Logistics',
    teamId: 'team-b',
    isManager: false,
    isTeamHead: false,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 4, completed: 18, onTimeRate: '96.3%', activeIncidents: 1 }
  },
  {
    id: 'usr-9',
    email: 'noah@company.com',
    password: 'Password123!',
    name: 'Noah',
    role: 'Dispatch Specialist',
    department: 'Field & Logistics',
    teamId: 'team-b',
    isManager: false,
    isTeamHead: false,
    shift: '10:00 AM - 5:00 PM',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    stats: { assigned: 5, completed: 20, onTimeRate: '96.0%', activeIncidents: 1 }
  }
];

export const CURRENT_DEFAULT_USER = MOCK_USERS[0];
