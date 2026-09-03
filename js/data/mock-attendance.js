/**
 * Mock Attendance Dataset
 * Simple team names: Sarah (Lead), Alex, David, Elena, Marcus
 * Standard working timings: 10:00 AM – 5:00 PM
 */

export const INITIAL_ATTENDANCE_LOGS = [
  // Today's Logs (2026-08-31)
  {
    id: "att-001",
    userEmail: "alex@company.com",
    userName: "Alex",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Technical Agent",
    date: "2026-08-31",
    clockIn: "09:58 AM",
    clockOut: null,
    totalHours: "4.5 hrs",
    status: "Present",
    isOnBreak: false
  },
  {
    id: "att-002",
    userEmail: "david@company.com",
    userName: "David",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Field Agent",
    date: "2026-08-31",
    clockIn: "10:02 AM",
    clockOut: null,
    totalHours: "4.4 hrs",
    status: "Present",
    isOnBreak: false
  },
  {
    id: "att-003",
    userEmail: "marcus@company.com",
    userName: "Marcus",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Operations Agent",
    date: "2026-08-31",
    clockIn: "10:20 AM",
    clockOut: null,
    totalHours: "4.0 hrs",
    status: "Late",
    isOnBreak: true
  },
  {
    id: "att-004",
    userEmail: "elena@company.com",
    userName: "Elena",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Field Agent",
    date: "2026-08-31",
    clockIn: "09:55 AM",
    clockOut: null,
    totalHours: "4.5 hrs",
    status: "Present",
    isOnBreak: false
  },
  // Yesterday's Logs (2026-08-30)
  {
    id: "att-005",
    userEmail: "alex@company.com",
    userName: "Alex",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Technical Agent",
    date: "2026-08-30",
    clockIn: "09:55 AM",
    clockOut: "05:05 PM",
    totalHours: "7.1 hrs",
    status: "Present",
    isOnBreak: false
  },
  {
    id: "att-006",
    userEmail: "david@company.com",
    userName: "David",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Field Agent",
    date: "2026-08-30",
    clockIn: "10:00 AM",
    clockOut: "05:00 PM",
    totalHours: "7.0 hrs",
    status: "Present",
    isOnBreak: false
  },
  {
    id: "att-007",
    userEmail: "elena@company.com",
    userName: "Elena",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Field Agent",
    date: "2026-08-30",
    clockIn: "09:58 AM",
    clockOut: "05:02 PM",
    totalHours: "7.0 hrs",
    status: "Present",
    isOnBreak: false
  },
  {
    id: "att-008",
    userEmail: "marcus@company.com",
    userName: "Marcus",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Operations Agent",
    date: "2026-08-30",
    clockIn: "10:00 AM",
    clockOut: "05:00 PM",
    totalHours: "7.0 hrs",
    status: "Present",
    isOnBreak: false
  }
];

export const INITIAL_ATTENDANCE = INITIAL_ATTENDANCE_LOGS;

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: "lv-101",
    userEmail: "elena@company.com",
    userName: "Elena",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Field Agent",
    leaveType: "Personal Leave",
    startDate: "2026-09-04",
    endDate: "2026-09-05",
    daysCount: 2,
    reason: "Family personal commitment.",
    status: "Pending",
    submittedAt: "2026-08-31T09:15:00Z"
  },
  {
    id: "lv-102",
    userEmail: "david@company.com",
    userName: "David",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Field Agent",
    leaveType: "Sick Leave",
    startDate: "2026-08-25",
    endDate: "2026-08-25",
    daysCount: 1,
    reason: "Medical checkup.",
    status: "Approved",
    submittedAt: "2026-08-24T10:00:00Z",
    reviewedBy: "Sarah (Lead)"
  }
];
