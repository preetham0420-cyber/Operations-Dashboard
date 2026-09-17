async function runDay5TestSuite() {
  console.log('--- GESF DAY 5: ATTENDANCE, LEAVES, NOTIFICATIONS & CONTROLLED REQUIREMENT CHANGE ---\n');

  let passed = 0;
  let total = 0;

  function assert(name, condition) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
    }
  }

  async function login(email, password) {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data.data?.token;
  }

  // Authenticate users
  console.log('1. Authenticating test users...');
  const managerToken = await login('sarah@company.com', 'Password123!');
  const tlAToken = await login('alex@company.com', 'Password123!'); // Team Leader Team A
  const agentAToken = await login('marcus@company.com', 'Password123!'); // Agent Marcus (Team A, usr-3)
  const agentA2Token = await login('chloe@company.com', 'Password123!'); // Agent Chloe (Team A, usr-4)
  const agentBToken = await login('elena@company.com', 'Password123!'); // Agent Elena (Team B, usr-7)

  assert('Sarah (Manager) logged in', !!managerToken);
  assert('Alex (Team Leader A) logged in', !!tlAToken);
  assert('Marcus (Agent Team A) logged in', !!agentAToken);
  assert('Chloe (Agent Team A) logged in', !!agentA2Token);
  assert('Elena (Agent Team B) logged in', !!agentBToken);

  // 2. Attendance Workflow
  console.log('\n2. Testing Attendance Workflow & Persistence...');
  // Clock-in
  const clockInRes = await fetch('http://localhost:5000/api/attendance/clock-in', {
    method: 'POST',
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  const clockInJson = await clockInRes.json();
  assert('Agent can clock in (HTTP 200)', clockInRes.status === 200);
  assert('Attendance record status is Clocked In', clockInJson.data?.currentStatus === 'Clocked In');

  // Start break
  const breakStartRes = await fetch('http://localhost:5000/api/attendance/break/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  const breakStartJson = await breakStartRes.json();
  assert('Agent can start break (HTTP 200)', breakStartRes.status === 200);
  assert('Current status is On Break', breakStartJson.data?.currentStatus === 'On Break');

  // End break
  const breakEndRes = await fetch('http://localhost:5000/api/attendance/break/end', {
    method: 'POST',
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  const breakEndJson = await breakEndRes.json();
  assert('Agent can conclude break (HTTP 200)', breakEndRes.status === 200);
  assert('Current status returned to Clocked In', breakEndJson.data?.currentStatus === 'Clocked In');

  // Personal attendance lookup
  const meAttRes = await fetch('http://localhost:5000/api/attendance/me', {
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  const meAttJson = await meAttRes.json();
  assert('GET /api/attendance/me returns HTTP 200', meAttRes.status === 200);
  assert('Personal attendance contains today record & recent history', !!meAttJson.data?.today);

  // Clock out
  const clockOutRes = await fetch('http://localhost:5000/api/attendance/clock-out', {
    method: 'POST',
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  const clockOutJson = await clockOutRes.json();
  assert('Agent can clock out (HTTP 200)', clockOutRes.status === 200);
  assert('Attendance status is Clocked Out', clockOutJson.data?.currentStatus === 'Clocked Out');

  // Team attendance roster
  const teamAttRes = await fetch('http://localhost:5000/api/attendance/team', {
    headers: { Authorization: `Bearer ${tlAToken}` }
  });
  const teamAttJson = await teamAttRes.json();
  assert('Team Leader can view team attendance roster (HTTP 200)', teamAttRes.status === 200);
  assert('Team attendance contains member records', Array.isArray(teamAttJson.data) && teamAttJson.data.length > 0);

  // 3. Leave Workflow
  console.log('\n3. Testing Leave Submission & Supervisory Review...');
  // Submit leave
  const submitLeaveRes = await fetch('http://localhost:5000/api/leaves', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentAToken}`
    },
    body: JSON.stringify({
      leaveType: 'Annual Leave',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      daysCount: 3,
      reason: 'Scheduled rest period after intensive patrol rotation.'
    })
  });
  const submitLeaveJson = await submitLeaveRes.json();
  assert('Agent can submit leave request (HTTP 201)', submitLeaveRes.status === 201);
  const leaveId = submitLeaveJson.data?.id;
  assert(`Leave created with ID: ${leaveId}`, !!leaveId);
  assert('Leave status is PENDING', submitLeaveJson.data?.status === 'PENDING');

  // Role guard: Agent cannot access pending leaves
  const agentPendingLeaveRes = await fetch('http://localhost:5000/api/leaves/pending', {
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  assert('Agent access to pending leaves rejected (HTTP 403 Forbidden)', agentPendingLeaveRes.status === 403);

  // Team Leader views pending leaves for team
  const tlPendingLeaveRes = await fetch('http://localhost:5000/api/leaves/pending', {
    headers: { Authorization: `Bearer ${tlAToken}` }
  });
  const tlPendingLeaveJson = await tlPendingLeaveRes.json();
  assert('Team Leader can view pending squad leaves (HTTP 200)', tlPendingLeaveRes.status === 200);
  assert('Pending leaves list contains Marcus request', tlPendingLeaveJson.data?.some((l) => l.id === leaveId));

  // Team Leader approves leave
  const approveLeaveRes = await fetch(`http://localhost:5000/api/leaves/${leaveId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({ reviewNotes: 'Approved per squad coverage schedule.' })
  });
  const approveLeaveJson = await approveLeaveRes.json();
  assert('Team Leader can approve squad leave (HTTP 200)', approveLeaveRes.status === 200);
  assert('Leave status is now APPROVED', approveLeaveJson.data?.status === 'APPROVED');

  // 4. Notifications Workflow
  console.log('\n4. Testing Notifications & Unread Counters...');
  const notifsRes = await fetch('http://localhost:5000/api/notifications', {
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  const notifsJson = await notifsRes.json();
  assert('Agent can retrieve notifications (HTTP 200)', notifsRes.status === 200);
  assert('Notifications array returned', Array.isArray(notifsJson.data));
  const firstNotifId = notifsJson.data[0]?.id;
  assert('Agent received notifications from actions', !!firstNotifId);

  // Mark single notification read
  const markReadRes = await fetch(`http://localhost:5000/api/notifications/${firstNotifId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  assert('Mark single notification read returns HTTP 200', markReadRes.status === 200);

  // Mark all read
  const markAllReadRes = await fetch('http://localhost:5000/api/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${agentAToken}` }
  });
  assert('Mark all notifications read returns HTTP 200', markAllReadRes.status === 200);

  // 5. CONTROLLED REQUIREMENT CHANGE: Task Reassignment Rules
  console.log('\n5. Testing Controlled Requirement Change: Team Leader Reassignment...');

  // Create an OPEN task in Team A
  const openTaskRes = await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({
      title: 'Sector 3 Motion Sensor Diagnostic',
      priority: 'Medium',
      assigneeId: 'usr-3' // Marcus (Team A)
    })
  });
  const openTaskJson = await openTaskRes.json();
  const openTaskId = openTaskJson.data?.id;
  assert('Created OPEN task in Team A', !!openTaskId && openTaskJson.data?.status === 'OPEN');

  // Test 5A: Valid Reassignment: Team Leader reassigns OPEN task between Agents of same team (Marcus -> Chloe)
  const validReassignRes = await fetch(`http://localhost:5000/api/tasks/${openTaskId}/assignee`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({ assigneeId: 'usr-4' }) // Chloe (Team A)
  });
  const validReassignJson = await validReassignRes.json();
  assert('Team Leader can reassign OPEN task to agent within same team (HTTP 200)', validReassignRes.status === 200);
  assert('Task assignee updated to Chloe (usr-4)', validReassignJson.data?.assigneeId === 'usr-4');

  // Test 5B: Security Boundary: Team Leader attempts cross-team reassignment (Chloe -> Elena on Team B)
  const crossTeamReassignRes = await fetch(`http://localhost:5000/api/tasks/${openTaskId}/assignee`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({ assigneeId: 'usr-7' }) // Elena (Team B)
  });
  const crossTeamJson = await crossTeamReassignRes.json();
  assert('Cross-team reassignment explicitly rejected with HTTP 403 Forbidden', crossTeamReassignRes.status === 403);
  assert('Error code is CROSS_TEAM_REASSIGNMENT_DENIED', crossTeamJson.error?.code === 'CROSS_TEAM_REASSIGNMENT_DENIED');

  // Test 5C: Lifecycle Constraint: Team Leader attempts reassignment of NON-OPEN task
  // Transition task to IN_PROGRESS
  await fetch(`http://localhost:5000/api/tasks/${openTaskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });

  const inProgressReassignRes = await fetch(`http://localhost:5000/api/tasks/${openTaskId}/assignee`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({ assigneeId: 'usr-3' }) // Marcus
  });
  const inProgressReassignJson = await inProgressReassignRes.json();
  assert('Team Leader cannot reassign task once IN_PROGRESS (HTTP 400 Bad Request)', inProgressReassignRes.status === 400);
  assert('Error code is REASSIGNMENT_LOCKED', inProgressReassignJson.error?.code === 'REASSIGNMENT_LOCKED');

  // Test 5D: Manager Org-Wide Override: Manager can reassign across teams
  const managerReassignRes = await fetch(`http://localhost:5000/api/tasks/${openTaskId}/assignee`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ assigneeId: 'usr-7' }) // Elena (Team B)
  });
  assert('Manager has organization-wide authority to reassign across teams (HTTP 200)', managerReassignRes.status === 200);

  console.log(`\n🌟 DAY 5 TEST RESULTS: ${passed}/${total} TESTS PASSED (${passed === total ? '100% SUCCESS' : 'FAILURES DETECTED'})\n`);
  if (passed !== total) process.exit(1);
}

runDay5TestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
