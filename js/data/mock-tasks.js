/**
 * Mock Tasks & Incidents Dataset
 * Rich distribution across Team A and Team B (8 Agents)
 */

export const INITIAL_TASKS = [
  {
    id: 'TSK-101',
    title: 'Core Switch Firmware Upgrade & Network Hardening',
    summary: 'Upgrade core switch stack firmware and verify VLAN trunk redundancy across servers.',
    description: 'Scheduled maintenance for main rack switches. Verify STP convergence, route failovers, and backup configuration upload prior to power cycle.',
    priority: 'Critical',
    status: 'In Progress',
    department: 'Tech & Operations',
    teamId: 'team-a',
    assignee: {
      name: 'Alex',
      email: 'alex@company.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Technical Lead'
    },
    assigneeId: 'usr-2',
    dueDate: '2026-09-08T17:00:00Z',
    createdDate: '2026-09-02T09:00:00Z',
    createdAt: '2026-09-02T09:00:00Z',
    progress: 60,
    tags: ['Network', 'Firmware', 'Infrastructure'],
    attachments: [
      { name: 'firmware_manifest_v5.2.bin', size: '14.2 MB', type: 'bin' },
      { name: 'topology_stp_diagram.pdf', size: '2.8 MB', type: 'pdf' }
    ],
    discussion: [
      { id: 'c-1', author: 'Alex', text: 'Backup configs downloaded and validated against MD5 checksums.', timestamp: '2026-09-02T10:15:00Z' },
      { id: 'c-2', author: 'Sarah', text: 'Approved switch reboot window for 14:00. Maintain backup link active.', timestamp: '2026-09-02T11:00:00Z' }
    ],
    timeline: [
      { id: 'tl-1', author: 'Sarah', message: 'Task dispatched to Alex', timestamp: '2026-09-02T09:00:00Z' },
      { id: 'tl-2', author: 'Alex', message: 'Status updated to In Progress (60%)', timestamp: '2026-09-02T10:15:00Z' }
    ]
  },
  {
    id: 'TSK-102',
    title: 'HVAC Sensor Inspection & Telemetry Calibration',
    summary: 'Calibrate environmental sensors in Server Room B and verify backup cooling threshold.',
    description: 'Secondary condenser unit tripped high temp warning yesterday. Perform physical calibration of zone sensors and log thermal distribution.',
    priority: 'High',
    status: 'Open',
    department: 'Field & Logistics',
    teamId: 'team-b',
    assignee: {
      name: 'David',
      email: 'david@company.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      role: 'Field Supervisor'
    },
    assigneeId: 'usr-6',
    dueDate: '2026-09-09T16:00:00Z',
    createdDate: '2026-09-03T08:30:00Z',
    createdAt: '2026-09-03T08:30:00Z',
    progress: 0,
    tags: ['Field', 'Sensors', 'HVAC'],
    attachments: [
      { name: 'thermal_zone_map.png', size: '1.4 MB', type: 'png' }
    ],
    discussion: [
      { id: 'c-3', author: 'David', text: 'Tools packed and thermal sensors pre-tested. Dispatched to facility.', timestamp: '2026-09-03T09:00:00Z' }
    ],
    timeline: [
      { id: 'tl-3', author: 'Sarah', message: 'Task created for David', timestamp: '2026-09-03T08:30:00Z' }
    ]
  },
  {
    id: 'TSK-103',
    title: 'Container Orchestration Cluster Security Audit',
    summary: 'Audit Kubernetes namespace policies, secrets encryption, and TLS certificate renewal.',
    description: 'Verify mutual TLS across microservices, check cert-manager ingress certificates expiring in 14 days, and tighten pod security standards.',
    priority: 'High',
    status: 'In Progress',
    department: 'Tech & Operations',
    teamId: 'team-a',
    assignee: {
      name: 'Chloe',
      email: 'chloe@company.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'Systems Specialist'
    },
    assigneeId: 'usr-4',
    dueDate: '2026-09-10T18:00:00Z',
    createdDate: '2026-09-03T11:00:00Z',
    createdAt: '2026-09-03T11:00:00Z',
    progress: 45,
    tags: ['DevOps', 'Kubernetes', 'Security'],
    attachments: [
      { name: 'k8s_audit_checklist.pdf', size: '840 KB', type: 'pdf' }
    ],
    discussion: [
      { id: 'c-4', author: 'Chloe', text: 'Automated cert rotation script executed. 8/12 namespaces verified clean.', timestamp: '2026-09-03T14:20:00Z' }
    ],
    timeline: [
      { id: 'tl-4', author: 'Alex', message: 'Task assigned to Chloe', timestamp: '2026-09-03T11:00:00Z' },
      { id: 'tl-5', author: 'Chloe', message: 'Progress updated to 45%', timestamp: '2026-09-03T14:20:00Z' }
    ]
  },
  {
    id: 'TSK-104',
    title: 'Fleet Vehicle Onboard Diagnostics & GPS Sync',
    summary: 'Service GPS tracking units and run diagnostics on field utility vans #3 and #7.',
    description: 'Cellular modems on fleet vans #3 and #7 exhibited telemetry dropouts during rainstorm. Replace SIM modules and test antenna connections.',
    priority: 'Medium',
    status: 'In Progress',
    department: 'Field & Logistics',
    teamId: 'team-b',
    assignee: {
      name: 'Maya',
      email: 'maya@company.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Logistics Coordinator'
    },
    assigneeId: 'usr-8',
    dueDate: '2026-09-11T15:00:00Z',
    createdDate: '2026-09-04T08:00:00Z',
    createdAt: '2026-09-04T08:00:00Z',
    progress: 50,
    tags: ['Logistics', 'Fleet', 'Telemetry'],
    attachments: [
      { name: 'fleet_status_report.csv', size: '120 KB', type: 'csv' }
    ],
    discussion: [
      { id: 'c-5', author: 'Maya', text: 'Van #3 modem firmware updated. Antenna replacement in progress on Van #7.', timestamp: '2026-09-04T10:30:00Z' }
    ],
    timeline: [
      { id: 'tl-6', author: 'David', message: 'Task assigned to Maya', timestamp: '2026-09-04T08:00:00Z' }
    ]
  },
  {
    id: 'TSK-105',
    title: 'Quarterly Disaster Recovery Failover Simulation',
    summary: 'Coordinate database failover replication test from primary datacenter to backup site.',
    description: 'Execute controlled DR failover drill. Monitor sync lag, measure recovery time objective (RTO), and generate full executive summary report.',
    priority: 'Critical',
    status: 'Under Review',
    department: 'Tech & Operations',
    teamId: 'team-a',
    assignee: {
      name: 'Marcus',
      email: 'marcus@company.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Operations Agent'
    },
    assigneeId: 'usr-3',
    dueDate: '2026-09-08T19:00:00Z',
    createdDate: '2026-09-01T10:00:00Z',
    createdAt: '2026-09-01T10:00:00Z',
    progress: 90,
    tags: ['Database', 'Failover', 'DR'],
    attachments: [
      { name: 'failover_telemetry_logs.json', size: '3.2 MB', type: 'json' }
    ],
    discussion: [
      { id: 'c-6', author: 'Marcus', text: 'Failover executed within 3 minutes 14 seconds (under 5 min SLA). Drafting final report.', timestamp: '2026-09-04T16:00:00Z' }
    ],
    timeline: [
      { id: 'tl-7', author: 'Marcus', message: 'Submitted for manager review at 90%', timestamp: '2026-09-04T16:00:00Z' }
    ]
  },
  {
    id: 'TSK-106',
    title: 'Perimeter Access Card Reader Maintenance',
    summary: 'Physical inspection and reader head cleaning at East Gate and South Loading Bay.',
    description: 'Card scan delay reported during morning shift change. Inspect wiring junction box, clean optical readers, and verify latency under load.',
    priority: 'Medium',
    status: 'Resolved',
    department: 'Field & Logistics',
    teamId: 'team-b',
    assignee: {
      name: 'Elena',
      email: 'elena@company.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Field Agent'
    },
    assigneeId: 'usr-7',
    dueDate: '2026-09-06T17:00:00Z',
    createdDate: '2026-09-02T13:00:00Z',
    createdAt: '2026-09-02T13:00:00Z',
    progress: 100,
    tags: ['Field', 'Perimeter', 'AccessControl'],
    attachments: [
      { name: 'maintenance_signoff.pdf', size: '450 KB', type: 'pdf' }
    ],
    discussion: [
      { id: 'c-7', author: 'Elena', text: 'Junction box re-sealed with silicone; reader response time reduced from 2.8s to 0.4s.', timestamp: '2026-09-06T15:30:00Z' }
    ],
    timeline: [
      { id: 'tl-8', author: 'Elena', message: 'Task marked 100% Resolved', timestamp: '2026-09-06T15:30:00Z' }
    ]
  },
  {
    id: 'TSK-107',
    title: 'Emergency Dispatch Radio Repeater Alignment',
    summary: 'Re-align directional antenna on North Tower and measure signal-to-noise ratio.',
    description: 'Radio coverage dead zone detected in Sector 4. Re-orient tower repeater dipole, test handheld transceivers across the sector.',
    priority: 'High',
    status: 'In Progress',
    department: 'Field & Logistics',
    teamId: 'team-b',
    assignee: {
      name: 'Noah',
      email: 'noah@company.com',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      role: 'Dispatch Specialist'
    },
    assigneeId: 'usr-9',
    dueDate: '2026-09-09T18:00:00Z',
    createdDate: '2026-09-04T14:00:00Z',
    createdAt: '2026-09-04T14:00:00Z',
    progress: 30,
    tags: ['Dispatch', 'Radio', 'Communications'],
    attachments: [
      { name: 'spectrum_analysis.png', size: '920 KB', type: 'png' }
    ],
    discussion: [
      { id: 'c-8', author: 'Noah', text: 'Climbing permit approved. North tower antenna angle adjusted 15 degrees clockwise.', timestamp: '2026-09-05T09:45:00Z' }
    ],
    timeline: [
      { id: 'tl-9', author: 'Noah', message: 'Tower climb started, progress set to 30%', timestamp: '2026-09-05T09:45:00Z' }
    ]
  },
  {
    id: 'TSK-108',
    title: 'Internal Helpdesk Ticket SLA Queue Optimization',
    summary: 'Triage overdue Level-2 support incidents and configure auto-escalation rules.',
    description: 'Review ticket backlog, update automated priority triggers, and verify email routing to on-call engineers.',
    priority: 'Low',
    status: 'In Progress',
    department: 'Tech & Operations',
    teamId: 'team-a',
    assignee: {
      name: 'Liam',
      email: 'liam@company.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Support Specialist'
    },
    assigneeId: 'usr-5',
    dueDate: '2026-09-12T17:00:00Z',
    createdDate: '2026-09-05T10:00:00Z',
    createdAt: '2026-09-05T10:00:00Z',
    progress: 25,
    tags: ['Support', 'Helpdesk', 'SLA'],
    attachments: [
      { name: 'ticket_sla_metrics.csv', size: '310 KB', type: 'csv' }
    ],
    discussion: [
      { id: 'c-9', author: 'Liam', text: 'Triaged 18 tickets. Escalated 2 critical database latency tickets to Marcus.', timestamp: '2026-09-05T11:20:00Z' }
    ],
    timeline: [
      { id: 'tl-10', author: 'Liam', message: 'Queue triaged, progress 25%', timestamp: '2026-09-05T11:20:00Z' }
    ]
  }
];
