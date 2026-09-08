/**
 * Mock Attendance & Shift Tracking Dataset
 * Roster covering all 8 agents + 1 manager
 */

export const INITIAL_ATTENDANCE = [
  { id: 'att-1', userId: 'usr-1', userName: 'Sarah', role: 'Operations Manager', teamId: 'all', date: '2026-09-07', clockIn: '09:50 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: false },
  { id: 'att-2', userId: 'usr-2', userName: 'Alex', role: 'Technical Lead', teamId: 'team-a', date: '2026-09-07', clockIn: '09:55 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: false },
  { id: 'att-3', userId: 'usr-3', userName: 'Marcus', role: 'Operations Agent', teamId: 'team-a', date: '2026-09-07', clockIn: '10:02 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: false },
  { id: 'att-4', userId: 'usr-4', userName: 'Chloe', role: 'Systems Specialist', teamId: 'team-a', date: '2026-09-07', clockIn: '09:48 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: true },
  { id: 'att-5', userId: 'usr-5', userName: 'Liam', role: 'Support Specialist', teamId: 'team-a', date: '2026-09-07', clockIn: '10:14 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Late', isOnBreak: false },
  { id: 'att-6', userId: 'usr-6', userName: 'David', role: 'Field Supervisor', teamId: 'team-b', date: '2026-09-07', clockIn: '09:52 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: false },
  { id: 'att-7', userId: 'usr-7', userName: 'Elena', role: 'Field Agent', teamId: 'team-b', date: '2026-09-07', clockIn: '09:58 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: false },
  { id: 'att-8', userId: 'usr-8', userName: 'Maya', role: 'Logistics Coordinator', teamId: 'team-b', date: '2026-09-07', clockIn: '10:05 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: false },
  { id: 'att-9', userId: 'usr-9', userName: 'Noah', role: 'Dispatch Specialist', teamId: 'team-b', date: '2026-09-07', clockIn: '09:50 AM', clockOut: null, workHours: 'In Progress', currentStatus: 'Clocked In', status: 'Present', isOnBreak: false }
];

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: 'lvr-101',
    userId: 'usr-4',
    userName: 'Chloe',
    role: 'Systems Specialist',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    type: 'Annual Leave',
    startDate: '2026-09-14',
    endDate: '2026-09-16',
    daysCount: 3,
    reason: 'Family event and personal travel',
    status: 'Pending',
    submittedDate: '2026-09-05'
  },
  {
    id: 'lvr-102',
    userId: 'usr-8',
    userName: 'Maya',
    role: 'Logistics Coordinator',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'Medical Leave',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    daysCount: 1,
    reason: 'Routine medical appointment',
    status: 'Pending',
    submittedDate: '2026-09-06'
  },
  {
    id: 'lvr-103',
    userId: 'usr-3',
    userName: 'Marcus',
    role: 'Operations Agent',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'Personal Time Off',
    startDate: '2026-09-01',
    endDate: '2026-09-02',
    daysCount: 2,
    reason: 'Relocation logistics',
    status: 'Approved',
    reviewedBy: 'Sarah',
    submittedDate: '2026-08-28'
  }
];
