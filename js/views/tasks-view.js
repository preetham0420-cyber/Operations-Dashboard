/**
 * Tasks & Operations Management View
 * Features role-based task scoping (Agent sees own tasks by default, searches entire team on query)
 * Includes real-time search, multi-filtering, sorting, progress bars, and dual view modes
 */

import { store, getSimpleName } from '../services/store.js';
import { navigation } from '../components/navigation.js';
import { modal } from '../components/modal.js';
import { MOCK_USERS } from '../data/mock-auth.js';

export function renderTasksView(container, initialFilters = {}) {
  const user = store.currentUser;
  const isManager = store.isManager();

  const filters = initialFilters || {};
  let searchQuery = filters.search || '';
  let statusFilter = filters.status || 'All';
  let priorityFilter = filters.priority || 'All';
  let deptFilter = filters.department || 'All';
  let assigneeFilter = isManager ? 'All' : user.email; // Default to Agent's own tasks for agents
  let scopeMode = isManager ? 'all' : 'my'; // 'my' (My Tasks) vs 'all' (Team Catalog)
  let sortBy = 'dueDate';
  let sortOrder = 'asc';
  let viewMode = 'table'; // 'table' or 'grid'

  function getFilteredTasks() {
    let allList = [...store.getTasks()];
    let list = allList;

    // Agent scoping: If not manager, strictly restrict to agent's assigned tasks
    if (!isManager) {
      list = allList.filter(t => t.assignee.email === user.email);
    } else if (assigneeFilter !== 'All') {
      list = allList.filter(t => t.assignee.email === assigneeFilter);
    }

    // Search Logic: filters within the accessible list
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.assignee.name.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      list = list.filter(t => t.status === statusFilter);
    }

    // Priority Filter
    if (priorityFilter !== 'All') {
      list = list.filter(t => t.priority === priorityFilter);
    }

    // Department Filter
    if (deptFilter !== 'All') {
      list = list.filter(t => t.department === deptFilter);
    }

    // Sorting
    list.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'dueDate') {
        valA = new Date(a.dueDate).getTime();
        valB = new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const weights = { High: 3, Medium: 2, Low: 1 };
        valA = weights[a.priority] || 0;
        valB = weights[b.priority] || 0;
      } else if (sortBy === 'status') {
        valA = a.status;
        valB = b.status;
      } else if (sortBy === 'progress') {
        valA = a.progress;
        valB = b.progress;
      } else {
        valA = a.id;
        valB = b.id;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  function render() {
    const tasks = getFilteredTasks();
    const allTasks = store.getTasks();
    const myTasksCount = allTasks.filter(t => t.assignee.email === user.email).length;
    const totalTeamCount = allTasks.length;

    const openCount = tasks.filter(t => t.status === 'Open').length;
    const ongoingCount = tasks.filter(t => t.status === 'Ongoing').length;
    const closedCount = tasks.filter(t => t.status === 'Closed').length;

    container.innerHTML = `
      <div class="view-content-wrapper">
        <!-- Page Header -->
        <div class="view-header-row">
          <div>
            <span class="view-subtitle">${isManager ? 'TEAM WORKLOAD REGISTRY' : 'ASSIGNED OPERATIONS'}</span>
            <h1 class="view-title">${isManager ? 'Task Management & Operations' : 'My Assigned Tasks'}</h1>
          </div>
          <div class="view-header-actions">
            ${isManager ? `
              <button class="btn btn-primary btn-glow" id="btn-tasks-create">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                <span>Create New Task</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Task Stats Quick Bar -->
        <div class="task-stats-quickbar">
          <div class="quickbar-stat" data-status-click="All">
            <span class="quickbar-label">Showing:</span>
            <strong class="font-mono text-cyan">${tasks.length}</strong>
          </div>
          <div class="quickbar-divider"></div>
          <div class="quickbar-stat" data-status-click="Open">
            <span class="quickbar-label">Open:</span>
            <strong class="font-mono text-blue">${openCount}</strong>
          </div>
          <div class="quickbar-divider"></div>
          <div class="quickbar-stat" data-status-click="Ongoing">
            <span class="quickbar-label">Ongoing:</span>
            <strong class="font-mono text-cyan">${ongoingCount}</strong>
          </div>
          <div class="quickbar-divider"></div>
          <div class="quickbar-stat" data-status-click="Closed">
            <span class="quickbar-label">Closed:</span>
            <strong class="font-mono text-emerald">${closedCount}</strong>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="card toolbar-card">
          <div class="toolbar-top">
            <div class="toolbar-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="tasks-search-input" class="toolbar-input" placeholder="Search by Task # (e.g. TASK-1039), title, keyword, assignee..." value="${searchQuery}">
              ${searchQuery ? `<button class="btn-clear-search" id="btn-clear-search">&times;</button>` : ''}
            </div>
          </div>

          <div class="toolbar-filters">
            <!-- Manager Specific Assignee Filter -->
            ${isManager ? `
              <div class="filter-chip-group">
                <label class="filter-label">Assignee:</label>
                <select id="filter-assignee" class="filter-select">
                  <option value="All" ${assigneeFilter === 'All' ? 'selected' : ''}>All Team Members (5)</option>
                  ${MOCK_USERS.map(u => `<option value="${u.email}" ${assigneeFilter === u.email ? 'selected' : ''}>${u.name} (${u.role.split(' ')[0]})</option>`).join('')}
                </select>
              </div>
            ` : ''}

            <div class="filter-chip-group">
              <label class="filter-label">Status:</label>
              <select id="filter-status" class="filter-select">
                <option value="All" ${statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Open" ${statusFilter === 'Open' ? 'selected' : ''}>Open</option>
                <option value="Ongoing" ${statusFilter === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
                <option value="Closed" ${statusFilter === 'Closed' ? 'selected' : ''}>Closed</option>
              </select>
            </div>

            <div class="filter-chip-group">
              <label class="filter-label">Priority:</label>
              <select id="filter-priority" class="filter-select">
                <option value="All" ${priorityFilter === 'All' ? 'selected' : ''}>All Priorities</option>
                <option value="High" ${priorityFilter === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${priorityFilter === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>

            <div class="filter-chip-group">
              <label class="filter-label">Department:</label>
              <select id="filter-dept" class="filter-select">
                <option value="All" ${deptFilter === 'All' ? 'selected' : ''}>All Departments</option>
                <option value="Operations" ${deptFilter === 'Operations' ? 'selected' : ''}>Operations</option>
                <option value="Technical Support" ${deptFilter === 'Technical Support' ? 'selected' : ''}>Technical Support</option>
                <option value="Field Support" ${deptFilter === 'Field Support' ? 'selected' : ''}>Field Support</option>
                <option value="Logistics & Dispatch" ${deptFilter === 'Logistics & Dispatch' ? 'selected' : ''}>Logistics & Dispatch</option>
              </select>
            </div>

            <div class="filter-chip-group" style="margin-left: auto;">
              <label class="filter-label">Sort:</label>
              <select id="sort-by" class="filter-select">
                <option value="dueDate-asc" ${sortBy === 'dueDate' && sortOrder === 'asc' ? 'selected' : ''}>Due Date (Earliest)</option>
                <option value="dueDate-desc" ${sortBy === 'dueDate' && sortOrder === 'desc' ? 'selected' : ''}>Due Date (Latest)</option>
                <option value="priority-desc" ${sortBy === 'priority' && sortOrder === 'desc' ? 'selected' : ''}>Priority (Highest)</option>
                <option value="progress-desc" ${sortBy === 'progress' && sortOrder === 'desc' ? 'selected' : ''}>Progress (Highest)</option>
                <option value="status-asc" ${sortBy === 'status' ? 'selected' : ''}>Status</option>
              </select>
            </div>

            ${(statusFilter !== 'All' || priorityFilter !== 'All' || deptFilter !== 'All' || searchQuery || (isManager && assigneeFilter !== 'All')) ? `
              <button class="btn btn-xs btn-outline" id="btn-reset-filters">Reset Filters</button>
            ` : ''}
          </div>
        </div>

        <!-- Task Results Render -->
        <div class="tasks-results-wrap">
          <div class="results-meta-bar">
            <span>Showing <strong>${tasks.length}</strong> tasks ${!isManager && scopeMode === 'my' && !searchQuery ? '(My Assigned Tasks)' : '(Team Catalog)'}</span>
          </div>

          ${tasks.length === 0 ? `
            <div class="empty-state card">
              <h3 class="empty-state-title">No Tasks Found</h3>
              <p class="empty-state-text">No tasks match your current filter and search criteria.</p>
              <button class="btn btn-secondary" id="btn-empty-reset">Clear Filters</button>
            </div>
          ` : renderGrid(tasks)}
        </div>
      </div>
    `;

    attachViewListeners();
  }

  function renderGrid(tasks) {
    return `
      <div class="tasks-grid">
        ${tasks.map(task => {
          const isMyTask = task.assignee.email === user.email;
          return `
            <div class="card task-grid-card ${isMyTask ? 'my-task-card' : ''}" data-task-inspect="${task.id}">
              <div class="grid-card-header">
                <span class="font-mono font-semibold text-cyan">${task.id}</span>
                <span class="badge ${getPriorityBadgeClass(task.priority)}">${task.priority}</span>
              </div>
              
              <h3 class="grid-card-title">${task.title}</h3>
              <p class="grid-card-desc">${task.summary}</p>

              <!-- Progress Bar -->
              <div style="margin: var(--space-2) 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 2px;">
                  <span class="text-muted">Task Progress:</span>
                  <span class="font-mono font-semibold ${task.progress === 100 ? 'text-emerald' : 'text-cyan'}">${task.progress}%</span>
                </div>
                <div class="progress-bar-wrap" style="height: 5px;">
                  <div class="progress-bar-fill ${task.progress === 100 ? 'bg-emerald' : 'bg-cyan'}" style="width: ${task.progress}%;"></div>
                </div>
              </div>

              <div class="grid-card-meta">
                <div class="grid-meta-row">
                  <span class="text-muted">Status:</span>
                  <span class="badge badge-xs ${getStatusBadgeClass(task.status)}">${task.status}</span>
                </div>
                <div class="grid-meta-row">
                  <span class="text-muted">Created:</span>
                  <span class="font-mono text-xs text-muted">${formatCreatedDate(task.createdAt || task.createdDate)}</span>
                </div>
                <div class="grid-meta-row">
                  <span class="text-muted">Department:</span>
                  <span class="text-contrast">${task.department}</span>
                </div>
                <div class="grid-meta-row">
                  <span class="text-muted">Due:</span>
                  <span class="${isOverdue(task.dueDate, task.status) ? 'text-red font-semibold' : 'text-contrast'}">${formatDueDate(task.dueDate)}</span>
                </div>
              </div>

              <div class="grid-card-footer">
                <div class="table-assignee">
                  <img src="${task.assignee.avatar}" alt="${task.assignee.name}" class="assignee-avatar-xs">
                  <span class="assignee-name">${getSimpleName(task.assignee.name)} ${isMyTask ? '(You)' : ''}</span>
                </div>
                <button class="btn btn-xs btn-primary" data-task-inspect="${task.id}">Inspect &rarr;</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function attachViewListeners() {
    const createBtn = container.querySelector('#btn-tasks-create');
    if (createBtn) {
      createBtn.onclick = () => {
        modal.renderCreateTaskModal();
        modal.open('modal-create-task');
      };
    }

    // Agent Scope Buttons (My Tasks vs All Tasks)
    const scopeMyBtn = container.querySelector('#btn-scope-my');
    if (scopeMyBtn) {
      scopeMyBtn.onclick = () => {
        scopeMode = 'my';
        searchQuery = '';
        render();
      };
    }

    const scopeAllBtn = container.querySelector('#btn-scope-all');
    if (scopeAllBtn) {
      scopeAllBtn.onclick = () => {
        scopeMode = 'all';
        render();
      };
    }

    const searchInput = container.querySelector('#tasks-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        render();
      };
    }

    const clearSearch = container.querySelector('#btn-clear-search');
    if (clearSearch) {
      clearSearch.onclick = () => {
        searchQuery = '';
        render();
      };
    }

    const assigneeSelect = container.querySelector('#filter-assignee');
    if (assigneeSelect) {
      assigneeSelect.onchange = (e) => {
        assigneeFilter = e.target.value;
        render();
      };
    }

    const statusSelect = container.querySelector('#filter-status');
    if (statusSelect) {
      statusSelect.onchange = (e) => {
        statusFilter = e.target.value;
        render();
      };
    }

    const prioritySelect = container.querySelector('#filter-priority');
    if (prioritySelect) {
      prioritySelect.onchange = (e) => {
        priorityFilter = e.target.value;
        render();
      };
    }

    const deptSelect = container.querySelector('#filter-dept');
    if (deptSelect) {
      deptSelect.onchange = (e) => {
        deptFilter = e.target.value;
        render();
      };
    }

    const sortSelect = container.querySelector('#sort-by');
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        const parts = e.target.value.split('-');
        sortBy = parts[0];
        sortOrder = parts[1] || 'asc';
        render();
      };
    }

    const resetFiltersBtn = container.querySelector('#btn-reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.onclick = () => {
        searchQuery = '';
        statusFilter = 'All';
        priorityFilter = 'All';
        deptFilter = 'All';
        if (isManager) assigneeFilter = 'All';
        render();
      };
    }

    const emptyResetBtn = container.querySelector('#btn-empty-reset');
    if (emptyResetBtn) {
      emptyResetBtn.onclick = () => {
        searchQuery = '';
        statusFilter = 'All';
        priorityFilter = 'All';
        deptFilter = 'All';
        render();
      };
    }

    container.querySelectorAll('[data-status-click]').forEach(el => {
      el.onclick = () => {
        statusFilter = el.getAttribute('data-status-click');
        render();
      };
    });
  }

  render();
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'High': return 'badge-amber';
    case 'Medium': return 'badge-cyan';
    case 'Low': return 'badge-neutral';
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

function isOverdue(dueDate, status) {
  if (status === 'Closed') return false;
  return new Date(dueDate).getTime() < Date.now();
}

function formatCreatedDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDueDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
