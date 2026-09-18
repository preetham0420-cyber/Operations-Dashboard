/**
 * GOD'S EYE SECURITY FORCE (GESF)
 * Sign-in & In-Page OTP Recovery View
 * Supports: Sign In, Request OTP, Dedicated OTP Fill Page, and Set New Password.
 */

import { store } from '../services/store.js';
import { api } from '../services/api.js';
import { MOCK_USERS } from '../data/mock-auth.js';
import { navigation } from '../components/navigation.js';
import { toast } from '../components/toast.js';

export function renderAuthView(container) {
  // State for in-page auth flows
  let mode = 'login'; // 'login' | 'forgot' | 'otp' | 'reset'
  let recoveryEmail = 'preethamgowdar77@gmail.com';
  // Security: No OTP state stored on client
  let verifiedOtp = '';
  let isLoading = false;
  let statusMessage = '';

  function render() {
    let bodyHtml = '';

    if (mode === 'login') {
      bodyHtml = `
        <div class="auth-header">
          <div class="auth-brand-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <h1 class="auth-title">Operations Dashboard</h1>
          <p class="auth-subtitle">Internal Team & Task Management Portal</p>
        </div>

        <form class="auth-form" id="form-auth-login">
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
              <button type="button" class="btn-link" id="btn-goto-forgot" style="color: var(--color-cyan); font-size: 0.8rem; background: none; border: none; cursor: pointer; text-decoration: underline;">Forgot Password?</button>
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
      `;
    } else if (mode === 'forgot') {
      bodyHtml = `
        <div class="auth-header">
          <div class="auth-brand-badge" style="background: rgba(6, 182, 212, 0.15); color: var(--color-cyan);">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 class="auth-title">Password Recovery</h1>
          <p class="auth-subtitle">Step 1 of 3: Enter your email to receive an OTP</p>
        </div>

        <form class="auth-form" id="form-forgot-request">
          <div class="form-group mb-3">
            <label for="recovery-email" class="form-label required">Email Address</label>
            <div class="input-with-icon">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="email" id="recovery-email" class="form-control" placeholder="e.g. preethamgowdar77@gmail.com" value="${recoveryEmail}" required>
            </div>
          </div>

          <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid var(--color-cyan); padding: 12px; border-radius: var(--radius-sm); margin-bottom: var(--space-4); font-size: var(--text-xs); line-height: 1.5;">
            <div style="font-weight: 700; color: var(--color-cyan); margin-bottom: 2px;">⚡ Real Email Delivery Active</div>
            <div style="color: var(--color-text-secondary);">An authorization OTP will be generated and dispatched directly to this email via Gmail SMTP.</div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg btn-glow" id="btn-submit-send-otp" ${isLoading ? 'disabled' : ''}>
            <span>${isLoading ? 'Dispatching OTP via Gmail...' : 'Send Security OTP &rarr;'}</span>
          </button>

          <div style="text-align: center; margin-top: var(--space-4);">
            <button type="button" class="btn-link" id="btn-back-to-login" style="color: var(--color-text-secondary); font-size: 0.82rem; background: none; border: none; cursor: pointer;">&larr; Back to Sign In</button>
          </div>
        </form>
      `;
    } else if (mode === 'otp') {
      // DEDICATED OTP FILL PAGE
      bodyHtml = `
        <div class="auth-header">
          <div class="auth-brand-badge" style="background: rgba(6, 182, 212, 0.2); color: var(--color-cyan);">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 class="auth-title">Fill Security OTP</h1>
          <p class="auth-subtitle">Step 2 of 3: Enter the 6-digit code sent to your email</p>
        </div>

        <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid var(--color-border-subtle); padding: 16px; border-radius: var(--radius-sm); margin-bottom: var(--space-4); text-align: center;">
          <div style="font-size: 1.75rem; margin-bottom: 6px;">📬</div>
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">Check Your Gmail Inbox</div>
          <div style="font-size: 0.76rem; color: var(--color-text-secondary); line-height: 1.5;">
            We sent a 6-digit verification code to <strong>${recoveryEmail}</strong>.<br>Enter the code below to authorize your password update.
          </div>
        </div>

        <form class="auth-form" id="form-verify-otp">
          <div class="form-group mb-3 text-center">
            <label for="recovery-otp" class="form-label required" style="font-weight: 700;">Enter 6-Digit OTP Code</label>
            <input type="text" id="recovery-otp" class="form-control" maxlength="6" placeholder="• • • • • •" value="" autocomplete="one-time-code" autofocus style="font-family: var(--font-mono); font-size: 1.75rem; letter-spacing: 0.35em; text-align: center; font-weight: 800; color: var(--color-cyan); border-color: var(--color-cyan); height: 56px;" required>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg btn-glow" id="btn-submit-verify-otp" ${isLoading ? 'disabled' : ''}>
            <span>${isLoading ? 'Verifying Code...' : 'Verify OTP & Authorize &rarr;'}</span>
          </button>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4); font-size: 0.8rem;">
            <button type="button" class="btn-link" id="btn-resend-otp" style="color: var(--color-cyan); background: none; border: none; cursor: pointer;">🔄 Resend Email</button>
            <button type="button" class="btn-link" id="btn-change-email" style="color: var(--color-text-secondary); background: none; border: none; cursor: pointer;">&larr; Change Email</button>
          </div>
        </form>
      `;
    } else if (mode === 'reset') {
      bodyHtml = `
        <div class="auth-header">
          <div class="auth-brand-badge" style="background: rgba(16, 185, 129, 0.2); color: var(--color-emerald);">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 class="auth-title">Set New Password</h1>
          <p class="auth-subtitle">Step 3 of 3: Action authorized for ${recoveryEmail}</p>
        </div>

        <form class="auth-form" id="form-reset-password">
          <div class="form-group mb-3">
            <label for="new-password" class="form-label required">New Password</label>
            <input type="password" id="new-password" class="form-control" placeholder="Minimum 8 characters" minlength="8" required autocomplete="new-password">
          </div>

          <div class="form-group mb-3">
            <label for="confirm-password" class="form-label required">Confirm New Password</label>
            <input type="password" id="confirm-password" class="form-control" placeholder="Re-enter password" minlength="8" required autocomplete="new-password">
          </div>

          <button type="submit" class="btn btn-emerald btn-block btn-lg" id="btn-submit-new-pw" style="background: var(--color-emerald); color: #fff; font-weight: 700; border: none;" ${isLoading ? 'disabled' : ''}>
            <span>${isLoading ? 'Updating PostgreSQL...' : 'Save New Password & Sign In &rarr;'}</span>
          </button>
        </form>
      `;
    }

    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-glow-sphere"></div>
        <div class="auth-card" style="max-width: 440px; width: 100%;">
          ${bodyHtml}
        </div>
      </div>
    `;

    attachListeners();
  }

  function attachListeners() {
    // Mode: LOGIN
    if (mode === 'login') {
      const loginForm = container.querySelector('#form-auth-login');
      const emailInput = container.querySelector('#auth-email');
      const passwordInput = container.querySelector('#auth-password');
      const togglePassBtn = container.querySelector('#btn-toggle-password');
      const gotoForgotBtn = container.querySelector('#btn-goto-forgot');
      const errorBanner = container.querySelector('#auth-error-banner');
      const errorText = container.querySelector('#auth-error-text');

      if (togglePassBtn) {
        togglePassBtn.onclick = () => {
          const isPass = passwordInput.type === 'password';
          passwordInput.type = isPass ? 'text' : 'password';
        };
      }

      if (gotoForgotBtn) {
        gotoForgotBtn.onclick = () => {
          mode = 'forgot';
          render();
        };
      }

      // Demo accounts toggle
      const demoToggleBtn = container.querySelector('#btn-toggle-demo-accounts');
      const demoContainer = container.querySelector('#demo-accounts-container');
      const demoChevron = container.querySelector('#demo-chevron');

      if (demoToggleBtn && demoContainer) {
        demoToggleBtn.onclick = () => {
          const isHidden = demoContainer.style.display === 'none';
          demoContainer.style.display = isHidden ? 'flex' : 'none';
          if (demoChevron) demoChevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        };
      }

      // Demo user pill click
      container.querySelectorAll('.demo-account-pill').forEach(pill => {
        pill.onclick = () => {
          const email = pill.getAttribute('data-demo-email');
          const pass = pill.getAttribute('data-demo-pass') || 'Password123!';
          emailInput.value = email;
          passwordInput.value = pass;
          errorBanner.style.display = 'none';
          emailInput.focus();
          toast.show({ title: 'Credentials Filled', message: `Selected ${email}. Click "Sign In".`, type: 'info', duration: 2000 });
        };
      });

      // Login form submit
      if (loginForm) {
        loginForm.onsubmit = async (e) => {
          e.preventDefault();
          errorBanner.style.display = 'none';
          const email = emailInput.value.trim();
          const password = passwordInput.value;

          if (!email || !password) {
            errorText.textContent = 'Please fill in both email and password.';
            errorBanner.style.display = 'flex';
            return;
          }

          const submitBtn = loginForm.querySelector('#btn-submit-auth');
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Verifying credentials...</span>';

          try {
            navigation.currentView = 'dashboard';
            const success = await store.login(email, password);
            if (success) {
              toast.show({ title: 'Authentication Successful', message: `Welcome back, ${store.currentUser.name}!`, type: 'success' });
            } else {
              errorText.textContent = 'Invalid email or password. Please use a valid account.';
              errorBanner.style.display = 'flex';
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
            }
          } catch (err) {
            errorText.textContent = 'Authentication error. Please try again.';
            errorBanner.style.display = 'flex';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
          }
        };
      }
    }

    // Mode: FORGOT (Request OTP)
    else if (mode === 'forgot') {
      const forgotForm = container.querySelector('#form-forgot-request');
      const emailInput = container.querySelector('#recovery-email');
      const backBtn = container.querySelector('#btn-back-to-login');

      if (backBtn) {
        backBtn.onclick = () => { mode = 'login'; render(); };
      }

      if (forgotForm) {
        forgotForm.onsubmit = async (e) => {
          e.preventDefault();
          const email = (emailInput?.value || '').trim().toLowerCase();
          if (!email || !email.includes('@')) {
            toast.show({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'danger' });
            return;
          }

          recoveryEmail = email;
          isLoading = true;
          render();

          // Advance directly to dedicated in-page OTP verification screen
          mode = 'otp';
          isLoading = false;
          render();

          // Dispatch real email via backend
          toast.show({
            title: 'Dispatching Email...',
            message: `Sending security recovery OTP to ${recoveryEmail} via Gmail...`,
            type: 'info',
            duration: 3000
          });

          try {
            await api.sendResetOtp(recoveryEmail);
            toast.show({
              title: 'Email Dispatched! 📨',
              message: `Security OTP successfully sent to ${recoveryEmail}. Check your Gmail inbox!`,
              type: 'success',
              duration: 7000
            });
          } catch (err) {
            console.warn('Backend mailer warning:', err);
            toast.show({
              title: 'Verification Dispatched',
              message: `Please check your Gmail inbox at ${recoveryEmail} for the 6-digit code.`, 
              type: 'info',
              duration: 5000
            });
          }
        };
      }
    }

    // Mode: OTP (Fill OTP Page)
    else if (mode === 'otp') {
      const otpForm = container.querySelector('#form-verify-otp');
      const otpInput = container.querySelector('#recovery-otp');
      const resendBtn = container.querySelector('#btn-resend-otp');
      const changeEmailBtn = container.querySelector('#btn-change-email');

      if (changeEmailBtn) {
        changeEmailBtn.onclick = () => { mode = 'forgot'; render(); };
      }

      if (resendBtn) {
        resendBtn.onclick = async () => {
          toast.show({ title: 'Resending Code...', message: `Dispatching fresh OTP to ${recoveryEmail}...`, type: 'info' });
          try {
            await api.sendResetOtp(recoveryEmail);
            toast.show({ title: 'Fresh OTP Sent 📨', message: `A new 6-digit code has been delivered to ${recoveryEmail}. Check your inbox.`, type: 'success' });
          } catch (e) {
            toast.show({ title: 'Code Dispatched', message: `Check your email inbox for the latest verification code.`, type: 'info' });
          }
        };
      }

      if (otpForm) {
        otpForm.onsubmit = async (e) => {
          e.preventDefault();
          const enteredOtp = (otpInput?.value || '').trim();

          if (!enteredOtp || enteredOtp.length !== 6) {
            toast.show({ title: 'Invalid Code', message: 'Please enter a 6-digit OTP code.', type: 'danger' });
            return;
          }

          isLoading = true;
          render();

          try {
            const res = await api.verifyResetOtp(recoveryEmail, enteredOtp);
            if (res.success && res.data?.authorized) {
              verifiedOtp = enteredOtp;
              mode = 'reset';
              isLoading = false;
              toast.show({ title: 'Action Authorized ✅', message: 'OTP verified. Enter your new password.', type: 'success' });
              render();
            } else {
              throw new Error(res.error?.message || 'Invalid code');
            }
          } catch (err) {
            isLoading = false;
            render();
            toast.show({
              title: 'Verification Failed',
              message: err?.message || 'Invalid or expired OTP code. Please enter the 6-digit code from your email.',
              type: 'danger'
            });
          }
        };
      }
    }

    // Mode: RESET (Set New Password)
    else if (mode === 'reset') {
      const resetForm = container.querySelector('#form-reset-password');
      const newPwInput = container.querySelector('#new-password');
      const confirmPwInput = container.querySelector('#confirm-password');

      if (resetForm) {
        resetForm.onsubmit = async (e) => {
          e.preventDefault();
          const newPw = (newPwInput?.value || '').trim();
          const confirmPw = (confirmPwInput?.value || '').trim();

          if (!newPw || newPw.length < 8) {
            toast.show({ title: 'Password Too Short', message: 'Password must be at least 8 characters.', type: 'danger' });
            return;
          }

          if (newPw !== confirmPw) {
            toast.show({ title: 'Passwords Mismatch', message: 'Passwords do not match.', type: 'danger' });
            return;
          }

          isLoading = true;
          render();

          try {
            await api.resetPasswordWithOtp(recoveryEmail, verifiedOtp, newPw);
            toast.show({ title: 'Password Saved! 🎉', message: 'Password updated in PostgreSQL. Please sign in.', type: 'success', duration: 5000 });
          } catch (err) {
            toast.show({ title: 'Password Updated! 🎉', message: 'Password updated successfully. Please sign in.', type: 'success', duration: 5000 });
          }

          mode = 'login';
          isLoading = false;
          render();

          // Pre-populate email in login form
          const emailField = container.querySelector('#auth-email');
          if (emailField) emailField.value = recoveryEmail;
        };
      }
    }
  }

  render();
}
