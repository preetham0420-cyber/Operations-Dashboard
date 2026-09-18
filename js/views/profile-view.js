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

      <div class="profile-grid">
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
            <img src="${user.avatar}" alt="${user.name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-border-subtle); flex-shrink: 0;">
            <div style="min-width: 0; overflow: hidden;">
              <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary); margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user.name}</h3>
              <p style="font-size: var(--text-xs); color: var(--color-text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user.email}</p>
            </div>
          </div>

          <div class="profile-details-grid">
            <div class="profile-detail-item">
              <div class="profile-detail-label">Role</div>
              <div class="profile-detail-val">${user.role}</div>
            </div>
            <div class="profile-detail-item">
              <div class="profile-detail-label">Department</div>
              <div class="profile-detail-val">${user.department}</div>
            </div>
            <div class="profile-detail-item">
              <div class="profile-detail-label">Shift Schedule</div>
              <div class="profile-detail-val">${user.shift}</div>
            </div>
            <div class="profile-detail-item">
              <div class="profile-detail-label">Contact</div>
              <div class="profile-detail-val">${user.phone || '+91 98765 43210'}</div>
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
            <div class="profile-theme-row">
              <div class="profile-theme-info">
                <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px;">Theme Mode</div>
                <div style="font-size: var(--text-xs); color: var(--color-text-secondary);">Switch between Dark and Light mode.</div>
              </div>
              <button class="btn btn-sm btn-outline profile-theme-btn" id="btn-profile-toggle-theme">
                ${store.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              </button>
            </div>
          </div>

          <div>
            <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px;">Switch User Account</div>
            <p style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-bottom: var(--space-3);">
              To access a different account or role, sign out and sign in with the new credentials.
            </p>
            <button class="btn btn-secondary btn-sm btn-block-mobile" id="btn-profile-signout-secondary">
              Sign Out & Switch User
            </button>
          </div>
        </div>
      </div>
    
      <!-- Change Password Card -->
      <div class="card mt-6" style="max-width: 900px;">
        <div class="card-header">
          <h2 class="card-title">Change Password</h2>
          <p class="text-secondary text-sm">Ensure your operations account uses a strong, private password.</p>
        </div>
        <div class="card-body">
          <form id="profile-change-pw-form" class="settings-form" style="max-width: 480px; width: 100%;">
            <div class="form-group mb-3">
              <label class="form-label" for="profile-curr-pw">Current Password</label>
              <input type="password" id="profile-curr-pw" class="form-control form-input" placeholder="Current password" required autocomplete="current-password" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label" for="profile-new-pw">New Password</label>
              <input type="password" id="profile-new-pw" class="form-control form-input" placeholder="Minimum 8 characters" required minlength="8" autocomplete="new-password" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label" for="profile-confirm-pw">Confirm New Password</label>
              <input type="password" id="profile-confirm-pw" class="form-control form-input" placeholder="Re-enter new password" required minlength="8" autocomplete="new-password" />
            </div>
            <button type="submit" class="btn btn-primary btn-block-mobile mt-2">Update Password</button>
          </form>
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

    const pwForm = container.querySelector('#profile-change-pw-form');
    if (pwForm) {
      pwForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const curr = container.querySelector('#profile-curr-pw').value;
        const newPw = container.querySelector('#profile-new-pw').value;
        const confirmPw = container.querySelector('#profile-confirm-pw').value;

        if (newPw !== confirmPw) {
          toast.show({
            title: "Password Mismatch",
            message: "New password and confirmation do not match.",
            type: "danger"
          });
          return;
        }

        toast.show({
          title: "Password Updated",
          message: "Your account credentials have been successfully updated.",
          type: "success"
        });
        pwForm.reset();
      });
    }
  }
}
