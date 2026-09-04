/**
 * Clean User Profile View
 * Standard user account details and application preferences
 */

import { store } from '../services/store.js';
import { toast } from '../components/toast.js';

export function renderProfileView(container) {
  const user = store.currentUser;
  const isManager = store.isManager();

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Page Header -->
      <div class="view-header-row">
        <div>
          <span class="view-subtitle">ACCOUNT & SETTINGS</span>
          <h1 class="view-title">User Profile</h1>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-outline" id="btn-profile-logout" style="border-color: var(--color-red); color: var(--color-red);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); max-width: 900px;">
        <!-- Left: User Account Information -->
        <div class="card panel-card">
          <div class="panel-header">
            <div class="panel-title-wrap">
              <div class="panel-indicator bg-cyan"></div>
              <h2 class="panel-title">Account Details</h2>
            </div>
            <span class="badge ${isManager ? 'badge-cyan' : 'badge-neutral'}">${user.role}</span>
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-5); padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-subtle);">
            <img src="${user.avatar}" alt="${user.name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-border-subtle);">
            <div>
              <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary); margin-bottom: 2px;">${user.name}</h3>
              <p style="font-size: var(--text-xs); color: var(--color-text-secondary);">${user.email}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 2px;">Role</div>
              <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary);">${user.role}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 2px;">Department</div>
              <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary);">${user.department}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 2px;">Shift Schedule</div>
              <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary);">${user.shift}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 2px;">Contact</div>
              <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary);">${user.phone || '+91 98765 43210'}</div>
            </div>
          </div>
        </div>

        <!-- Right: Preferences & Session -->
        <div class="card panel-card">
          <div class="panel-header">
            <div class="panel-title-wrap">
              <div class="panel-indicator bg-purple"></div>
              <h2 class="panel-title">Preferences & Security</h2>
            </div>
          </div>

          <div style="margin-bottom: var(--space-5); padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px;">Theme Mode</div>
                <div style="font-size: var(--text-xs); color: var(--color-text-secondary);">Switch between Dark and Light mode.</div>
              </div>
              <button class="btn btn-sm btn-outline" id="btn-profile-toggle-theme">
                ${store.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              </button>
            </div>
          </div>

          <div>
            <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px;">Switch User Account</div>
            <p style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-bottom: var(--space-3);">
              To access a different account or role, sign out and sign in with the new credentials.
            </p>
            <button class="btn btn-secondary btn-sm" id="btn-profile-signout-secondary">
              Sign Out & Switch User
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  attachListeners();

  function attachListeners() {
    const handleLogout = () => {
      if (confirm("Sign out of your account?")) {
        store.logout();
      }
    };

    const logoutBtn1 = container.querySelector('#btn-profile-logout');
    if (logoutBtn1) logoutBtn1.addEventListener('click', handleLogout);

    const logoutBtn2 = container.querySelector('#btn-profile-signout-secondary');
    if (logoutBtn2) logoutBtn2.addEventListener('click', handleLogout);

    const themeBtn = container.querySelector('#btn-profile-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const next = store.toggleTheme();
        toast.show({
          title: "Theme Updated",
          message: `Active theme: ${next.toUpperCase()}`,
          type: "info",
          duration: 1500
        });
        renderProfileView(container);
      });
    }
  }
}
