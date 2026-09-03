/**
 * Navigation Component
 * Collapsible sidebar, topbar, mobile nav, and global route dispatcher
 */

import { store } from '../services/store.js';
import { modal } from './modal.js';
import { toast } from './toast.js';

class NavigationComponent {
  constructor() {
    this.currentView = 'dashboard';
    this.isSidebarCollapsed = localStorage.getItem('ops_sidebar_collapsed') === 'true';
    this.onViewChangeCallbacks = [];
    this.initGlobalDelegation();
  }

  onViewChange(callback) {
    this.onViewChangeCallbacks.push(callback);
  }

  navigate(viewName, params = {}) {
    this.currentView = viewName;
    this.updateActiveNavLinks(viewName);
    this.onViewChangeCallbacks.forEach(cb => cb(viewName, params || {}));

    const mainContent = document.getElementById('main-content-scroll');
    if (mainContent) mainContent.scrollTop = 0;
  }

  // Global event delegation ensures clicking any [data-view] or [data-task-id] always works
  initGlobalDelegation() {
    document.addEventListener('click', (e) => {
      // Check for [data-view]
      const navTarget = e.target.closest('[data-view]');
      if (navTarget) {
        const view = navTarget.getAttribute('data-view');
        if (view) {
          e.preventDefault();
          this.navigate(view);
          return;
        }
      }

      // Check for [data-open-task] or task inspection
      const taskTarget = e.target.closest('[data-task-inspect]');
      if (taskTarget) {
        const taskId = taskTarget.getAttribute('data-task-inspect');
        if (taskId) {
          e.preventDefault();
          this.navigate('task-detail', { taskId });
          return;
        }
      }
    });
  }

  renderTopbar() {
    const unreadCount = store.getUnreadNotificationsCount();
    const user = store.currentUser;
    const isManager = store.isManager();

    return `
      <header class="gesf-topbar" id="app-topbar">
        <div class="topbar-left">
          <button class="icon-btn sidebar-toggle-btn" id="btn-toggle-sidebar" title="Toggle Sidebar" aria-label="Toggle Sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div class="topbar-search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="global-search-input" placeholder="Search tasks, agents, logs... (Press /)" aria-label="Global Search">
            <kbd class="kbd-shortcut">/</kbd>
          </div>
        </div>

        <div class="topbar-right">
          ${isManager ? `
            <button class="btn btn-sm btn-primary-outline" id="btn-quick-create-task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>New Task</span>
            </button>
          ` : ''}

          <!-- Notifications Bell -->
          <button class="icon-btn notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}" id="btn-topbar-notifs" data-view="notifications" title="Notifications" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            ${unreadCount > 0 ? `<span class="notif-badge-pill" id="topbar-notif-count">${unreadCount}</span>` : ''}
          </button>
        </div>
      </header>
    `;
  }

