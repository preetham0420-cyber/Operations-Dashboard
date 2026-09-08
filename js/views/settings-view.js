/**
 * Operations Dashboard - Settings View
 * Modular Settings Hub with Appearance, Security, Team Management, and System Controls
 */

import { store } from '../services/store.js';
import { toast } from '../components/toast.js';

export function renderSettingsView(container) {
  const isMgr = store.isManager();
  let activeTab = store.settingsActiveTab || 'appearance';
  if (!isMgr && activeTab === 'teams') {
    activeTab = 'appearance';
    store.settingsActiveTab = 'appearance';
  }

  const html = `
    <div class="view-container animate-fade-in">
      <div class="view-header settings-main-header">
        <div>
          <h1 class="view-title">System & Account Settings</h1>
          <p class="view-subtitle">Manage interface preferences, security credentials, team divisions, and operational controls.</p>
        </div>

      </div>

      <!-- Settings Navigation Tabs -->
      <div class="settings-nav-tabs">
        <button class="settings-tab-btn ${activeTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
          </svg>
          Appearance & Themes
        </button>
        <button class="settings-tab-btn ${activeTab === 'security' ? 'active' : ''}" data-tab="security">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Security & Password
        </button>
        ${isMgr ? `
        <button class="settings-tab-btn ${activeTab === 'teams' ? 'active' : ''}" data-tab="teams">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Team Management (Manager)
        </button>
        ` : ''}
        <button class="settings-tab-btn ${activeTab === 'system' ? 'active' : ''}" data-tab="system">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          System & Simulation
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="settings-tab-content" class="settings-content-pane">
        ${renderTabContent(activeTab)}
      </div>
    </div>
  `;

  if (container) {
    container.innerHTML = html;
    initSettingsView();
  }
  return html;
}

function renderTabContent(tab) {
  switch(tab) {
    case 'appearance': return renderAppearanceTab();
    case 'security': return renderSecurityTab();
    case 'teams': return store.isManager() ? renderTeamsTab() : renderAppearanceTab();
    case 'system': return renderSystemTab();
    default: return renderAppearanceTab();
  }
}

