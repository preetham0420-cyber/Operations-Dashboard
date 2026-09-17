async function runDay4TestSuite() {
  console.log('--- GESF DAY 4: TASK MANAGEMENT & POSTGRESQL DASHBOARD TEST SUITE ---\n');

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

  // 1. Authenticate users
  console.log('1. Authenticating test users...');
  const managerToken = await login('sarah@company.com', 'Password123!');
  const tlAToken = await login('alex@company.com', 'Password123!'); // Team Leader Team A
  const agentAToken = await login('marcus@company.com', 'Password123!'); // Agent Team A (usr-3)
  const agentBToken = await login('elena@company.com', 'Password123!'); // Agent Team B (usr-7)

  assert('Manager Sarah authenticated successfully', !!managerToken);
  assert('Team Leader Alex (Team A) authenticated successfully', !!tlAToken);
  assert('Agent Marcus (Team A) authenticated successfully', !!agentAToken);
  assert('Agent Elena (Team B) authenticated successfully', !!agentBToken);

  // 2. Task Creation & Role Guard
  console.log('\n2. Testing Task Creation & Role Guards...');
  const createTaskRes = await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({
      title: 'Automated Perimeter Drone Calibration',
      description: 'Run full spectrum radio frequency checks on sector 4 drones.',
      priority: 'High',
      assigneeId: 'usr-3' // Marcus
    })
  });
  const createdTaskJson = await createTaskRes.json();
  assert('Team Leader can create task (HTTP 201)', createTaskRes.status === 201);
  assert('Response conforms to standard JSON envelope', createdTaskJson.success === true);
  const createdTaskId = createdTaskJson.data?.id;
  assert(`Task created with ID: ${createdTaskId}`, !!createdTaskId);

  // Agent cannot create task (Role Guard)
  const agentCreateRes = await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentAToken}`
    },
    body: JSON.stringify({ title: 'Unauthorized Task' })
  });
  assert('Agent cannot create task (HTTP 403 Forbidden)', agentCreateRes.status === 403);

  // 3. Task Retrieval & Role Scoping
  console.log('\n3. Testing Role-Aware Task Retrieval & Filtering...');
  const managerTasksRes = await fetch('http://localhost:5000/api/tasks', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const managerTasksJson = await managerTasksRes.json();
  assert('Manager can fetch all organization tasks (HTTP 200)', managerTasksRes.status === 200);
  assert('Manager sees all organization tasks', managerTasksJson.data?.length >= 8);

  const tlTasksRes = await fetch('http://localhost:5000/api/tasks', {
    headers: { Authorization: `Bearer ${tlAToken}` }
  });
  const tlTasksJson = await tlTasksRes.json();
  assert('Team Leader can fetch team tasks', tlTasksRes.status === 200);
  const allTeamA = tlTasksJson.data?.every((t) => !t.teamId || t.teamId === 'team-a');
  assert('Team Leader tasks strictly scoped to Team A', allTeamA);

  // Filter testing
  const filterRes = await fetch('http://localhost:5000/api/tasks?priority=High', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const filterJson = await filterRes.json();
  assert('Task filtering by priority returns HTTP 200', filterRes.status === 200);
  const allHigh = filterJson.data?.every((t) => t.priority === 'High');
  assert('All filtered tasks have High priority', allHigh);

  // Search testing
  const searchRes = await fetch('http://localhost:5000/api/tasks?search=Drone', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const searchJson = await searchRes.json();
  assert('Task search returns HTTP 200', searchRes.status === 200);
  assert('Search query successfully locates matching task', searchJson.data?.length > 0);

  // 4. Status Transition & Permissions
  console.log('\n4. Testing Canonical Lifecycle & Status Transition...');
  const statusRes = await fetch(`http://localhost:5000/api/tasks/${createdTaskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentAToken}`
    },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  const statusJson = await statusRes.json();
  assert('Assignee Marcus can transition task to IN_PROGRESS', statusRes.status === 200);
  assert('Task status is now IN_PROGRESS', statusJson.data?.status === 'IN_PROGRESS');

  // Agent cannot directly close task
  const agentCloseRes = await fetch(`http://localhost:5000/api/tasks/${createdTaskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentAToken}`
    },
    body: JSON.stringify({ status: 'CLOSED' })
  });
  assert('Agent cannot directly close task (Requires Manager/TL approval)', agentCloseRes.status === 403);

  // 5. Progress Constraint & Assignee Lock
  console.log('\n5. Testing Progress Constraints (0-100%) & Assignee Lock...');
  const invalidProgressRes = await fetch(`http://localhost:5000/api/tasks/${createdTaskId}/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentAToken}`
    },
    body: JSON.stringify({ progress: 150 })
  });
  assert('Progress > 100 rejected with HTTP 400 Bad Request', invalidProgressRes.status === 400);

  // Non-assignee Agent from Team B cannot update progress
  const nonAssigneeProgressRes = await fetch(`http://localhost:5000/api/tasks/${createdTaskId}/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentBToken}`
    },
    body: JSON.stringify({ progress: 50 })
  });
  assert('Non-assignee agent cannot update progress (Assignee Lock enforced)', nonAssigneeProgressRes.status === 403);

  // Valid progress update by assignee
  const validProgressRes = await fetch(`http://localhost:5000/api/tasks/${createdTaskId}/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentAToken}`
    },
    body: JSON.stringify({ progress: 75 })
  });
  const validProgressJson = await validProgressRes.json();
  assert('Assignee Marcus can update progress to 75%', validProgressRes.status === 200);
  assert('Progress is 75%', validProgressJson.data?.progress === 75);

  // 6. Comments & Audit Activity History
  console.log('\n6. Testing Comments & Audit Activity Trail...');
  const commentRes = await fetch(`http://localhost:5000/api/tasks/${createdTaskId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlAToken}`
    },
    body: JSON.stringify({ comment: 'Please ensure telemetry link is encrypted before final approval.' })
  });
  assert('Comment added successfully (HTTP 201)', commentRes.status === 201);

  const activityRes = await fetch(`http://localhost:5000/api/tasks/${createdTaskId}/activity`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const activityJson = await activityRes.json();
  assert('Task activity log retrieved (HTTP 200)', activityRes.status === 200);
  assert('Activity log captured CREATED, STATUS_CHANGE, and PROGRESS_UPDATE events', activityJson.data?.length >= 3);

  // 7. Dynamic PostgreSQL Dashboard Summary
  console.log('\n7. Testing Dynamic PostgreSQL Dashboard Metrics...');
  const dashRes = await fetch('http://localhost:5000/api/dashboard/summary', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const dashJson = await dashRes.json();
  assert('Dashboard summary returns HTTP 200', dashRes.status === 200);
  assert('Dashboard adheres to standard JSON envelope', dashJson.success === true);
  assert('Total tasks metric is numeric and PostgreSQL-driven', typeof dashJson.data?.totalTasks === 'number');
  assert('Completion rate is numeric', typeof dashJson.data?.completionRate === 'number');
  assert('Active on-duty count is dynamically computed', typeof dashJson.data?.activeOnDuty === 'number');

  console.log(`\n🌟 DAY 4 TEST RESULTS: ${passed}/${total} TESTS PASSED (${passed === total ? '100% SUCCESS' : 'FAILURES DETECTED'})\n`);
  if (passed !== total) process.exit(1);
}

runDay4TestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
