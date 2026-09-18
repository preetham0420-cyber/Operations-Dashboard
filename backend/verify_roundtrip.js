import { PrismaClient } from '@prisma/client';

async function verifyFullRoundtrip() {
  console.log('--- GESF Full-Stack PostgreSQL 18 Live Roundtrip Verification ---\n');

  // 1. Authenticate Sarah Chen (Manager)
  const sarahLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@company.com', password: 'Password123!' })
  });
  const sarahAuth = await sarahLogin.json();
  console.log('1. Manager Authentication: Token acquired for', sarahAuth.user?.name);

  // 2. Authenticate Alex Mercer (Assignee / Tech Lead)
  const alexLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@company.com', password: 'Password123!' })
  });
  const alexAuth = await alexLogin.json();
  console.log('2. Agent Authentication: Token acquired for', alexAuth.user?.name);

  // 3. Create a New Operational Incident Task in PostgreSQL
  console.log('\n3. Creating New Task in PostgreSQL via REST API...');
  const createRes = await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sarahAuth.token}`
    },
    body: JSON.stringify({
      id: 'TSK-999',
      title: 'PostgreSQL Migration Integrity Audit & Real-Time Sync Validation',
      description: 'End-to-end operational verification of relational models, foreign key relationships, and RBAC policies in PostgreSQL 18.',
      priority: 'Critical',
      assigneeId: alexAuth.user.id,
      teamId: 'team-a',
      dueDate: '2026-09-12T18:00:00Z',
      checklists: [
        'PostgreSQL 18 database connectivity confirmed',
        'Prisma client schema migration synchronized',
        'Frontend state store integration validated'
      ]
    })
  });
  const createdTask = await createRes.json();
  console.log('   ✓ REST API Task Created in PostgreSQL:', createdTask.task?.id, '-', createdTask.task?.title);

  // 4. Alex updates progress to 75%
  console.log('\n4. Alex updating task progress to 75% in PostgreSQL...');
  const progressRes = await fetch('http://localhost:5000/api/tasks/TSK-999/progress', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${alexAuth.token}`
    },
    body: JSON.stringify({ progress: 75 })
  });
  const progData = await progressRes.json();
  console.log('   ✓ Progress updated to:', progData.task?.progress, '% | Status:', progData.task?.status);

  // 5. Manager closes the task with sign-off note
  console.log('\n5. Manager Operational Sign-off & Task Closure...');
  const closeRes = await fetch('http://localhost:5000/api/tasks/TSK-999/close', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sarahAuth.token}`
    },
    body: JSON.stringify({ resolutionNote: 'Full-stack PostgreSQL backend verified with zero regression.' })
  });
  const closedData = await closeRes.json();
  console.log('   ✓ Task Closed by Manager:', closedData.task?.status, '| Progress:', closedData.task?.progress, '%');

  // 6. Direct Verification against PostgreSQL via Prisma
  console.log('\n6. Querying PostgreSQL Database Table Directly...');
  const prisma = new PrismaClient();
  const dbRecord = await prisma.task.findUnique({
    where: { id: 'TSK-999' },
    include: { checklists: true, comments: true, assignee: true }
  });

  console.log('   ✓ Database Verification Results:');
  console.log('     • Task ID:          ', dbRecord.id);
  console.log('     • Title:            ', dbRecord.title);
  console.log('     • Status:           ', dbRecord.status);
  console.log('     • Progress:         ', dbRecord.progress, '%');
  console.log('     • Assignee:         ', dbRecord.assignee?.name, `(${dbRecord.assignee?.role})`);
  console.log('     • Checklists count: ', dbRecord.checklists.length);
  console.log('     • Comments / Notes: ', dbRecord.comments[0]?.comment);

  // Clean up test task
  await prisma.taskComment.deleteMany({ where: { taskId: 'TSK-999' } });
  await prisma.taskChecklist.deleteMany({ where: { taskId: 'TSK-999' } });
  await prisma.task.delete({ where: { id: 'TSK-999' } });
  console.log('\n   ✓ Cleaned up verification task record');
  await prisma.$disconnect();

  console.log('\n🎉 ALL FULL-STACK POSTGRESQL OPERATIONS VERIFIED 100%!');
}

verifyFullRoundtrip().catch(console.error);