function renderAppearanceTab() {
  const currentTheme = store.getTheme() || 'dark';
  return `
    <div class="card settings-card animate-fade-in">
      <div class="card-header">
        <h2 class="card-title">Color Theme & Visual Tone</h2>
        <p class="text-secondary text-sm">Select an interface style that best matches your operating environment.</p>
      </div>
      <div class="card-body">
        <div class="theme-grid">
          <div class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
            <div class="theme-preview dark-slate"></div>
            <div class="theme-info">
              <div class="theme-name">Dark Slate (Default)</div>
              <div class="theme-desc">High contrast dark charcoal with luminous cyan accents.</div>
            </div>
          </div>
          <div class="theme-option ${currentTheme === 'midnight' ? 'active' : ''}" data-theme="midnight">
            <div class="theme-preview midnight-blue"></div>
            <div class="theme-info">
              <div class="theme-name">Midnight Blue</div>
              <div class="theme-desc">Deep navy aesthetic with emerald and sapphire accents.</div>
            </div>
          </div>
          <div class="theme-option ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
            <div class="theme-preview clean-light"></div>
            <div class="theme-info">
              <div class="theme-name">Crisp Light</div>
              <div class="theme-desc">Clean day mode designed for well-lit office environments.</div>
            </div>
          </div>
          <div class="theme-option ${currentTheme === 'cyber' ? 'active' : ''}" data-theme="cyber">
            <div class="theme-preview cyber-black"></div>
            <div class="theme-info">
              <div class="theme-name">OLED Pitch Black</div>
              <div class="theme-desc">Pure black background with ultra-vibrant electric neon accents.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSecurityTab() {
  const user = store.currentUser || { email: '', name: '' };
  return `
    <div class="card settings-card animate-fade-in">
      <div class="card-header">
        <h2 class="card-title">Account Security & Credentials</h2>
        <p class="text-secondary text-sm">Update your password to ensure secure access to your operations account.</p>
      </div>
      <div class="card-body">
        <div class="user-meta-summary mb-4">
          <div class="font-semibold text-white">${user.name}</div>
          <div class="text-secondary text-sm">${user.email} &bull; ${user.role || 'Agent'}</div>
        </div>

        <form id="settings-change-password-form" class="settings-form">
          <div class="form-group">
            <label class="form-label" for="settings-curr-pass">Current Password</label>
            <input type="password" id="settings-curr-pass" class="form-input" placeholder="Enter current password" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-new-pass">New Password</label>
            <input type="password" id="settings-new-pass" class="form-input" placeholder="Minimum 8 characters" required minlength="8" />
            <div class="text-secondary text-xs mt-1">Must be at least 8 characters with letters and numbers.</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-confirm-pass">Confirm New Password</label>
            <input type="password" id="settings-confirm-pass" class="form-input" placeholder="Re-enter new password" required minlength="8" />
          </div>
          <div class="form-actions mt-4">
            <button type="submit" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderTeamsTab() {
  if (!store.isManager()) {
    return `
      <div class="card settings-card animate-fade-in">
        <div class="card-body" style="padding: 48px; text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 1.5px solid var(--color-red); color: var(--color-red); display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 16px;">
            🔒
          </div>
          <h2 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px;">Access Restricted</h2>
          <p style="font-size: var(--text-sm); color: var(--color-text-secondary); max-width: 460px; margin: 0 auto 20px; line-height: 1.5;">
            Personnel onboarding, Team Head appointments, and division roster transfers are strictly restricted to Head Operations Manager Sarah.
          </p>
          <button class="btn btn-secondary" onclick="document.querySelector('[data-tab=\'appearance\']')?.click()">Return to Appearance Settings</button>
        </div>
      </div>
    `;
  }
  const teams = store.getTeams();
  const teamA = teams.find(t => t.id === 'team-a') || { name: 'Team A', headName: 'Alex', members: [] };
  const teamB = teams.find(t => t.id === 'team-b') || { name: 'Team B', headName: 'David', members: [] };

  return `
    <div class="animate-fade-in">
      <div class="team-mgmt-header-banner">
        <div class="team-mgmt-banner-info">
          <div class="team-mgmt-pill">MANAGER GOVERNANCE</div>
          <h2 class="team-mgmt-banner-title">Team Structure & Division Control</h2>
          <p class="team-mgmt-banner-desc">You have exclusive authority to onboard new agents, assign members between Team A and Team B, and designate Team Heads.</p>
        </div>
        <div class="team-mgmt-banner-action">
          <button id="btn-open-create-agent-modal" class="btn btn-primary btn-lg btn-glow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create New Agent</span>
          </button>
        </div>
      </div>

      <div class="teams-split-grid">
        <!-- Team A Card -->
        <div class="card team-division-card team-a-card">
          <div class="card-header border-b border-subtle pb-3">
            <div class="flex-between">
              <div>
                <span class="badge badge-team-a">Team A</span>
                <h3 class="team-card-title mt-1">Tech & Operations</h3>
              </div>
              <div class="team-head-badge">
                <span class="text-xs text-secondary">Head:</span>
                <strong class="text-cyan">${teamA.headName}</strong>
              </div>
            </div>
            <div class="team-head-select-row mt-3">
              <label class="text-xs text-secondary">Appoint Team Head:</label>
              <select class="form-select form-select-sm select-team-head" data-team-id="team-a">
                ${teamA.members.map(m => `
                  <option value="${m.id}" ${m.name === teamA.headName ? 'selected' : ''}>${m.name} (${m.role})</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="card-body">
            <div class="team-members-list">
              ${teamA.members.map(m => `
                <div class="team-member-item">
                  <div class="flex-start gap-2">
                    ${m.avatar ? `
                      <img src="${m.avatar}" alt="${m.name}" class="team-member-avatar-sm">
                    ` : `
                      <div class="avatar-circle-sm">${m.name.substring(0,2).toUpperCase()}</div>
                    `}
                    <div>
                      <div class="font-semibold text-white flex-start gap-1">
                        ${m.name}
                        ${m.name === teamA.headName ? '<span class="badge badge-head">HEAD</span>' : ''}
                      </div>
                      <div class="text-xs text-secondary">${m.role} &bull; ${m.email}</div>
                    </div>
                  </div>
                  <button class="btn btn-xs btn-outline btn-transfer-agent" data-agent-id="${m.id}" data-target-team="team-b" title="Transfer to Team B">
                    Move to Team B &rarr;
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Team B Card -->
        <div class="card team-division-card team-b-card">
          <div class="card-header border-b border-subtle pb-3">
            <div class="flex-between">
              <div>
                <span class="badge badge-team-b">Team B</span>
                <h3 class="team-card-title mt-1">Field & Logistics</h3>
              </div>
              <div class="team-head-badge">
                <span class="text-xs text-secondary">Head:</span>
                <strong class="text-emerald">${teamB.headName}</strong>
              </div>
            </div>
            <div class="team-head-select-row mt-3">
              <label class="text-xs text-secondary">Appoint Team Head:</label>
              <select class="form-select form-select-sm select-team-head" data-team-id="team-b">
                ${teamB.members.map(m => `
                  <option value="${m.id}" ${m.name === teamB.headName ? 'selected' : ''}>${m.name} (${m.role})</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="card-body">
            <div class="team-members-list">
              ${teamB.members.map(m => `
                <div class="team-member-item">
                  <div class="flex-start gap-2">
                    <div class="avatar-circle-sm avatar-emerald">${m.name.substring(0,2).toUpperCase()}</div>
                    <div>
                      <div class="font-semibold text-white flex-start gap-1">
                        ${m.name}
                        ${m.name === teamB.headName ? '<span class="badge badge-head">HEAD</span>' : ''}
                      </div>
                      <div class="text-xs text-secondary">${m.role} &bull; ${m.email}</div>
                    </div>
                  </div>
                  <button class="btn btn-xs btn-outline btn-transfer-agent" data-agent-id="${m.id}" data-target-team="team-a" title="Transfer to Team A">
                    &larr; Move to Team A
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSystemTab() {
  return `
    <div class="card settings-card animate-fade-in">
      <div class="card-header">
        <h2 class="card-title">Operational Controls & Reset</h2>
        <p class="text-secondary text-sm">Configure real-time simulation preferences or restore the demo to baseline state.</p>
      </div>
      <div class="card-body">
        <div class="settings-toggle-row">
          <div>
            <div class="font-semibold text-white">Audio Alert Chimes</div>
            <div class="text-secondary text-xs">Play subtle audio tone when high-priority tasks or critical leaves are submitted.</div>
          </div>
          <input type="checkbox" id="toggle-audio-chimes" class="settings-toggle" checked />
        </div>

        <div class="settings-toggle-row mt-4">
          <div>
            <div class="font-semibold text-white">Instant Browser Notifications</div>
            <div class="text-secondary text-xs">Trigger in-app notification toasts for progress changes and discussion notes.</div>
          </div>
          <input type="checkbox" id="toggle-browser-notifs" class="settings-toggle" checked />
        </div>

        <hr class="border-subtle my-6" />

        <div class="reset-box">
          <div>
            <div class="font-semibold text-danger">Reset Simulation State</div>
            <div class="text-secondary text-xs">Restores the 8-agent, 2-team roster, default passwords, and tasks back to baseline demo setup.</div>
          </div>
          <button id="btn-reset-simulation" class="btn btn-danger-outline">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initSettingsView() {
  const container = document.querySelector('.view-container');
  if (!container) return;

  // 1. Tab Switching
  const tabButtons = container.querySelectorAll('.settings-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      store.settingsActiveTab = tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const contentPane = document.getElementById('settings-tab-content');
      if (contentPane) {
        contentPane.innerHTML = renderTabContent(tab);
        bindTabListeners(tab);
      }
    });
  });

  // Wire top header Create Agent button
  const topCreateBtn = container.querySelector('#btn-top-create-agent');
  if (topCreateBtn) {
    topCreateBtn.addEventListener('click', () => {
      openCreateAgentModal();
    });
  }

  bindTabListeners(store.settingsActiveTab || 'appearance');
}

function bindTabListeners(tab) {
  // Appearance Theme Selectors
  if (tab === 'appearance') {
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        store.setTheme(theme);
        themeOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        document.documentElement.setAttribute('data-theme', theme);
        toast.show(`Theme updated to ${theme.toUpperCase()}`, 'success');
      });
    });
  }

  // Security Change Password
  if (tab === 'security') {
    const pwForm = document.getElementById('settings-change-password-form');
    if (pwForm) {
      pwForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const curr = document.getElementById('settings-curr-pass').value;
        const next = document.getElementById('settings-new-pass').value;
        const confirm = document.getElementById('settings-confirm-pass').value;

        if (next !== confirm) {
          toast.show('New passwords do not match.', 'error');
          return;
        }
        if (next.length < 8) {
          toast.show('Password must be at least 8 characters.', 'warning');
          return;
        }

        const success = store.changeUserPassword(curr, next);
        if (success) {
          toast.show('Password changed successfully!', 'success');
          pwForm.reset();
        } else {
          toast.show('Current password is incorrect.', 'error');
        }
      });
    }
  }

  // Team Management
  if (tab === 'teams') {
    if (!store.isManager()) return;
    // Team Head change
    const headSelects = document.querySelectorAll('.select-team-head');
    headSelects.forEach(sel => {
      sel.addEventListener('change', () => {
        const teamId = sel.dataset.teamId;
        const agentId = sel.value;
        if (!store.isManager()) {
          toast.show({ title: "Permission Denied", message: "Only Manager Sarah can appoint Team Heads.", type: "error" });
          return;
        }
        store.setTeamHead(teamId, agentId);
        toast.show('Team Head updated successfully!', 'success');
        refreshTeamsTab();
      });
    });

    // Agent transfer
    const transferBtns = document.querySelectorAll('.btn-transfer-agent');
    transferBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const agentId = btn.dataset.agentId;
        const targetTeam = btn.dataset.targetTeam;
        if (!store.isManager()) {
          toast.show({ title: "Permission Denied", message: "Only Manager Sarah can transfer team members.", type: "error" });
          return;
        }
        store.transferAgent(agentId, targetTeam);
        toast.show(`Agent moved to ${targetTeam === 'team-a' ? 'Team A' : 'Team B'}`, 'success');
        refreshTeamsTab();
      });
    });

    // Create Agent Modal trigger
    const createBtn = document.getElementById('btn-open-create-agent-modal');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        openCreateAgentModal();
      });
    }
  }

  // System Controls
  if (tab === 'system') {
    const resetBtn = document.getElementById('btn-reset-simulation');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all simulation data back to initial defaults?')) {
          store.resetToBaseline();
          toast.show('Simulation restored to default state.', 'info');
          setTimeout(() => window.location.reload(), 600);
        }
      });
    }
  }
}

