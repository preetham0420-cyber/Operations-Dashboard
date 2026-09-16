import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database: gesf_operations (Day 2 Enterprise Relational Model)...');

  // Clean tables in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendanceBreak.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.taskActivity.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskChecklist.deleteMany();
  await prisma.task.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.role.deleteMany();

  // 1. Roles (Decoupled from job titles)
  const roleManager = await prisma.role.create({
    data: {
      id: 'role-mgr',
      code: 'MANAGER',
      name: 'Operations Manager',
      description: 'Organization-wide administrative authority, task creation, assignment, leave approval, metrics access.'
    }
  });

  const roleLeader = await prisma.role.create({
    data: {
      id: 'role-lead',
      code: 'TEAM_LEADER',
      name: 'Team Leader',
      description: 'Squad operational leadership, internal team task assignment, team attendance monitoring.'
    }
  });

  const roleAgent = await prisma.role.create({
    data: {
      id: 'role-agent',
      code: 'AGENT',
      name: 'Operational Agent',
      description: 'Task execution, progress updating, duty attendance clocking, leave request submission.'
    }
  });
  console.log('✓ Seeded 3 Authorization Roles (MANAGER, TEAM_LEADER, AGENT)');

  // 2. Departments
  const deptTech = await prisma.department.create({
    data: {
      id: 'dept-tech',
      name: 'Tech & Operations',
      description: 'Technical infrastructure, systems engineering, and control center operations'
    }
  });

  const deptField = await prisma.department.create({
    data: {
      id: 'dept-field',
      name: 'Field & Logistics',
      description: 'Perimeter patrol, field response, physical access security, and logistics'
    }
  });
  console.log('✓ Seeded 2 Departments');

  // 3. Teams
  const teamA = await prisma.team.create({
    data: {
      id: 'team-a',
      name: 'Team A',
      displayName: 'Team A (Tech & Operations)',
      departmentId: deptTech.id
    }
  });

  const teamB = await prisma.team.create({
    data: {
      id: 'team-b',
      name: 'Team B',
      displayName: 'Team B (Field & Logistics)',
      departmentId: deptField.id
    }
  });
  console.log('✓ Seeded 2 Operational Teams');

  // 4. Users (9 Demo Users, hashed passwords)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usersData = [
    // Manager
    {
      id: 'usr-1',
      employeeCode: 'EMP-1001',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      password: passwordHash,
      roleId: roleManager.id,
      jobTitle: 'Operations Manager',
      departmentId: deptTech.id,
      teamId: null,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    // Team A (1 Leader + 3 Agents)
    {
      id: 'usr-2',
      employeeCode: 'EMP-1002',
      name: 'Alex Mercer',
      email: 'alex@company.com',
      password: passwordHash,
      roleId: roleLeader.id,
      jobTitle: 'Technical Lead',
      departmentId: deptTech.id,
      teamId: teamA.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-3',
      employeeCode: 'EMP-1003',
      name: 'Marcus Vance',
      email: 'marcus@company.com',
      password: passwordHash,
      roleId: roleAgent.id,
      jobTitle: 'Operations Agent',
      departmentId: deptTech.id,
      teamId: teamA.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-4',
      employeeCode: 'EMP-1004',
      name: 'Chloe Price',
      email: 'chloe@company.com',
      password: passwordHash,
      roleId: roleAgent.id,
      jobTitle: 'Systems Specialist',
      departmentId: deptTech.id,
      teamId: teamA.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-5',
      employeeCode: 'EMP-1005',
      name: 'Liam Scott',
      email: 'liam@company.com',
      password: passwordHash,
      roleId: roleAgent.id,
      jobTitle: 'Support Specialist',
      departmentId: deptTech.id,
      teamId: teamA.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    // Team B (1 Leader + 3 Agents)
    {
      id: 'usr-6',
      employeeCode: 'EMP-1006',
      name: 'David Kim',
      email: 'david@company.com',
      password: passwordHash,
      roleId: roleLeader.id,
      jobTitle: 'Field Supervisor',
      departmentId: deptField.id,
      teamId: teamB.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-7',
      employeeCode: 'EMP-1007',
      name: 'Elena Rostova',
      email: 'elena@company.com',
      password: passwordHash,
      roleId: roleAgent.id,
      jobTitle: 'Field Agent',
      departmentId: deptField.id,
      teamId: teamB.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-8',
      employeeCode: 'EMP-1008',
      name: 'Maya Lin',
      email: 'maya@company.com',
      password: passwordHash,
      roleId: roleAgent.id,
      jobTitle: 'Logistics Coordinator',
      departmentId: deptField.id,
      teamId: teamB.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-9',
      employeeCode: 'EMP-1009',
      name: 'Noah Hayes',
      email: 'noah@company.com',
      password: passwordHash,
      roleId: roleAgent.id,
      jobTitle: 'Dispatch Specialist',
      departmentId: deptField.id,
      teamId: teamB.id,
      shift: '10:00 AM - 5:00 PM',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
    }
  ];

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }

  // Appoint Team Leaders
  await prisma.team.update({ where: { id: teamA.id }, data: { leaderId: 'usr-2' } });
  await prisma.team.update({ where: { id: teamB.id }, data: { leaderId: 'usr-6' } });
  console.log('✓ Seeded 9 Users (1 Manager, 2 Team Leaders, 6 Agents) & appointed Team Leaders');

  // 5. Tasks (TSK-101 through TSK-108)
  const tasksData = [
    {
      id: 'TSK-101',
      taskCode: 'TSK-101',
      title: 'Core Switch Firmware Upgrade & Network Hardening',
      description: 'Upgrade core switch stack firmware and verify VLAN trunk redundancy across servers.',
      priority: 'Critical',
      status: 'IN_PROGRESS',
      progress: 60,
      dueDate: new Date('2026-09-08T17:00:00Z'),
      assigneeId: 'usr-2',
      teamId: teamA.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Backup switch configurations', completed: true },
        { title: 'Flash firmware patch v4.2.1', completed: true },
        { title: 'Verify STP convergence time', completed: false }
      ]
    },
    {
      id: 'TSK-102',
      taskCode: 'TSK-102',
      title: 'HVAC Sensor Inspection & Telemetry Calibration',
      description: 'Perform scheduled inspection of environmental sensors in primary server room.',
      priority: 'High',
      status: 'OPEN',
      progress: 0,
      dueDate: new Date('2026-09-12T14:00:00Z'),
      assigneeId: 'usr-6',
      teamId: teamB.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Test temperature probe accuracy', completed: false },
        { title: 'Clean intake dust filters', completed: false }
      ]
    },
    {
      id: 'TSK-103',
      taskCode: 'TSK-103',
      title: 'Container Orchestration Cluster Security Audit',
      description: 'Audit Kubernetes namespace policies, RBAC roles, and container image signatures.',
      priority: 'High',
      status: 'IN_PROGRESS',
      progress: 45,
      dueDate: new Date('2026-09-15T18:00:00Z'),
      assigneeId: 'usr-4',
      teamId: teamA.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Scan container registry for CVEs', completed: true },
        { title: 'Verify pod security admissions', completed: false }
      ]
    },
    {
      id: 'TSK-104',
      taskCode: 'TSK-104',
      title: 'Fleet Vehicle Onboard Diagnostics & GPS Sync',
      description: 'Conduct bi-weekly operational sync on patrol vehicle GPS beacons and radio gear.',
      priority: 'Medium',
      status: 'OPEN',
      progress: 10,
      dueDate: new Date('2026-09-11T12:00:00Z'),
      assigneeId: 'usr-8',
      teamId: teamB.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Verify satellite transponder lock', completed: true },
        { title: 'Test VHF radio repeater handover', completed: false }
      ]
    },
    {
      id: 'TSK-105',
      taskCode: 'TSK-105',
      title: 'Quarterly Disaster Recovery Failover Simulation',
      description: 'Coordinate database failover replication test from primary datacenter to backup site.',
      priority: 'Critical',
      status: 'UNDER_REVIEW',
      progress: 90,
      dueDate: new Date('2026-09-09T09:00:00Z'),
      assigneeId: 'usr-3',
      teamId: teamA.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Initiate standby read replica promote', completed: true },
        { title: 'Benchmark write latency under load', completed: true },
        { title: 'Compile RPO / RTO sign-off report', completed: true }
      ]
    },
    {
      id: 'TSK-106',
      taskCode: 'TSK-106',
      title: 'Perimeter Access Card Reader Maintenance',
      description: 'Physical inspection and reader head cleaning at East Gate and South Loading Bay.',
      priority: 'Medium',
      status: 'CLOSED',
      progress: 100,
      dueDate: new Date('2026-09-06T17:00:00Z'),
      assigneeId: 'usr-7',
      teamId: teamB.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Check 12V relay line integrity', completed: true },
        { title: 'Test RFID badge response latency', completed: true },
        { title: 'Signed by Operations Manager', completed: true }
      ]
    },
    {
      id: 'TSK-107',
      taskCode: 'TSK-107',
      title: 'Emergency Dispatch Radio Repeater Alignment',
      description: 'Re-align directional antenna on North Tower and verify coverage on Channel 4.',
      priority: 'High',
      status: 'IN_PROGRESS',
      progress: 30,
      dueDate: new Date('2026-09-14T16:00:00Z'),
      assigneeId: 'usr-9',
      teamId: teamB.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Measure SWR impedance ratio', completed: true },
        { title: 'Validate ground lightning suppressor', completed: false }
      ]
    },
    {
      id: 'TSK-108',
      taskCode: 'TSK-108',
      title: 'Internal Helpdesk Ticket SLA Queue Optimization',
      description: 'Review response thresholds on Level 1 physical security and badge issuance queue.',
      priority: 'Low',
      status: 'IN_PROGRESS',
      progress: 25,
      dueDate: new Date('2026-09-13T17:00:00Z'),
      assigneeId: 'usr-5',
      teamId: teamA.id,
      createdById: 'usr-1',
      checklists: [
        { title: 'Export ticket resolution metrics', completed: true },
        { title: 'Reconfigure escalation triggers', completed: false }
      ]
    }
  ];

  for (const t of tasksData) {
    const { checklists, ...fields } = t;
    const task = await prisma.task.create({ data: fields });
    if (checklists && checklists.length > 0) {
      for (const c of checklists) {
        await prisma.taskChecklist.create({
          data: { taskId: task.id, title: c.title, completed: c.completed }
        });
      }
    }
    // Activity log for creation
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: 'usr-1',
        action: 'CREATED',
        detail: `Task ${task.taskCode} created with initial status ${task.status}`
      }
    });
  }
  console.log('✓ Seeded 8 Tasks with Checklists and Activity History');

  // 6. Attendance Records & Breaks
  const todayStr = '2026-09-16';
  const attendanceData = [
    { userId: 'usr-1', date: todayStr, clockIn: '09:50 AM', currentStatus: 'Clocked In', status: 'Present', workHours: 'In Progress', totalHours: 2.5 },
    { userId: 'usr-2', date: todayStr, clockIn: '09:55 AM', currentStatus: 'Clocked In', status: 'Present', workHours: 'In Progress', totalHours: 2.4 },
    { userId: 'usr-3', date: todayStr, clockIn: '10:02 AM', currentStatus: 'On Break', status: 'Present', workHours: 'In Progress', totalHours: 2.3 },
    { userId: 'usr-4', date: todayStr, clockIn: '09:48 AM', currentStatus: 'Clocked In', status: 'Present', workHours: 'In Progress', totalHours: 2.5 },
    { userId: 'usr-5', date: todayStr, clockIn: '10:05 AM', currentStatus: 'Clocked In', status: 'Late', workHours: 'In Progress', totalHours: 2.2 },
    { userId: 'usr-6', date: todayStr, clockIn: '09:40 AM', currentStatus: 'Clocked In', status: 'Present', workHours: 'In Progress', totalHours: 2.7 },
    { userId: 'usr-7', date: todayStr, clockIn: '09:52 AM', currentStatus: 'Clocked In', status: 'Present', workHours: 'In Progress', totalHours: 2.5 },
    { userId: 'usr-8', date: todayStr, clockIn: '09:58 AM', currentStatus: 'Clocked In', status: 'Present', workHours: 'In Progress', totalHours: 2.4 },
    { userId: 'usr-9', date: todayStr, clockIn: null, currentStatus: 'Absent', status: 'Absent', workHours: '0.0 hrs', totalHours: 0.0 }
  ];

  for (const a of attendanceData) {
    const record = await prisma.attendanceRecord.create({ data: a });
    // Add a break for Marcus
    if (a.userId === 'usr-3') {
      await prisma.attendanceBreak.create({
        data: {
          attendanceId: record.id,
          startTime: new Date(Date.now() - 15 * 60000),
          durationMins: 15
        }
      });
    }
  }
  console.log('✓ Seeded Attendance Records & Break Intervals');

  // 7. Leave Requests
  await prisma.leaveRequest.create({
    data: {
      userId: 'usr-4',
      leaveType: 'Annual Leave',
      startDate: '2026-09-20',
      endDate: '2026-09-22',
      daysCount: 3,
      reason: 'Personal travel and family commitment',
      status: 'PENDING'
    }
  });

  await prisma.leaveRequest.create({
    data: {
      userId: 'usr-8',
      leaveType: 'Medical Leave',
      startDate: '2026-09-18',
      endDate: '2026-09-18',
      daysCount: 1,
      reason: 'Routine outpatient medical examination',
      status: 'PENDING'
    }
  });

  await prisma.leaveRequest.create({
    data: {
      userId: 'usr-3',
      leaveType: 'Personal Leave',
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      daysCount: 2,
      reason: 'Relocation logistics',
      status: 'APPROVED',
      reviewedById: 'usr-1',
      reviewedAt: new Date('2026-08-30T14:00:00Z'),
      reviewNotes: 'Approved by Operations Manager'
    }
  });
  console.log('✓ Seeded Leave Requests (Pending & Approved)');

  // 8. Notifications
  await prisma.notification.create({
    data: {
      userId: 'usr-1',
      title: 'Leave Request Submitted',
      message: 'Chloe Price submitted an Annual Leave request for Sep 20 - Sep 22.',
      category: 'leave'
    }
  });

  await prisma.notification.create({
    data: {
      userId: 'usr-2',
      title: 'Task Assigned',
      message: 'Critical task TSK-101 Core Switch Upgrade assigned to Team A.',
      category: 'task'
    }
  });

  await prisma.notification.create({
    data: {
      userId: 'usr-1',
      title: 'Task Ready for Review',
      message: 'Marcus Vance marked TSK-105 Disaster Recovery Simulation ready for sign-off.',
      category: 'task'
    }
  });
  console.log('✓ Seeded Notifications');

  console.log('🌟 Day 2 PostgreSQL Relational Database Schema & Seeding Successfully Completed!');
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
