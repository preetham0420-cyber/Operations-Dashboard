/**
 * Sign-in & Authentication View
 */

import { store } from '../services/store.js';
import { MOCK_USERS } from '../data/mock-auth.js';
import { navigation } from '../components/navigation.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderAuthView(container) {
  container.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-glow-sphere"></div>
      
      <div class="auth-card">
        <!-- Brand Header -->
        <div class="auth-header">
          <div class="auth-brand-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <h1 class="auth-title">Operations Dashboard</h1>
          <p class="auth-subtitle">Internal Team & Task Management Portal</p>
        </div>

        <!-- Auth Form -->
        <form id="form-auth-login" class="auth-form" novalidate>
          <div class="form-group">
            <label for="auth-email" class="form-label required">Employee Email</label>
            <div class="input-with-icon">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="email" id="auth-email" class="form-control" placeholder="e.g. sarah@company.com" value="" autocomplete="off" required>
            </div>
            <div class="form-feedback error-msg" id="err-auth-email">Valid employee email is required.</div>
          </div>

          <div class="form-group">
            <div class="form-label-row">
              <label for="auth-password" class="form-label required">Password</label>
              <button type="button" class="btn-link" id="btn-forgot-password">Forgot Password?</button>
            </div>
            <div class="input-with-icon">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input type="password" id="auth-password" class="form-control" placeholder="Enter password (e.g. Password123!)" value="" autocomplete="off" required>
              <button type="button" class="btn-toggle-password" id="btn-toggle-password" title="Toggle Password" aria-label="Toggle Password Visibility">
                <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div class="form-feedback error-msg" id="err-auth-password">Password is required.</div>
          </div>

          <div class="auth-error-banner" id="auth-error-banner" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span id="auth-error-text">Authentication failed.</span>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg btn-glow" id="btn-submit-auth">
            <span>Sign In to Dashboard</span>
          </button>
        </form>

        <!-- Subtle Prototype Demo Login Helper -->
        <div class="demo-accounts-compact-wrap" style="margin-top: var(--space-4); text-align: center;">
          <button type="button" class="btn-demo-toggle" id="btn-toggle-demo-accounts" style="background: transparent; border: 1px solid var(--color-border-subtle); color: var(--color-text-secondary); font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-full); transition: all var(--transition-fast);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span>Demo Accounts for Testing</span>
            <svg id="demo-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s;"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <div class="demo-account-cards compact-list" id="demo-accounts-container" style="display: none; margin-top: var(--space-3); flex-direction: column; gap: 6px;">
            ${MOCK_USERS.map(user => `
              <button type="button" class="demo-account-pill compact-pill" data-demo-email="${user.email}" data-demo-pass="Password123!" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-surface-raised); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); cursor: pointer; text-align: left; transition: all var(--transition-fast); width: 100%;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-weight: 600; font-size: 0.82rem; color: var(--color-text-primary);">${user.name}</span>
                  <span style="font-size: 0.72rem; color: var(--color-text-muted);">&bull;</span>
                  <span style="font-size: 0.75rem; color: var(--color-text-secondary);">${user.role}</span>
                </div>
                <span style="font-size: 0.72rem; color: var(--color-cyan); font-weight: 600;">Fill &rarr;</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Listeners
  const form = container.querySelector('#form-auth-login');
  const emailInput = container.querySelector('#auth-email');
  const passwordInput = container.querySelector('#auth-password');
  const togglePassBtn = container.querySelector('#btn-toggle-password');
  const forgotPassBtn = container.querySelector('#btn-forgot-password');
  const errorBanner = container.querySelector('#auth-error-banner');
  const errorText = container.querySelector('#auth-error-text');

  togglePassBtn.addEventListener('click', () => {
    const isPass = passwordInput.type === 'password';
    passwordInput.type = isPass ? 'text' : 'password';
  });

  forgotPassBtn.addEventListener('click', () => {
    modal.renderForgotPasswordModal();
    modal.open('modal-forgot-password');
  });

  // Demo accounts toggle
  const demoToggleBtn = container.querySelector('#btn-toggle-demo-accounts');
  const demoContainer = container.querySelector('#demo-accounts-container');
  const demoChevron = container.querySelector('#demo-chevron');

  if (demoToggleBtn && demoContainer) {
    demoToggleBtn.addEventListener('click', () => {
      const isHidden = demoContainer.style.display === 'none';
      demoContainer.style.display = isHidden ? 'flex' : 'none';
      if (demoChevron) {
        demoChevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  // Demo user quick click — only autofills credentials into the form, does NOT auto-login
  container.querySelectorAll('.demo-account-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const email = pill.getAttribute('data-demo-email');
      const pass = pill.getAttribute('data-demo-pass') || 'Password123!';
      emailInput.value = email;
      passwordInput.value = pass;
      
      // Hide any previous error banner
      errorBanner.style.display = 'none';
      
      // Visual feedback that inputs have been filled
      emailInput.focus();
      toast.show({
        title: "Credentials Filled",
        message: `Credentials filled. Click "Sign In to Dashboard" to log in.`,
        type: "info",
        duration: 2000
      });
    });
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.style.display = 'none';

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorText.textContent = "Please fill in both email and password.";
      errorBanner.style.display = 'flex';
      return;
    }

    const submitBtn = form.querySelector('#btn-submit-auth');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verifying credentials...</span>';

    try {
      navigation.currentView = 'dashboard';
      const success = await store.login(email, password);
      if (success) {
        toast.show({
          title: "Authentication Successful",
          message: `Welcome back, ${store.currentUser.name}!`,
          type: "success"
        });
      } else {
        errorText.textContent = "Invalid email or password. Please use one of the demo accounts below.";
        errorBanner.style.display = 'flex';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
      }
    } catch (err) {
      errorText.textContent = "Authentication error. Please try again.";
      errorBanner.style.display = 'flex';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
    }
  });
}