function refreshTeamsTab() {
  const contentPane = document.getElementById('settings-tab-content');
  if (contentPane) {
    contentPane.innerHTML = renderTabContent('teams');
    bindTabListeners('teams');
  }
}

function openCreateAgentModal() {
  if (!store.isManager()) {
    toast.show({
      title: "Access Restricted",
      message: "Only Operations Manager Sarah has permission to onboard new agents.",
      type: "error"
    });
    return;
  }
  if (!store.isManager()) {
    toast.show('Access Denied: Only Manager Sarah has authority to onboard new agents.', 'error');
    return;
  }
  let modal = document.getElementById('modal-create-agent');
  if (modal) modal.remove(); // Re-create fresh

  modal = document.createElement('div');
  modal.id = 'modal-create-agent';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-lg" style="max-width: 680px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <div>
          <h3 class="modal-title">Register & Onboard New Agent</h3>
          <p class="text-secondary text-xs mt-1">Configure complete personal, organizational, and operational credentials for the new agent.</p>
        </div>
        <button class="modal-close" id="btn-close-create-agent">&times;</button>
      </div>
      <form id="form-create-agent" class="modal-body">
        <!-- 2 Column Grid for Fields -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          <div class="form-group">
            <label class="form-label font-semibold">Full Name *</label>
            <input type="text" id="new-agent-name" class="form-input" placeholder="e.g. Rachel Adams" required />
          </div>

          <div class="form-group">
            <label class="form-label font-semibold">Work Email Address *</label>
            <input type="email" id="new-agent-email" class="form-input" placeholder="e.g. rachel@company.com" required />
          </div>

          <div class="form-group">
            <label class="form-label font-semibold">Assign to Division / Team *</label>
            <select id="new-agent-team" class="form-select" required>
              <option value="team-a">Team A (Tech & Operations)</option>
              <option value="team-b">Team B (Field & Logistics)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-semibold">Role / Position *</label>
            <select id="new-agent-role" class="form-select" required>
              <option value="Technical Agent">Technical Agent</option>
              <option value="Operations Agent">Operations Agent</option>
              <option value="Systems Specialist">Systems Specialist</option>
              <option value="Support Specialist">Support Specialist</option>
              <option value="Field Agent">Field Agent</option>
              <option value="Logistics Coordinator">Logistics Coordinator</option>
              <option value="Dispatch Specialist">Dispatch Specialist</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-semibold">Initial Password *</label>
            <input type="text" id="new-agent-password" class="form-input font-mono" value="Password123!" required minlength="8" />
            <span class="text-secondary text-xs">Can be changed later in Profile or Settings.</span>
          </div>

          <div class="form-group">
            <label class="form-label font-semibold">Shift Schedule *</label>
            <select id="new-agent-shift" class="form-select">
              <option value="10:00 AM - 5:00 PM">Standard Day (10:00 AM - 5:00 PM)</option>
              <option value="08:00 AM - 4:00 PM">Morning Shift (08:00 AM - 4:00 PM)</option>
              <option value="12:00 PM - 8:00 PM">Evening Shift (12:00 PM - 8:00 PM)</option>
              <option value="08:00 PM - 04:00 AM">Night Watch (08:00 PM - 04:00 AM)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-semibold">Contact Phone Number</label>
            <input type="text" id="new-agent-phone" class="form-input font-mono" placeholder="e.g. +1 (555) 234-8901" />
          </div>

          <div class="form-group">
            <label class="form-label font-semibold">Primary Station / Location</label>
            <input type="text" id="new-agent-location" class="form-input" placeholder="e.g. HQ Ops Room 3 / Field Sector 7" />
          </div>
        </div>

        <div class="form-group mt-3">
          <label class="form-label font-semibold">Core Skills & Specializations</label>
          <input type="text" id="new-agent-skills" class="form-input" placeholder="Comma-separated: e.g. Linux, Network, Fiber Optic, Emergency Response" />
        </div>

        <div class="form-group mt-3" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 10px 14px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="new-agent-is-head" style="width: 18px; height: 18px; accent-color: var(--accent-cyan, #00f0ff); cursor: pointer;" />
          <div>
            <label for="new-agent-is-head" class="font-semibold text-white" style="cursor: pointer; font-size: 0.88rem;">Appoint as Team Head</label>
            <div class="text-secondary text-xs">If checked, this agent will immediately become the designated Team Head for their assigned division.</div>
          </div>
        </div>

        <div class="modal-footer mt-4" style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-outline" id="btn-cancel-create-agent">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Onboard Agent to Team
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#btn-close-create-agent');
  const cancelBtn = modal.querySelector('#btn-cancel-create-agent');
  const close = () => modal.remove();
  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);

  const form = modal.querySelector('#form-create-agent');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-agent-name').value.trim();
    const email = document.getElementById('new-agent-email').value.trim();
    const role = document.getElementById('new-agent-role').value;
    const teamId = document.getElementById('new-agent-team').value;
    const password = document.getElementById('new-agent-password').value.trim();
    const shift = document.getElementById('new-agent-shift').value;
    const phone = document.getElementById('new-agent-phone').value.trim();
    const location = document.getElementById('new-agent-location').value.trim();
    const skills = document.getElementById('new-agent-skills').value.trim();
    const isTeamHead = document.getElementById('new-agent-is-head').checked;

    const agent = store.createAgent({ name, email, role, teamId, password, shift, phone, location, skills, isTeamHead });
    if (agent) {
      toast.show(`Agent ${name} successfully onboarded to ${teamId === 'team-a' ? 'Team A' : 'Team B'}!`, 'success');
      close();
      refreshTeamsTab();
    } else {
      toast.show('Failed to create agent. Verify manager permissions.', 'error');
    }
  });

  modal.classList.add('active');
}
