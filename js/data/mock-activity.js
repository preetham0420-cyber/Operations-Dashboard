/**
 * Mock Activity Audit Stream
 * Simple names: Sarah (Lead), Alex, David, Elena, Marcus
 * Aligned with TASK-001 through TASK-007
 */

export const INITIAL_ACTIVITY = [
  {
    id: "act-01",
    user: "Sarah (Lead)",
    action: "assigned task",
    target: "TASK-001",
    detail: "Assigned Perimeter sensor inspection to Alex",
    timestamp: "2026-08-31T09:00:00Z",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "act-02",
    user: "David",
    action: "updated progress on",
    target: "TASK-002",
    detail: "Updated progress to 60% (Zone A complete)",
    timestamp: "2026-08-31T11:00:00Z",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "act-03",
    user: "Elena",
    action: "submitted leave request",
    target: "LV-101",
    detail: "Personal Leave application for Sept 4 – Sept 5",
    timestamp: "2026-08-31T09:15:00Z",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "act-04",
    user: "Alex",
    action: "completed task",
    target: "TASK-006",
    detail: "Marked Server room temperature check as Closed",
    timestamp: "2026-08-31T15:00:00Z",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "act-05",
    user: "Marcus",
    action: "clocked in for shift",
    target: "SHIFT",
    detail: "Shift started at 10:20 AM",
    timestamp: "2026-08-31T10:20:00Z",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  }
];
