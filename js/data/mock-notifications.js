/**
 * Mock Notifications Dataset
 * Aligned with TASK-001 through TASK-007
 */

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-01",
    title: "New High Priority Task Assigned",
    message: "Alex: TASK-001: Perimeter sensor inspection is assigned.",
    timestamp: "2026-08-31T09:00:00Z",
    type: "info",
    read: false,
    taskId: "TASK-001"
  },
  {
    id: "notif-02",
    title: "Task In Progress",
    message: "David started work on TASK-002: CCTV camera check.",
    timestamp: "2026-08-31T11:00:00Z",
    type: "info",
    read: false,
    taskId: "TASK-002"
  },
  {
    id: "notif-03",
    title: "Leave Request Submitted",
    message: "Elena applied for Personal Leave (Sept 4 – Sept 5).",
    timestamp: "2026-08-31T09:15:00Z",
    type: "warning",
    read: false,
    taskId: null
  },
  {
    id: "notif-04",
    title: "Task Completed",
    message: "Alex completed TASK-006: Server room temperature check.",
    timestamp: "2026-08-31T15:00:00Z",
    type: "success",
    read: true,
    taskId: "TASK-006"
  }
];
