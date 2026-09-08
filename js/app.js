/**
 * Main Application Bootstrap & Router
 */

import { store } from './services/store.js';
import { navigation } from './components/navigation.js';
import { modal } from './components/modal.js';
import { toast } from './components/toast.js';

window.appNavigation = navigation;

import { renderAuthView } from './views/auth-view.js';
import { renderDashboardView } from './views/dashboard-view.js';

class Application {
  constructor() {
    this.appRoot = document.getElementById('app') || document.body;
    try {
      this.init();
    } catch(err) {
      console.error("Application init error:", err);
      this.renderApp();
    }
  }

  init() {
    // If old cached user format is detected, auto-reset to fresh Option C dataset
    if (store.currentUser && store.currentUser.email && store.currentUser.email.includes('.manager@')) {
      if (typeof store.resetDemoData === 'function') {
        store.resetDemoData();
      }
    }

    store.subscribe((type) => {
      if (type === 'AUTH_LOGIN' || type === 'AUTH_LOGOUT' || type === 'DEMO_RESET') {
        navigation.currentView = 'dashboard';
        this.renderApp();
      } else if (type === 'USER_SWITCHED') {
        this.renderApp();
      } else if (type === 'NOTIFICATIONS_UPDATED' || type === 'TASK_CREATED' || type === 'TASK_UPDATED') {
        this.updateBadges();
      }
    });

    navigation.onViewChange((viewName, params) => {
      this.renderView(viewName, params);
    });

    this.renderApp();
  }

  renderApp() {
    if (!store.isAuthenticated) {
      this.appRoot.className = 'auth-mode';
      renderAuthView(this.appRoot);
      return;
    }

    this.appRoot.className = 'app-mode';
    this.appRoot.innerHTML = `
      <div class="app-layout ${navigation.isSidebarCollapsed ? 'sidebar-collapsed' : ''}" id="app-layout-shell">
        ${navigation.renderSidebar()}
        <div class="app-main-viewport">
          ${navigation.renderTopbar()}
          <main class="main-content-scroll" id="main-content-scroll">
            <div id="view-container"></div>
          </main>
          ${navigation.renderMobileBar()}
        </div>
      </div>
    `;

    navigation.attachListeners();
    this.renderView(navigation.currentView);
  }

  async renderView(viewName, params = {}) {
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;

    try {
      switch (viewName) {
        case 'dashboard': {
          renderDashboardView(viewContainer);
          break;
        }
        case 'tasks': {
          const { renderTasksView } = await import(`./views/tasks-view.js?v=${Date.now()}`);
          renderTasksView(viewContainer, params);
          break;
        }
        case 'task-detail': {
          const { renderTaskDetailView } = await import(`./views/task-detail-view.js?v=${Date.now()}`);
          renderTaskDetailView(viewContainer, params);
          break;
        }
        case 'attendance': {
          const { renderAttendanceView } = await import(`./views/attendance-view.js?v=${Date.now()}`);
          renderAttendanceView(viewContainer);
          break;
        }
        case 'notifications': {
          const { renderNotificationsView } = await import(`./views/notifications-view.js?v=${Date.now()}`);
          renderNotificationsView(viewContainer);
          break;
        }
              case 'settings': {
          const { renderSettingsView } = await import(`./views/settings-view.js?v=${Date.now()}`);
          renderSettingsView(viewContainer);
          break;
        }
      case 'profile': {
          const { renderProfileView } = await import(`./views/profile-view.js?v=${Date.now()}`);
          renderProfileView(viewContainer);
          break;
        }
        default: {
          renderDashboardView(viewContainer);
        }
      }
    } catch (err) {
      console.warn(`View ${viewName} module not yet deployed:`, err);
      viewContainer.innerHTML = `
        <div class="view-content-wrapper" style="padding: var(--space-8) var(--space-6); text-align: center;">
          <div class="card empty-state" style="max-width: 500px; margin: 40px auto; padding: var(--space-8);">
            <div style="font-size: 2rem; margin-bottom: 12px;">🚧</div>
            <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px;">Module In Development</h3>
            <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: 20px;">
              The <strong>${viewName.replace('-', ' ').toUpperCase()}</strong> module is scheduled for upcoming deployment.
            </p>
            <button class="btn btn-primary" onclick="window.appNavigation?.navigate('dashboard')">Return to Dashboard</button>
          </div>
        </div>
      `;
    }

    this.updateBadges();
  }

  updateBadges() {
    const unreadCount = store.getUnreadNotificationsCount();
    const tasks = store.getTasks();
    const isManager = store.isManager();
    const relevantTasks = isManager ? tasks : tasks.filter(t => t.assignee.email === store.currentUser?.email);
    const activeTasksCount = relevantTasks.filter(t => t.status !== 'Closed').length;

    const topbarNotifBadge = document.getElementById('topbar-notif-count');
    const topbarBell = document.getElementById('btn-topbar-notifs');
    if (topbarBell) {
      if (unreadCount > 0) {
        topbarBell.classList.add('has-unread');
        if (topbarNotifBadge) topbarNotifBadge.textContent = unreadCount;
        else {
          const pill = document.createElement('span');
          pill.className = 'notif-badge-pill';
          pill.id = 'topbar-notif-count';
          pill.textContent = unreadCount;
          topbarBell.appendChild(pill);
        }
      } else {
        topbarBell.classList.remove('has-unread');
        if (topbarNotifBadge) topbarNotifBadge.remove();
      }
    }

    const sidebarTaskCount = document.getElementById('sidebar-task-count');
    if (sidebarTaskCount) {
      if (activeTasksCount > 0) {
        sidebarTaskCount.textContent = activeTasksCount;
        sidebarTaskCount.style.display = 'inline-block';
      } else {
        sidebarTaskCount.style.display = 'none';
      }
    }

    const sidebarNotifCount = document.getElementById('sidebar-notif-count');
    if (sidebarNotifCount) {
      if (unreadCount > 0) {
        sidebarNotifCount.textContent = unreadCount;
        sidebarNotifCount.style.display = 'inline-block';
      } else {
        sidebarNotifCount.style.display = 'none';
      }
    }
  }
}

function bootstrapApp() {
  if (!window.__app) {
    window.__app = new Application();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
