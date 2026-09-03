/**
 * Operations Dashboard View
 * Explicit Task Progress, Assigned / Pending / Completed breakdown
 */

import { store, getSimpleName } from '../services/store.js';
import { navigation } from '../components/navigation.js';
import { modal } from '../components/modal.js';

export function renderDashboardView(container) {
  const user = store.currentUser;
  const isManager = store.isManager();
  const allTasks = store.getTasks();

  const relevantTasks = isManager ? allTasks : allTasks.filter(t => t.assignee.email === user.email);

  // Accurate breakdown calculations for Open, Ongoing, Closed
  const totalAssigned = relevantTasks.length;
  const closedCount = relevantTasks.filter(t => t.status === 'Closed').length;
  const ongoingCount = relevantTasks.filter(t => t.status === 'Ongoing').length;
  const openCount = relevantTasks.filter(t => t.status === 'Open').length;

  const completionPercentage = totalAssigned > 0 ? Math.round((closedCount / totalAssigned) * 100) : 0;

  const notifs = store.getNotifications().filter(n => !n.read).slice(0, 3);
  const activities = store.activity.slice(0, 5);

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Welcome Banner -->
      <div class="dashboard-banner">
        <div class="banner-text">
          <div class="banner-badge">
            <span class="pulse-dot"></span>
            <span>${isManager ? 'AGENT MANAGER OVERVIEW' : 'AGENT WORKSPACE'}</span>
          </div>
          <h1 class="banner-title">Welcome back, ${user.name}</h1>
          <p class="banner-sub">
            Role: <span class="badge ${isManager ? 'badge-cyan' : 'badge-neutral'}">${user.role}</span> &bull; 
            Department: <span class="text-contrast">${user.department}</span> &bull; 
            Shift: <span class="text-contrast">${user.shift}</span>
          </p>
        </div>
        <div class="banner-actions">
          ${isManager ? `
            <button class="btn btn-primary btn-glow" id="dash-btn-new-task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Create New Task</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 4 Prominent KPI Metric Cards (Total, Ongoing, Closed, Progress) -->
      <div class="metrics-grid">
        <!-- 1. Total Assigned -->
        <div class="metric-card metric-cyan" data-view="tasks">
          <div class="metric-header">
            <span class="metric-label">${isManager ? 'Total Assigned Tasks' : 'My Assigned Tasks'}</span>
            <div class="metric-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            </div>
          </div>
          <div class="metric-value">${totalAssigned}</div>
          <div class="metric-footer">
            <span class="text-cyan">Click to view all tasks &rarr;</span>
          </div>
        </div>

        <!-- 2. Ongoing Tasks -->
        <div class="metric-card metric-blue" data-view="tasks">
          <div class="metric-header">
            <span class="metric-label">Ongoing Tasks</span>
            <div class="metric-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="metric-value">${ongoingCount}</div>
          <div class="metric-footer">
            <span class="text-blue">${openCount} open &bull; ${closedCount} closed</span>
          </div>
        </div>

        <!-- 3. Closed Tasks -->
        <div class="metric-card metric-emerald" data-view="tasks" style="border-left: 3px solid var(--color-emerald);">
          <div class="metric-header">
            <span class="metric-label">Closed Tasks</span>
            <div class="metric-icon" style="background-color: var(--color-emerald-bg); color: var(--color-emerald);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div class="metric-value" style="color: var(--color-emerald);">${closedCount}</div>
          <div class="metric-footer">
            <span class="text-emerald">Completed & verified</span>
          </div>
        </div>

        <!-- 4. Overall Progress Rate -->
        <div class="metric-card metric-purple" data-view="tasks" style="border-left: 3px solid var(--color-purple);">
          <div class="metric-header">
            <span class="metric-label">Overall Completion</span>
            <div class="metric-icon" style="background-color: var(--color-purple-bg); color: var(--color-purple);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l7 4"/></svg>
            </div>
          </div>
          <div class="metric-value" style="color: var(--color-purple);">${completionPercentage}%</div>
          <div class="metric-footer">
            <div class="progress-bar-wrap" style="height: 6px; width: 100%;">
              <div class="progress-bar-fill bg-purple" style="width: ${completionPercentage}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-main-grid">
        <!-- Left Column: Tasks with Individual Progress Bars -->
        <div class="dashboard-col-left">
          <div class="card panel-card">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <div class="panel-indicator bg-cyan"></div>
                <h2 class="panel-title">${isManager ? 'Active Operations & Progress' : 'My Current Tasks & Progress'}</h2>
              </div>
              <button class="btn btn-xs btn-primary-outline" data-view="tasks">Open Task Manager &rarr;</button>
            </div>

            <div class="urgent-tasks-list">
              ${relevantTasks.map(task => `
                <div class="urgent-task-item" data-task-inspect="${task.id}">
                  <div class="urgent-task-left">
                    <span class="font-mono task-id-pill ${task.priority === 'Critical' ? 'pill-critical' : ''}">${task.id}</span>
                    <div class="urgent-task-info">
                      <div class="urgent-task-title">${task.title}</div>
                      <div class="urgent-task-meta">
                        <span class="badge badge-xs ${getPriorityBadgeClass(task.priority)}">${task.priority}</span>
                        <span class="badge badge-xs ${getStatusBadgeClass(task.status)}">${task.status}</span>
                        <span class="text-muted">&bull; Assigned: ${getSimpleName(task.assignee.name)}</span>
                      </div>
                      <!-- Explicit Task Progress Bar -->
                      <div class="task-row-progress-wrap">
                        <div style="display: flex; justify-content: space-between; font-size: 0.68rem; margin-bottom: 2px;">
                          <span class="text-muted">Task Progress:</span>
                          <span class="font-mono font-semibold ${task.progress === 100 ? 'text-emerald' : 'text-cyan'}">${task.progress}%</span>
                        </div>
                        <div class="progress-bar-wrap" style="height: 5px;">
                          <div class="progress-bar-fill ${task.progress === 100 ? 'bg-emerald' : 'bg-cyan'}" style="width: ${task.progress}%;"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="urgent-task-right">
                    <button class="btn btn-xs btn-outline" data-task-inspect="${task.id}">View Task &rarr;</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Column: Notifications & Activity Feed -->
        <div class="dashboard-col-right">
          <!-- Recent Notifications -->
          <div class="card panel-card">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <div class="panel-indicator bg-amber"></div>
                <h2 class="panel-title">Recent Notifications</h2>
              </div>
              <button class="btn btn-xs btn-link" data-view="notifications">All Notifications &rarr;</button>
            </div>
            <div class="dash-notifs-list">
              ${notifs.map(n => `
                <div class="dash-notif-item unread" data-view="notifications">
                  <div class="dash-notif-content">
                    <div class="dash-notif-title">${n.title}</div>
                    <div class="dash-notif-msg">${n.message}</div>
                    <div class="dash-notif-time font-mono">${formatTimeAgo(n.timestamp)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  // Attach New Task Modal Listener
  const newTaskBtn = container.querySelector('#dash-btn-new-task');
  if (newTaskBtn) {
    newTaskBtn.onclick = () => {
      modal.renderCreateTaskModal();
      modal.open('modal-create-task');
    };
  }
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'Critical': return 'badge-critical';
    case 'High': return 'badge-high';
    case 'Medium': return 'badge-medium';
    case 'Low': return 'badge-low';
    default: return 'badge-neutral';
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Open': return 'badge-open';
    case 'Ongoing': return 'badge-ongoing';
    case 'Closed': return 'badge-closed';
    default: return 'badge-neutral';
  }
}

function formatDueDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const past = new Date(isoString);
  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