  renderSidebar() {
    const unreadCount = store.getUnreadNotificationsCount();
    const tasks = store.getTasks();
    const user = store.currentUser;
    const isManager = store.isManager();
    const relevantTasks = isManager ? tasks : tasks.filter(t => t.assignee.email === user.email);
    const activeTasksCount = relevantTasks.filter(t => t.status !== 'Closed').length;

    return `
      <aside class="gesf-sidebar ${this.isSidebarCollapsed ? 'collapsed' : ''}" id="app-sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div class="brand-text-block">
            <span class="brand-title">OPERATIONS</span>
            <span class="brand-subtitle">TEAM & TASKS</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">CORE MODULES</div>
          
          <button class="nav-item ${this.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard" title="Dashboard">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </span>
            <span class="nav-label">Dashboard</span>
          </button>

          <button class="nav-item ${this.currentView === 'tasks' ? 'active' : ''}" data-view="tasks" title="Tasks & Workload">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </span>
            <span class="nav-label">${isManager ? 'Task Management' : 'My Tasks'}</span>
            ${activeTasksCount > 0 ? `<span class="nav-badge-count" id="sidebar-task-count">${activeTasksCount}</span>` : ''}
          </button>

          <button class="nav-item" disabled style="opacity: 0.45; cursor: not-allowed;" title="Attendance & Shifts (Upcoming)">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span class="nav-label">Attendance & Shifts</span>
          </button>

          <button class="nav-item ${this.currentView === 'notifications' ? 'active' : ''}" data-view="notifications" title="Notifications">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </span>
            <span class="nav-label">Notifications</span>
            ${unreadCount > 0 ? `<span class="nav-badge-count notif-count" id="sidebar-notif-count">${unreadCount}</span>` : ''}
          </button>

          <div class="nav-section-title" style="margin-top: var(--space-4);">ACCOUNT</div>

          <button class="nav-item ${this.currentView === 'profile' ? 'active' : ''}" data-view="profile" title="Profile">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="nav-label">Profile</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user-card" id="sidebar-profile-card">
            <img class="sidebar-user-avatar" src="${user.avatar}" alt="${user.name}">
            <div class="sidebar-user-info">
              <span class="sidebar-user-name">${user.name}</span>
              <span class="sidebar-user-clearance">${user.role}</span>
            </div>
            <button class="icon-btn-ghost btn-logout" id="btn-sidebar-logout" title="Sign Out" aria-label="Sign Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  renderMobileBar() {
    const unreadCount = store.getUnreadNotificationsCount();

    return `
      <nav class="gesf-mobile-bottom-bar" id="mobile-nav-bar">
        <button class="mobile-nav-item ${this.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>Dashboard</span>
        </button>
        <button class="mobile-nav-item ${this.currentView === 'tasks' ? 'active' : ''}" data-view="tasks">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>Tasks</span>
        </button>
        <button class="mobile-nav-item" disabled style="opacity: 0.45; cursor: not-allowed;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Attendance</span>
        </button>
        <button class="mobile-nav-item ${this.currentView === 'notifications' ? 'active' : ''}" data-view="notifications">
          <div style="position: relative; display: inline-block;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            ${unreadCount > 0 ? `<span class="mobile-badge-dot"></span>` : ''}
          </div>
          <span>Alerts</span>
        </button>
        <button class="mobile-nav-item ${this.currentView === 'profile' ? 'active' : ''}" data-view="profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Profile</span>
        </button>
      </nav>
    `;
  }

  attachListeners() {
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const sidebar = document.getElementById('app-sidebar');
        const appLayout = document.getElementById('app-layout-shell');
        if (sidebar && appLayout) {
          this.isSidebarCollapsed = !this.isSidebarCollapsed;
          sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
          appLayout.classList.toggle('sidebar-collapsed', this.isSidebarCollapsed);
          localStorage.setItem('ops_sidebar_collapsed', this.isSidebarCollapsed);
        }
      };
    }

    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.onclick = () => {
        const newTheme = store.toggleTheme();
        toast.show({
          title: "Theme Mode",
          message: `Switched to ${newTheme.toUpperCase()} mode.`,
          type: "info",
          duration: 1500
        });
      };
    }

    const createBtn = document.getElementById('btn-quick-create-task');
    if (createBtn) {
      createBtn.onclick = () => {
        modal.renderCreateTaskModal();
        modal.open('modal-create-task');
      };
    }

    const logoutBtn = document.getElementById('btn-sidebar-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        store.logout();
        toast.show({
          title: "Logged Out",
          message: "You have securely signed out.",
          type: "info"
        });
      };
    }

    const topbarLogoutBtn = document.getElementById('btn-topbar-logout');
    if (topbarLogoutBtn) {
      topbarLogoutBtn.onclick = () => {
        store.logout();
        toast.show({
          title: "Logged Out",
          message: "You have securely signed out.",
          type: "info"
        });
      };
    }

    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.onkeydown = (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          const query = searchInput.value.trim();
          this.navigate('tasks', { search: query });
        }
      };
    }

    document.onkeydown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const search = document.getElementById('global-search-input');
        if (search) search.focus();
      }
    };
  }

  updateActiveNavLinks(viewName) {
    document.querySelectorAll('[data-view]').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }
}

export const navigation = new NavigationComponent();
