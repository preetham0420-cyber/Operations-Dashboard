/**
 * Mock Notifications Dataset
 * Role and account scoped notifications for team members
 */

export const INITIAL_NOTIFICATIONS = [
  // --- SARAH (Agent Manager: sarah@company.com) ---
  {
    id: "notif-sarah-1",
    recipient: "sarah@company.com",
    title: "Team Task Submitted for Review",
    message: "Alex completed work on TASK-006: Server room temperature check.",
    timestamp: "2026-08-31T15:00:00Z",
    type: "info",
    priority: "Medium",
    read: false,
    taskId: "TASK-006"
  },
  {
    id: "notif-sarah-2",
    recipient: "sarah@company.com",
    title: "Team Leave Request Pending",
    message: "Elena applied for Personal Leave (Sept 4 - Sept 5). Requires manager review.",
    timestamp: "2026-08-31T09:15:00Z",
    type: "warning",
    priority: "High",
    read: false,
    taskId: null
  },
  {
    id: "notif-sarah-3",
    recipient: "sarah@company.com",
    title: "Field Task Started",
    message: "David began work on TASK-002: CCTV camera check.",
    timestamp: "2026-08-31T11:00:00Z",
    type: "info",
    priority: "Low",
    read: true,
    taskId: "TASK-002"
  },

  // --- ALEX (Operations Agent: alex@company.com) ---
  {
    id: "notif-alex-1",
    recipient: "alex@company.com",
    title: "High Priority Task Assigned",
    message: "You have been assigned TASK-001: Perimeter sensor inspection.",
    timestamp: "2026-08-31T09:00:00Z",
    type: "info",
    priority: "High",
    read: false,
    taskId: "TASK-001"
  },
  {
    id: "notif-alex-2",
    recipient: "alex@company.com",
    title: "Task Approved",
    message: "TASK-006: Server room temperature check has been verified and closed.",
    timestamp: "2026-08-31T15:30:00Z",
    type: "success",
    priority: "Medium",
    read: true,
    taskId: "TASK-006"
  },

  // --- DAVID (Field Agent: david@company.com) ---
  {
    id: "notif-david-1",
    recipient: "david@company.com",
    title: "Task Assigned",
    message: "You have been assigned TASK-002: CCTV camera check.",
    timestamp: "2026-08-30T10:30:00Z",
    type: "info",
    priority: "Medium",
    read: false,
    taskId: "TASK-002"
  },
  {
    id: "notif-david-2",
    recipient: "david@company.com",
    title: "Maintenance Task Queued",
    message: "You have been assigned TASK-005: Access card reader maintenance.",
    timestamp: "2026-09-01T10:00:00Z",
    type: "info",
    priority: "Low",
    read: false,
    taskId: "TASK-005"
  },

  // --- ELENA (Dispatch Agent: elena@company.com) ---
  {
    id: "notif-elena-1",
    recipient: "elena@company.com",
    title: "Task Assigned",
    message: "You have been assigned TASK-003: Backup power inspection.",
    timestamp: "2026-08-28T09:00:00Z",
    type: "info",
    priority: "High",
    read: false,
    taskId: "TASK-003"
  },
  {
    id: "notif-elena-2",
    recipient: "elena@company.com",
    title: "Leave Application Submitted",
    message: "Your leave request for Sept 4 - Sept 5 was received and is pending manager approval.",
    timestamp: "2026-08-31T09:15:00Z",
    type: "info",
    priority: "Medium",
    read: false,
    taskId: null
  },
  {
    id: "notif-elena-3",
    recipient: "elena@company.com",
    title: "Inventory Task Assigned",
    message: "You have been assigned TASK-007: First aid station restock.",
    timestamp: "2026-09-01T12:00:00Z",
    type: "info",
    priority: "Low",
    read: true,
    taskId: "TASK-007"
  },

  // --- MARCUS (Support Agent: marcus@company.com) ---
  {
    id: "notif-marcus-1",
    recipient: "marcus@company.com",
    title: "Critical Task Assigned",
    message: "You have been assigned TASK-004: Fire alarm system testing.",
    timestamp: "2026-08-31T08:30:00Z",
    type: "warning",
    priority: "High",
    read: false,
    taskId: "TASK-004"
  },
  {
    id: "notif-marcus-2",
    recipient: "marcus@company.com",
    title: "Shift Roster Confirmed",
    message: "Your night shift roster has been confirmed for the upcoming week.",
    timestamp: "2026-08-30T18:00:00Z",
    type: "info",
    priority: "Low",
    read: true,
    taskId: null
  },

  // --- ALL EMPLOYEES ---
  {
    id: "notif-all-1",
    recipient: "all",
    title: "System Maintenance Scheduled",
    message: "Operations portal scheduled database maintenance tonight at 23:00 UTC.",
    timestamp: "2026-08-31T08:00:00Z",
    type: "info",
    priority: "Low",
    read: false,
    taskId: null
  }
];
