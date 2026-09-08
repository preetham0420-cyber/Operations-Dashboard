import { store } from '../services/store.js';
import { toast } from '../components/toast.js';
import { MOCK_USERS } from '../data/mock-auth.js';


// =========================================================================
// SHIFT CLOCK-OUT VERIFICATION MODAL POPUP
// =========================================================================
export function showClockOutVerificationModal(onConfirmed) {
  let modalEl = document.getElementById('modal-confirm-clockout');
  if (modalEl) modalEl.remove();

  const user = store.currentUser || { name: 'Officer', email: 'agent@operations.dev' };
  const todayRecord = store.getTodayRecord(user.email);
  const clockInTime = todayRecord?.clockIn || '10:00 AM';
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  modalEl = document.createElement('div');
  modalEl.id = 'modal-confirm-clockout';
  modalEl.className = 'modal-backdrop active';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); padding: 16px;';

  modalEl.innerHTML = `
    <div class="modal-dialog" style="background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); width: 100%; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); overflow: hidden; animation: fadeInScale 0.2s ease-out;">
      <div style="padding: 24px 24px 18px; text-align: center;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 1.5px solid var(--color-red); color: var(--color-red); display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 16px;">
          ⏱️
        </div>
        <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">Verify Shift Clock-Out</h3>
        <p style="font-size: var(--text-xs); color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 18px;">
          Are you sure you want to end your operational shift for today? This will record your final clock-out timestamp and log your work hours.
        </p>

        <div style="background: var(--color-bg-surface-raised); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left;">
          <div>
            <div style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Clock In Time</div>
            <div style="font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--color-cyan);">${clockInTime}</div>
          </div>
          <div>
            <div style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Clock Out Time</div>
            <div style="font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--color-red);">${nowStr}</div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-clockout" style="flex: 1;">Cancel</button>
          <button type="button" class="btn btn-danger btn-glow" id="btn-confirm-clockout-action" style="flex: 1;">Verify & Clock Out</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  document.getElementById('btn-cancel-clockout').onclick = () => {
    modalEl.remove();
  };

  document.getElementById('btn-confirm-clockout-action').onclick = () => {
    modalEl.remove();
    if (typeof onConfirmed === 'function') onConfirmed();
  };

  modalEl.onclick = (e) => {
    if (e.target === modalEl) modalEl.remove();
  };
}


/**
 * Attendance Tracking View
 * Role-aware: Manager Team Overview vs. Agent Personal Clock & Log
 */

export function renderAttendanceView(container) {
  const isManager = store.isManager();
  const user = store.currentUser;

  if (isManager) {
    renderManagerAttendanceView(container);
  } else {
    renderAgentAttendanceView(container);
  }
}

// =========================================================================
// 1. AGENT ATTENDANCE VIEW (Personal Clock, Shift Status, My Logs)
// =========================================================================
function renderAgentAttendanceView(container) {
  const user = store.currentUser;
  const todayRecord = store.getTodayRecord(user.email);
  const myHistory = store.attendance.filter(a => a.userEmail === user.email);
  const myLeaves = store.leaveRequests.filter(l => l.userEmail === user.email);

  const currentStatus = todayRecord ? todayRecord.currentStatus : "Not Clocked In";

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Page Header -->
      <div class="view-header-row">
        <div>
          <span class="view-subtitle">EMPLOYEE ATTENDANCE & SHIFTS</span>
          <h1 class="view-title">My Attendance & Shift Log</h1>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-primary btn-glow" id="btn-agent-request-leave">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Request Time Off</span>
          </button>
        </div>
      </div>

      <!-- Live Clock & Status Card -->
      <div class="card attendance-clock-card">
        <div class="clock-left">
          <div class="live-clock-time" id="live-clock-display">--:--:--</div>
          <div class="live-clock-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div class="shift-schedule-text">
            Scheduled Shift: <strong>${user.shift}</strong> &bull; Assigned: <strong>${user.department}</strong>
          </div>
        </div>

        <div class="clock-right">
          <div class="status-indicator-box">
            <span class="status-indicator-label">CURRENT SHIFT STATUS:</span>
            <span class="badge ${getStatusBadge(currentStatus)}" style="font-size: var(--text-sm); padding: 4px 12px;">
              ${currentStatus}
            </span>
          </div>

          <div class="clock-actions-group" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            ${(currentStatus === 'Clocked In' || currentStatus === 'On Break') ? `
              <button class="btn btn-secondary" id="btn-clock-in-disabled" disabled style="opacity: 0.65; cursor: default;" title="Already clocked in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Clocked In (${todayRecord?.clockIn || 'Active'})</span>
              </button>

              <button class="btn ${currentStatus === 'On Break' ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-break">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
                <span>${currentStatus === 'On Break' ? '☕ End Break & Resume' : '☕ Take a Break'}</span>
              </button>

              <button class="btn btn-danger btn-glow" id="btn-clock-out" title="End shift and record clock-out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Clock Out (End Shift)</span>
              </button>
            ` : `
              <button class="btn btn-primary btn-lg btn-glow" id="btn-clock-in">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>${currentStatus === 'Clocked Out' ? 'Clock In Again' : 'Clock In (Check-In)'}</span>
              </button>

              <button class="btn btn-outline" id="btn-clock-out-disabled" disabled style="opacity: 0.45; cursor: not-allowed;" title="You must clock in first before ending shift">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Clock Out (End Shift)</span>
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- 2-Column Split: Attendance History & My Leave Requests -->
      <div class="attendance-grid-split">
        <!-- Left: My Logs Table -->
        <div class="attendance-main-col">
          <div class="card panel-card">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <div class="panel-indicator bg-cyan"></div>
                <h2 class="panel-title">My Recent Attendance History</h2>
              </div>
            </div>

            <div class="table-responsive">
              <table class="gesf-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Working Time</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${myHistory.map(row => `
                    <tr>
                      <td class="font-mono font-semibold">${row.date}</td>
                      <td class="font-mono">${row.clockIn || '--'}</td>
                      <td class="font-mono">${row.clockOut || '--'}</td>
                      <td class="font-mono text-cyan">${row.workHours || 'In Progress'}</td>
                      <td>
                        <span class="badge ${row.status === 'Present' ? 'badge-resolved' : (row.status === 'Late' ? 'badge-high' : 'badge-neutral')}">
                          ${row.status}
                        </span>
                      </td>
                      <td class="text-muted text-xs">${row.notes || '--'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Leave Requests & Balance -->
        <div class="attendance-side-col">
          <div class="card panel-card">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <div class="panel-indicator bg-purple"></div>
                <h2 class="panel-title">My Leave Requests (${myLeaves.length})</h2>
              </div>
            </div>

            <div class="leave-balance-box">
              <div class="balance-item">
                <span class="balance-num font-mono text-cyan">14</span>
                <span class="balance-label">Annual Days Left</span>
              </div>
              <div class="balance-item">
                <span class="balance-num font-mono text-emerald">5</span>
                <span class="balance-label">Sick Days Left</span>
              </div>
            </div>

            <div class="leave-requests-mini-list">
              ${myLeaves.length === 0 ? `
                <div class="text-muted text-xs" style="padding: var(--space-3) 0;">No active leave requests.</div>
              ` : myLeaves.map(lr => `
                <div class="leave-mini-item">
                  <div class="leave-mini-header">
                    <strong>${lr.leaveType} (${lr.daysCount || lr.days || 1}d)</strong>
                    <span class="badge badge-xs ${lr.status === 'Approved' ? 'badge-resolved' : (lr.status === 'Pending' ? 'badge-high' : 'badge-critical')}">
                      ${lr.status}
                    </span>
                  </div>
                  <div class="leave-mini-dates font-mono text-xs">${lr.startDate} &rarr; ${lr.endDate}</div>
                  <div class="leave-mini-reason text-muted text-xs">"${lr.reason}"</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Start live clock ticking
  const clockEl = container.querySelector('#live-clock-display');
  const updateClock = () => {
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString();
    }
  };
  updateClock();
  const clockInterval = setInterval(updateClock, 1000);

  // Attach button listeners
  const clockInBtn = container.querySelector('#btn-clock-in');
  if (clockInBtn) {
    clockInBtn.addEventListener('click', () => {
      store.clockIn();
      toast.show({
        title: "Clock-In Recorded",
        message: "Your attendance and shift start time have been logged.",
        type: "success"
      });
      clearInterval(clockInterval);
      renderAgentAttendanceView(container);
    });
  }

  const breakBtn = container.querySelector('#btn-toggle-break');
  if (breakBtn) {
    breakBtn.addEventListener('click', () => {
      const rec = store.toggleBreak();
      toast.show({
        title: rec.currentStatus === 'On Break' ? "Break Started" : "Break Ended",
        message: `Shift status updated to: ${rec.currentStatus}`,
        type: "info"
      });
      clearInterval(clockInterval);
      renderAgentAttendanceView(container);
    });
  }

  const clockOutBtn = container.querySelector('#btn-clock-out');
  if (clockOutBtn) {
    clockOutBtn.addEventListener('click', () => {
      showClockOutVerificationModal(() => {
        store.clockOut();
        toast.show({
          title: "Shift Completed",
          message: "You have successfully clocked out. Have a great evening!",
          type: "info"
        });
        clearInterval(clockInterval);
        renderAgentAttendanceView(container);
      });
    });
  }

  const reqLeaveBtn = container.querySelector('#btn-agent-request-leave');
  if (reqLeaveBtn) {
    reqLeaveBtn.addEventListener('click', () => {
      renderLeaveModal(() => {
        clearInterval(clockInterval);
        renderAgentAttendanceView(container);
      });
    });
  }
}

// =========================================================================
// 2. AGENT MANAGER ATTENDANCE VIEW (Team Live Status, Leave Approval, Filterable Log)
// =========================================================================
function renderManagerAttendanceView(container) {
  const allRecords = store.attendance;
  const leaveRequests = store.leaveRequests;
  const agents = MOCK_USERS.filter(u => !u.isManager);

  // Today's live stats
  const todayStr = "2026-08-31";
  const todayRecords = allRecords.filter(r => r.date === todayStr);

  const clockedInCount = todayRecords.filter(r => r.currentStatus === "Clocked In").length;
  const onBreakCount = todayRecords.filter(r => r.currentStatus === "On Break").length;
  const lateCount = todayRecords.filter(r => r.status === "Late").length;
  const onLeaveCount = todayRecords.filter(r => r.status === "On Leave").length;

  let selectedAgentFilter = "All";
  let selectedDateFilter = "All";

  function getFilteredTeamRecords() {
    let list = [...allRecords];
    if (selectedAgentFilter !== "All") {
      list = list.filter(r => r.userEmail === selectedAgentFilter);
    }
    if (selectedDateFilter === "Today") {
      list = list.filter(r => r.date === todayStr);
    }
    return list;
  }

  function render() {
    const records = getFilteredTeamRecords();
    const pendingLeaves = leaveRequests.filter(l => l.status === "Pending");

    container.innerHTML = `
      <div class="view-content-wrapper">
        <!-- Page Header -->
        <div class="view-header-row">
          <div>
            <span class="view-subtitle">AGENT MANAGER CONSOLE</span>
            <h1 class="view-title">Team Attendance & Leave Management</h1>
          </div>
          <div class="view-header-actions">
            <button class="btn btn-outline" id="btn-export-attendance">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Export Attendance CSV</span>
            </button>
          </div>
        </div>

        <!-- Manager Personal Shift Clock & Controls -->
        <div class="card attendance-clock-card" style="margin-bottom: var(--space-5);">
          <div class="clock-left">
            <div class="live-clock-time" id="mgr-live-clock">--:--:--</div>
            <div class="live-clock-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div class="shift-schedule-text">
              Manager Shift: <strong>10:00 AM - 5:00 PM</strong> &bull; Assigned: <strong>Operations Management</strong>
            </div>
          </div>
          <div class="clock-right">
            <div class="status-indicator-box">
              <span class="status-indicator-label">MANAGER SHIFT STATUS:</span>
              <span class="badge ${getStatusBadge(store.getTodayRecord(store.currentUser?.email)?.currentStatus || 'Not Clocked In')}" style="font-size: var(--text-sm); padding: 4px 12px;">
                ${store.getTodayRecord(store.currentUser?.email)?.currentStatus || 'Not Clocked In'}
              </span>
            </div>
            <div class="clock-actions-group" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              ${(store.getTodayRecord(store.currentUser?.email)?.currentStatus === 'Clocked In') ? `
                <button class="btn btn-secondary" disabled style="opacity: 0.65; cursor: default;">
                  <span style="color: var(--color-emerald);">✓</span>
                  <span>Clocked In (${store.getTodayRecord(store.currentUser?.email)?.clockIn || '10:00 AM'})</span>
                </button>
                <button class="btn btn-danger btn-glow" id="btn-mgr-clock-out" title="End shift and record clock-out">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Clock Out (End Shift)</span>
                </button>
              ` : `
                <button class="btn btn-primary btn-lg btn-glow" id="btn-mgr-clock-in">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>Clock In (Check-In)</span>
                </button>
                <button class="btn btn-outline" disabled style="opacity: 0.45; cursor: not-allowed;" title="You must clock in first before ending shift">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Clock Out (End Shift)</span>
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- Manager Quick KPIs -->
        <div class="metrics-grid">
          <div class="metric-card metric-cyan">
            <div class="metric-header">
              <span class="metric-label">Active / Clocked In</span>
              <div class="metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <div class="metric-value">${clockedInCount} / 4</div>
            <div class="metric-footer">
              <span class="text-emerald">Agents on active shift</span>
            </div>
          </div>

          <div class="metric-card metric-amber">
            <div class="metric-header">
              <span class="metric-label">Currently on Break</span>
              <div class="metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
              </div>
            </div>
            <div class="metric-value">${onBreakCount}</div>
            <div class="metric-footer">
              <span class="text-amber">Meal / rest pause</span>
            </div>
          </div>

          <div class="metric-card metric-red">
            <div class="metric-header">
              <span class="metric-label">Late Arrivals Today</span>
              <div class="metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div class="metric-value">${lateCount}</div>
            <div class="metric-footer">
              <span class="text-red">Arrived after scheduled shift</span>
            </div>
          </div>

          <div class="metric-card metric-blue">
            <div class="metric-header">
              <span class="metric-label">Pending Leave Requests</span>
              <div class="metric-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>
            <div class="metric-value">${pendingLeaves.length}</div>
            <div class="metric-footer">
              <span class="text-cyan">Requires manager review</span>
            </div>
          </div>
        </div>

        <!-- Manager 2-Column: Pending Leave Review & Team Table -->
        <div class="attendance-grid-split">
          <!-- Main Left Column: Team Attendance Logs -->
          <div class="attendance-main-col">
            <div class="card panel-card">
              <div class="panel-header">
                <div class="panel-title-wrap">
                  <div class="panel-indicator bg-cyan"></div>
                  <h2 class="panel-title">Team Attendance Records</h2>
                </div>

                <!-- Quick Filters -->
                <div style="display: flex; gap: var(--space-2);">
                  <select id="filter-mgr-agent" class="filter-select">
                    <option value="All">All Agents (4)</option>
                    ${agents.map(a => `<option value="${a.email}" ${selectedAgentFilter === a.email ? 'selected' : ''}>${a.name}</option>`).join('')}
                  </select>
                  <select id="filter-mgr-date" class="filter-select">
                    <option value="All" ${selectedDateFilter === 'All' ? 'selected' : ''}>All History</option>
                    <option value="Today" ${selectedDateFilter === 'Today' ? 'selected' : ''}>Today Only</option>
                  </select>
                </div>
              </div>

              <div class="table-responsive">
                <table class="gesf-table">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Date</th>
                      <th>In Time</th>
                      <th>Out Time</th>
                      <th>Duration</th>
                      <th>Shift Status</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.map(row => `
                      <tr>
                        <td>
                          <div class="table-assignee">
                            <img src="${row.userAvatar || row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${row.userName}" class="assignee-avatar-xs">
                            <div>
                              <div class="assignee-name font-semibold">${row.userName}</div>
                              <div class="assignee-badge">${row.role || row.userRole || 'Field Agent'}</div>
                            </div>
                          </div>
                        </td>
                        <td class="font-mono">${row.date}</td>
                        <td class="font-mono">${row.clockIn || '--'}</td>
                        <td class="font-mono">${row.clockOut || '--'}</td>
                        <td class="font-mono text-cyan">${row.workHours || 'In Progress'}</td>
                        <td>
                          <span class="badge ${getStatusBadge(row.currentStatus)}">
                            ${row.currentStatus}
                          </span>
                        </td>
                        <td>
                          <span class="badge ${row.status === 'Present' ? 'badge-resolved' : (row.status === 'Late' ? 'badge-high' : 'badge-neutral')}">
                            ${row.status}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right Column: Pending Leave Approval Cards -->
          <div class="attendance-side-col">
            <div class="card panel-card">
              <div class="panel-header">
                <div class="panel-title-wrap">
                  <div class="panel-indicator bg-amber"></div>
                  <h2 class="panel-title">Pending Leave Requests (${pendingLeaves.length})</h2>
                </div>
              </div>

              <div class="leave-approval-queue">
                ${pendingLeaves.length === 0 ? `
                  <div class="empty-state-sm" style="padding: var(--space-4) 0; text-align: center;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p class="text-muted text-xs">All agent leave requests have been reviewed.</p>
                  </div>
                ` : pendingLeaves.map(req => `
                  <div class="leave-approval-card">
                    <div class="leave-agent-row">
                      <img src="${req.userAvatar || req.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'}" alt="${req.userName}" class="assignee-avatar-xs">
                      <div>
                        <strong>${req.userName}</strong>
                        <div class="text-muted text-xs">${req.role || req.userRole || 'Field Agent'}</div>
                      </div>
                    </div>

                    <div class="leave-type-pill">
                      <span>${req.leaveType}</span> &bull; <strong>${req.daysCount || req.days || 1} Day(s)</strong>
                    </div>

                    <div class="leave-dates font-mono text-xs">
                      ${req.startDate} &rarr; ${req.endDate}
                    </div>

                    <div class="leave-reason-quote text-xs">
                      "${req.reason}"
                    </div>

                    <div class="leave-actions-row">
                      <button class="btn btn-xs btn-emerald btn-approve-leave" data-leave-id="${req.id}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-1px; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Approve</span>
                      </button>
                      <button class="btn btn-xs btn-danger-outline btn-reject-leave" data-leave-id="${req.id}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-1px; margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    attachManagerListeners();
  }

  function attachManagerListeners() {
    // Live ticking for Manager clock
    const mgrClock = container.querySelector('#mgr-live-clock');
    if (mgrClock) {
      mgrClock.textContent = new Date().toLocaleTimeString();
    }

    // Manager Clock-in
    const mgrClockIn = container.querySelector('#btn-mgr-clock-in');
    if (mgrClockIn) {
      mgrClockIn.addEventListener('click', () => {
        store.clockIn();
        toast.show({
          title: "Shift Started",
          message: "Manager shift clock-in recorded successfully.",
          type: "success"
        });
        render();
      });
    }

    // Manager Clock-out
    const mgrClockOut = container.querySelector('#btn-mgr-clock-out');
    if (mgrClockOut) {
      mgrClockOut.addEventListener('click', () => {
        showClockOutVerificationModal(() => {
          store.clockOut();
          toast.show({
            title: "Shift Completed",
            message: "Manager shift clocked out successfully.",
            type: "info"
          });
          render();
        });
      });
    }

    // Filter by agent
    const agentFilter = container.querySelector('#filter-mgr-agent');
    if (agentFilter) {
      agentFilter.addEventListener('change', (e) => {
        selectedAgentFilter = e.target.value;
        render();
      });
    }

    // Filter by date
    const dateFilter = container.querySelector('#filter-mgr-date');
    if (dateFilter) {
      dateFilter.addEventListener('change', (e) => {
        selectedDateFilter = e.target.value;
        render();
      });
    }

    // Approve leave
    container.querySelectorAll('.btn-approve-leave').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-leave-id');
        store.approveLeaveRequest(id);
        toast.show({
          title: "Leave Approved",
          message: "The leave request has been approved and the agent has been notified.",
          type: "success"
        });
        render();
      });
    });

    // Reject leave
    container.querySelectorAll('.btn-reject-leave').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-leave-id');
        store.rejectLeaveRequest(id);
        toast.show({
          title: "Leave Rejected",
          message: "The leave request was rejected.",
          type: "warning"
        });
        render();
      });
    });

    // Export CSV
    const exportBtn = container.querySelector('#btn-export-attendance');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        toast.show({
          title: "Export Generated",
          message: "Attendance records downloaded as CSV format.",
          type: "info"
        });
      });
    }
  }

  render();
}

// Helper: Leave request modal for agents
function renderLeaveModal(onSubmitted) {
  let modal = document.getElementById('modal-request-leave');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-request-leave';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog modal-md" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div class="modal-title-wrap">
          <span class="modal-badge">TIME OFF APPLICATION</span>
          <h2 class="modal-title">Request Time Off / Leave</h2>
        </div>
        <button class="modal-close-btn" id="btn-close-leave-modal">&times;</button>
      </div>
      <form id="form-leave-request" class="modal-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="leave-type" class="form-label required">Leave Type</label>
            <select id="leave-type" class="form-control form-select" required>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Casual Leave">Casual Leave</option>
            </select>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="leave-start" class="form-label required">Start Date</label>
              <input type="date" id="leave-start" class="form-control" value="2026-09-04" required>
            </div>
            <div class="form-group">
              <label for="leave-end" class="form-label required">End Date</label>
              <input type="date" id="leave-end" class="form-control" value="2026-09-05" required>
            </div>
          </div>

          <div class="form-group">
            <label for="leave-days" class="form-label required">Total Number of Days</label>
            <input type="number" id="leave-days" class="form-control" value="2" min="1" max="14" required>
          </div>

          <div class="form-group">
            <label for="leave-reason" class="form-label required">Reason for Absence</label>
            <textarea id="leave-reason" class="form-control form-textarea" rows="3" placeholder="Provide brief reason for manager approval..." required></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-leave">Cancel</button>
          <button type="submit" class="btn btn-primary btn-glow">Submit to Agent Manager</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');

  const close = () => {
    modal.classList.remove('active');
  };

  modal.querySelector('#btn-close-leave-modal').addEventListener('click', close);
  modal.querySelector('#btn-cancel-leave').addEventListener('click', close);

  const form = modal.querySelector('#form-leave-request');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = form.querySelector('#leave-type').value;
    const start = form.querySelector('#leave-start').value;
    const end = form.querySelector('#leave-end').value;
    const days = form.querySelector('#leave-days').value;
    const reason = form.querySelector('#leave-reason').value;

    store.submitLeaveRequest({
      leaveType: type,
      startDate: start,
      endDate: end,
      days,
      reason
    });

    toast.show({
      title: "Leave Request Submitted",
      message: "Your application has been routed to Sarah Jenkins (Agent Manager).",
      type: "success"
    });

    close();
    if (onSubmitted) onSubmitted();
  });
}

function getStatusBadge(status) {
  switch (status) {
    case 'Clocked In': return 'badge-resolved';
    case 'On Break': return 'badge-high';
    case 'Clocked Out': return 'badge-neutral';
    case 'Not Clocked In': return 'badge-neutral';
    default: return 'badge-neutral';
  }
}