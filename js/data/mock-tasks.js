/**
 * Simplified Tasks Dataset
 * 7 tasks total in format "TASK-001: Description"
 * Statuses: Open, Ongoing, Closed
 * Priorities: High, Medium, Low
 */

import { MOCK_USERS } from './mock-auth.js';

export const INITIAL_TASKS = [
  {
    id: "TASK-001",
    title: "TASK-001: Perimeter sensor inspection",
    summary: "Perform physical inspection and signal check on all perimeter sensors.",
    description: "Inspect north and east boundary sensors, test sensitivity triggers, and ensure signal relay to the central console is clear without latency.",
    priority: "High",
    status: "Open",
    progress: 0,
    department: "Technical Support",
    category: "Inspection",
    createdAt: "2026-08-31T09:00:00Z",
    dueDate: "2026-09-04T17:00:00Z",
    slaDeadline: "2026-09-04T17:00:00Z",
    assignee: {
      id: MOCK_USERS[1].id,
      name: MOCK_USERS[1].name,
      role: MOCK_USERS[1].role,
      email: MOCK_USERS[1].email,
      avatar: MOCK_USERS[1].avatar
    },
    createdBy: {
      id: MOCK_USERS[0].id,
      name: MOCK_USERS[0].name
    },
    timeline: [
      {
        id: "tl-101",
        timestamp: "2026-08-31T09:00:00Z",
        author: "Sarah (Lead)",
        type: "status_change",
        message: "Task created and marked as Open."
      }
    ],
    comments: [
      {
        id: "cm-101",
        author: "Sarah (Lead)",
        avatar: MOCK_USERS[0].avatar,
        timestamp: "2026-08-31T09:15:00Z",
        text: "Please prioritize north perimeter sensors first before noon."
      }
    ],
    attachments: [
      { id: "att-1", name: "sensor_layout_map.pdf", size: "1.4 MB", type: "pdf", url: "#" }
    ]
  },
  {
    id: "TASK-002",
    title: "TASK-002: CCTV camera check",
    summary: "Verify live feed connectivity and camera alignment across the facility.",
    description: "Check camera feeds across Zone A and Zone B. Confirm night-vision infrared sensors and PTZ controls respond without delay.",
    priority: "Medium",
    status: "Ongoing",
    progress: 60,
    department: "Field Operations",
    category: "Surveillance",
    createdAt: "2026-08-30T10:30:00Z",
    dueDate: "2026-09-03T17:00:00Z",
    slaDeadline: "2026-09-03T17:00:00Z",
    assignee: {
      id: MOCK_USERS[2].id,
      name: MOCK_USERS[2].name,
      role: MOCK_USERS[2].role,
      email: MOCK_USERS[2].email,
      avatar: MOCK_USERS[2].avatar
    },
    createdBy: {
      id: MOCK_USERS[0].id,
      name: MOCK_USERS[0].name
    },
    timeline: [
      {
        id: "tl-201",
        timestamp: "2026-08-30T10:30:00Z",
        author: "Sarah (Lead)",
        type: "status_change",
        message: "Task assigned to David."
      },
      {
        id: "tl-202",
        timestamp: "2026-08-31T11:00:00Z",
        author: "David",
        type: "status_change",
        message: "Started camera checks in Zone A. Status moved to Ongoing."
      }
    ],
    comments: [
      {
        id: "cm-201",
        author: "David",
        avatar: MOCK_USERS[2].avatar,
        timestamp: "2026-08-31T11:30:00Z",
        text: "Zone A cameras 1 through 6 are clear. Moving to Zone B."
      }
    ],
    attachments: []
  },
  {
    id: "TASK-003",
    title: "TASK-003: Backup power inspection",
    summary: "Routine load test and fuel level check on backup diesel generator.",
    description: "Perform scheduled fuel level measurement, oil viscosity check, and run generator on load for 15 minutes to confirm seamless cutover.",
    priority: "Low",
    status: "Closed",
    progress: 100,
    department: "Field Operations",
    category: "Facilities",
    createdAt: "2026-08-28T09:00:00Z",
    dueDate: "2026-08-30T16:00:00Z",
    slaDeadline: "2026-08-30T16:00:00Z",
    assignee: {
      id: MOCK_USERS[3].id,
      name: MOCK_USERS[3].name,
      role: MOCK_USERS[3].role,
      email: MOCK_USERS[3].email,
      avatar: MOCK_USERS[3].avatar
    },
    createdBy: {
      id: MOCK_USERS[0].id,
      name: MOCK_USERS[0].name
    },
    timeline: [
      {
        id: "tl-301",
        timestamp: "2026-08-28T09:00:00Z",
        author: "Sarah (Lead)",
        type: "status_change",
        message: "Task created."
      },
      {
        id: "tl-302",
        timestamp: "2026-08-30T14:30:00Z",
        author: "Elena",
        type: "status_change",
        message: "Load test successful. Task marked Closed."
      }
    ],
    comments: [
      {
        id: "cm-301",
        author: "Elena",
        avatar: MOCK_USERS[3].avatar,
        timestamp: "2026-08-30T14:35:00Z",
        text: "Fuel reserves at 92%. Transfer switch operational."
      }
    ],
    attachments: [
      { id: "att-3", name: "generator_test_log.pdf", size: "820 KB", type: "pdf", url: "#" }
    ]
  },
  {
    id: "TASK-004",
    title: "TASK-004: Fire alarm system testing",
    summary: "Quarterly audio beacon and smoke detector trigger validation.",
    description: "Validate strobe lights, alarm horn decibels in common corridors, and test emergency dispatch relay signal with monitoring desk.",
    priority: "High",
    status: "Ongoing",
    progress: 50,
    department: "Operations Support",
    category: "Safety",
    createdAt: "2026-08-31T08:30:00Z",
    dueDate: "2026-09-03T16:30:00Z",
    slaDeadline: "2026-09-03T16:30:00Z",
    assignee: {
      id: MOCK_USERS[4].id,
      name: MOCK_USERS[4].name,
      role: MOCK_USERS[4].role,
      email: MOCK_USERS[4].email,
      avatar: MOCK_USERS[4].avatar
    },
    createdBy: {
      id: MOCK_USERS[0].id,
      name: MOCK_USERS[0].name
    },
    timeline: [
      {
        id: "tl-401",
        timestamp: "2026-08-31T08:30:00Z",
        author: "Sarah (Lead)",
        type: "status_change",
        message: "Task created and marked Ongoing."
      }
    ],
    comments: [],
    attachments: []
  },
  {
    id: "TASK-005",
    title: "TASK-005: Access card reader maintenance",
    summary: "Clean optical sensors and update firmware on Gate 3 badge readers.",
    description: "Gate 3 RFID scanners intermittently drop credential scans during peak hours. Clean optical readheads and apply firmware patch.",
    priority: "Medium",
    status: "Open",
    progress: 15,
    department: "Field Operations",
    category: "Maintenance",
    createdAt: "2026-09-01T10:00:00Z",
    dueDate: "2026-09-04T17:00:00Z",
    slaDeadline: "2026-09-04T17:00:00Z",
    assignee: {
      id: MOCK_USERS[2].id,
      name: MOCK_USERS[2].name,
      role: MOCK_USERS[2].role,
      email: MOCK_USERS[2].email,
      avatar: MOCK_USERS[2].avatar
    },
    createdBy: {
      id: MOCK_USERS[0].id,
      name: MOCK_USERS[0].name
    },
    timeline: [
      {
        id: "tl-501",
        timestamp: "2026-09-01T10:00:00Z",
        author: "Sarah (Lead)",
        type: "status_change",
        message: "Task logged for Gate 3 badge reader."
      }
    ],
    comments: [],
    attachments: []
  },
  {
    id: "TASK-006",
    title: "TASK-006: Server room temperature check",
    summary: "Verify HVAC dual cooling unit calibration and rack thermal sensors.",
    description: "Ensure temperature stays within 18C - 21C threshold. Clean air intake filters on Primary Unit A.",
    priority: "High",
    status: "Closed",
    progress: 100,
    department: "Technical Support",
    category: "Infrastructure",
    createdAt: "2026-08-29T11:00:00Z",
    dueDate: "2026-08-31T17:00:00Z",
    slaDeadline: "2026-08-31T17:00:00Z",
    assignee: {
      id: MOCK_USERS[1].id,
      name: MOCK_USERS[1].name,
      role: MOCK_USERS[1].role,
      email: MOCK_USERS[1].email,
      avatar: MOCK_USERS[1].avatar
    },
    createdBy: {
      id: MOCK_USERS[0].id,
      name: MOCK_USERS[0].name
    },
    timeline: [
      {
        id: "tl-601",
        timestamp: "2026-08-29T11:00:00Z",
        author: "Sarah (Lead)",
        type: "status_change",
        message: "Task created."
      },
      {
        id: "tl-602",
        timestamp: "2026-08-31T15:00:00Z",
        author: "Alex",
        type: "status_change",
        message: "Filters replaced, temp stabilized at 19.5C. Marked Closed."
      }
    ],
    comments: [
      {
        id: "cm-601",
        author: "Alex",
        avatar: MOCK_USERS[1].avatar,
        timestamp: "2026-08-31T15:05:00Z",
        text: "Dual cooling unit functioning normally."
      }
    ],
    attachments: []
  },
  {
    id: "TASK-007",
    title: "TASK-007: First aid station restock",
    summary: "Inventory medical supplies and replenish bandages and sterile dressings.",
    description: "Inspect first aid cabinets across all operation floors, discard expired items, and restock sterile dressings, antiseptic, and cold packs.",
    priority: "Low",
    status: "Ongoing",
    progress: 40,
    department: "Field Operations",
    category: "Safety",
    createdAt: "2026-09-01T12:00:00Z",
    dueDate: "2026-09-04T17:00:00Z",
    slaDeadline: "2026-09-04T17:00:00Z",
    assignee: {
      id: MOCK_USERS[3].id,
      name: MOCK_USERS[3].name,
      role: MOCK_USERS[3].role,
      email: MOCK_USERS[3].email,
      avatar: MOCK_USERS[3].avatar
    },
    createdBy: {
      id: MOCK_USERS[0].id,
      name: MOCK_USERS[0].name
    },
    timeline: [
      {
        id: "tl-701",
        timestamp: "2026-09-01T12:00:00Z",
        author: "Sarah (Lead)",
        type: "status_change",
        message: "Task created and assigned to Elena."
      }
    ],
    comments: [],
    attachments: []
  }
];
