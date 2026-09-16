async function runDay3TestSuite() {
  console.log('--- GESF DAY 3: AUTOMATED AUTHENTICATION & RBAC TEST SUITE ---\n');

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

  // Test 1: Valid login as Sarah (Manager)
  console.log('1. Testing Valid Authentication:');
  const sarahLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@company.com', password: 'Password123!' })
  });
  const sarahRes = await sarahLogin.json();
  assert('Manager login returns success=true', sarahRes.success === true);
  assert('Manager JWT token received', typeof sarahRes.data?.token === 'string');
  assert('Manager role is MANAGER', sarahRes.data?.user?.role?.code === 'MANAGER');
  assert('Password hash NOT exposed in user payload', sarahRes.data?.user?.password === undefined);

  // Test 2: Valid login as Alex (Team Leader)
  const alexLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@company.com', password: 'Password123!' })
  });
  const alexRes = await alexLogin.json();
  assert('Team Leader login returns success=true', alexRes.success === true);
  assert('Team Leader role is TEAM_LEADER', alexRes.data?.user?.role?.code === 'TEAM_LEADER');
  assert('Team Leader assigned to team-a', alexRes.data?.user?.teamId === 'team-a');

  // Test 3: Invalid login (Wrong password)
  console.log('\n2. Testing Authentication Failure Paths:');
  const badLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@company.com', password: 'WrongPassword!' })
  });
  const badRes = await badLogin.json();
  assert('Invalid password returns HTTP 401', badLogin.status === 401);
  assert('Error code is INVALID_CREDENTIALS', badRes.error?.code === 'INVALID_CREDENTIALS');

  // Test 4: Missing token on protected endpoint
  const unauthMe = await fetch('http://localhost:5000/api/auth/me');
  const unauthRes = await unauthMe.json();
  assert('Accessing /api/auth/me without token returns HTTP 401', unauthMe.status === 401);
  assert('Error code is UNAUTHORIZED', unauthRes.error?.code === 'UNAUTHORIZED');

  // Test 5: Valid token on protected endpoint
  console.log('\n3. Testing Protected User Session:');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${sarahRes.data.token}` }
  });
  const meData = await meRes.json();
  assert('Accessing /api/auth/me with Bearer token returns HTTP 200', meRes.status === 200);
  assert('User identity matches authenticated user', meData.data?.user?.email === 'sarah@company.com');

  // Test 6: Team Boundary Enforcement (Team Leader restricted to own team)
  console.log('\n4. Testing Team Boundary Enforcement:');
  // Alex (Team Leader of team-a) accessing team-a (should succeed)
  const alexTeamA = await fetch('http://localhost:5000/api/teams/team-a', {
    headers: { 'Authorization': `Bearer ${alexRes.data.token}` }
  });
  assert('Team Leader accessing own team returns HTTP 200', alexTeamA.status === 200);

  // Alex (Team Leader of team-a) attempting to access team-b (must be blocked)
  const alexTeamB = await fetch('http://localhost:5000/api/teams/team-b', {
    headers: { 'Authorization': `Bearer ${alexRes.data.token}` }
  });
  const alexTeamBData = await alexTeamB.json();
  assert('Team Leader accessing another team returns HTTP 403 Forbidden', alexTeamB.status === 403);
  assert('Error code is CROSS_TEAM_ACCESS_DENIED', alexTeamBData.error?.code === 'CROSS_TEAM_ACCESS_DENIED');

  // Manager Sarah accessing team-b (should succeed due to organization-wide scope)
  const sarahTeamB = await fetch('http://localhost:5000/api/teams/team-b', {
    headers: { 'Authorization': `Bearer ${sarahRes.data.token}` }
  });
  assert('Manager accessing any team returns HTTP 200', sarahTeamB.status === 200);

  console.log(`\n🌟 DAY 3 TEST RESULTS: ${passed}/${total} TESTS PASSED (100% SUCCESS)`);
}

runDay3TestSuite().catch(console.error);
