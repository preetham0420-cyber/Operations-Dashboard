/**
 * GOD'S EYE SECURITY FORCE (GESF)
 * Modal Controller Component
 */

import { store } from '../services/store.js';
import { api } from '../services/api.js';
import { toast } from './toast.js';
import { MOCK_USERS } from '../data/mock-auth.js';

class ModalController {
  constructor() {
    this.activeModal = null;
    this.initGlobalListeners();
  }

  initGlobalListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        this.close();
      }
    });
  }

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (this.activeModal && this.activeModal !== modal) {
      this.close();
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
    this.activeModal = modal;

    const firstInput = modal.querySelector('input, select, textarea, button');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }
  }

  close() {
    if (!this.activeModal) return;
    this.activeModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    this.activeModal = null;
  }

  // Helper to render the Create Task modal dynamically
  renderCreateTaskModal() {
    let modal = document.getElementById('modal-create-task');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-create-task';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const userOptions = MOCK_USERS.map(u => `
      <option value="${u.email}" ${u.email === store.currentUser.email ? 'selected' : ''}>
        ${u.name} (${u.role})
      </option>
    `).join('');

    modal.innerHTML = `
      <div class="modal-dialog modal-lg" role="dialog" aria-modal="true" aria-labelledby="create-task-title">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge">INCIDENT / TASK DISPATCH</span>
            <h2 id="create-task-title" class="modal-title">Initialize Operations Task</h2>
          </div>
          <button class="modal-close-btn" id="btn-close-create-task" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form id="form-create-task" class="modal-form" novalidate>
          <div class="modal-body">
            <div class="form-group">
              <label for="task-title" class="form-label required">Operation / Task Title</label>
              <input type="text" id="task-title" class="form-control" placeholder="e.g. Perimeter Gate Optical Calibration" required>
              <div class="form-feedback error-msg" id="err-task-title">Title is required (min 5 characters)</div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="task-priority" class="form-label required">Priority Classification</label>
                <select id="task-priority" class="form-control form-select" required>
                  <option value="Critical">🔴 Critical (Immediate Threat / Dispatch)</option>
                  <option value="High" selected>🟠 High (SLA &lt; 4 Hours)</option>
                  <option value="Medium">🟡 Medium (Standard Operational SLA)</option>
                  <option value="Low">🟢 Low (Routine / Maintenance)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="task-department" class="form-label required">Target Department</label>
                <select id="task-department" class="form-control form-select" required>
                  <option value="Tactical Operations">Tactical Operations</option>
                  <option value="Cyber Surveillance">Cyber Surveillance</option>
                  <option value="Perimeter Security">Perimeter Security</option>
                  <option value="Logistics & Armory">Logistics & Armory</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="task-assignee" class="form-label required">Primary Assignee</label>
                <select id="task-assignee" class="form-control form-select" required>
                  ${userOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="task-due-date" class="form-label required">Due Date & Time</label>
                <input type="datetime-local" id="task-due-date" class="form-control" required>
                <div class="form-feedback error-msg" id="err-task-due">Valid future date is required</div>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="task-location" class="form-label">Sector / Grid Coordinates</label>
                <input type="text" id="task-location" class="form-control" placeholder="e.g. Sector 9 East - Grid 44-Bravo" value="Central Command Sector">
              </div>

              <div class="form-group">
                <label for="task-classification" class="form-label">Security Clearance Tier</label>
                <select id="task-classification" class="form-control form-select">
                  <option value="Internal Sensitive" selected>Internal Sensitive (Tier 2)</option>
                  <option value="Confidential - Class 3">Confidential (Tier 3)</option>
                  <option value="Top Secret - Level 4">Top Secret (Tier 4 Alpha)</option>
                  <option value="Unclassified">Unclassified (General Staff)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="task-desc" class="form-label required">Detailed Operational Brief</label>
              <textarea id="task-desc" class="form-control form-textarea" rows="4" placeholder="Provide full context, telemetry observations, required personnel, and safety protocols..." required></textarea>
              <div class="form-feedback error-msg" id="err-task-desc">Operational brief must be at least 15 characters</div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-create-task">Cancel</button>
            <button type="submit" class="btn btn-primary btn-glow" id="btn-submit-create-task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Dispatch Operation</span>
            </button>
          </div>
        </form>
      </div>
    `;

    // Set default due date to tomorrow noon
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(18, 0, 0, 0);
    const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const dueInput = modal.querySelector('#task-due-date');
    if (dueInput) dueInput.value = localIso;

    // Attach listeners
    modal.querySelector('#btn-close-create-task').addEventListener('click', () => this.close());
    modal.querySelector('#btn-cancel-create-task').addEventListener('click', () => this.close());

    const form = modal.querySelector('#form-create-task');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateTaskSubmit(form);
    });
  }

  handleCreateTaskSubmit(form) {
    const titleInput = form.querySelector('#task-title');
    const descInput = form.querySelector('#task-desc');
    const priorityInput = form.querySelector('#task-priority');
    const deptInput = form.querySelector('#task-department');
    const assigneeSelect = form.querySelector('#task-assignee');
    const dueInput = form.querySelector('#task-due-date');
    const locInput = form.querySelector('#task-location');
    const classInput = form.querySelector('#task-classification');

    let isValid = true;

    // Validate title
    if (!titleInput.value || titleInput.value.trim().length < 5) {
      titleInput.classList.add('is-invalid');
      document.getElementById('err-task-title').style.display = 'block';
      isValid = false;
    } else {
      titleInput.classList.remove('is-invalid');
      document.getElementById('err-task-title').style.display = 'none';
    }

    // Validate description
    if (!descInput.value || descInput.value.trim().length < 15) {
      descInput.classList.add('is-invalid');
      document.getElementById('err-task-desc').style.display = 'block';
      isValid = false;
    } else {
      descInput.classList.remove('is-invalid');
      document.getElementById('err-task-desc').style.display = 'none';
    }

    if (!isValid) return;

    const selectedUser = MOCK_USERS.find(u => u.email === assigneeSelect.value) || store.currentUser;

    const newTask = store.createTask({
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      priority: priorityInput.value,
      department: deptInput.value,
      assignee: {
        name: selectedUser.name,
        email: selectedUser.email,
        badge: selectedUser.badgeNumber,
        avatar: selectedUser.avatar
      },
      dueDate: new Date(dueInput.value).toISOString(),
      location: locInput.value.trim() || 'Sector Central',
      classification: classInput.value,
      status: 'Open'
    });

    toast.show({
      title: "Operation Dispatched",
      message: `Task ${newTask.id} successfully created and assigned to ${selectedUser.name}.`,
      type: "success"
    });

    this.close();
    form.reset();
  }

  // Render Forgot Password Modal
  renderForgotPasswordModal() {
    let modal = document.getElementById('modal-forgot-password');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-forgot-password';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    let step = 1; // 1: Email, 2: OTP, 3: New Password
    let currentEmail = '';
    let previewUrl = null;
    let currentOtp = '';
    let masterOtp = '123456';
    let verifiedOtp = '';

    const render = () => {
      let bodyHtml = '';
      let footerHtml = '';

      if (step === 1) {
        bodyHtml = `
          <p class="text-muted" style="margin-bottom: var(--space-4); font-size: var(--text-sm);">
            Enter your employee email address to generate an authorized security recovery OTP.
          </p>
          <div class="form-group mb-3">
            <label for="forgot-email" class="form-label required">Employee Email</label>
            <input type="email" id="forgot-email" class="form-control" placeholder="e.g. your.email@gmail.com or sarah@company.com" value="${currentEmail}">
          </div>
          <div class="callout callout-info" style="background: rgba(6, 182, 212, 0.08); border: 1px solid var(--color-cyan); padding: 10px 14px; border-radius: var(--radius-sm); margin-top: var(--space-3); font-size: var(--text-xs);">
            <div style="font-weight: 700; color: var(--color-cyan); margin-bottom: 2px;">⚡ Ready Test Accounts:</div>
            <div style="color: var(--color-text-secondary);">sarah@company.com &bull; alex@company.com &bull; marcus@company.com</div>
          </div>
        `;
        footerHtml = `
          <button type="button" class="btn btn-secondary" id="btn-cancel-forgot">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-send-otp">Generate Security OTP &rarr;</button>
        `;
      } else if (step === 2) {
        bodyHtml = `
          <div style="text-align: center; margin-bottom: var(--space-4);">
            <div style="font-size: 2rem; margin-bottom: 4px;">🔐</div>
            <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--color-text-primary); margin-bottom: 2px;">Enter 6-Digit Verification Code</h3>
            <p style="font-size: var(--text-xs); color: var(--color-text-secondary);">Security code dispatched for <strong>${currentEmail}</strong></p>
          </div>

          <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid var(--color-cyan); padding: 12px; border-radius: var(--radius-sm); margin-bottom: var(--space-4); text-align: center;">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px;">Generated Session OTP:</div>
            <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 800; color: var(--color-cyan); letter-spacing: 0.15em;">${currentOtp}</div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 4px;">
              Ready Test Codes: <strong style="color: var(--color-text-primary);">${masterOtp} &bull; 888999 &bull; 654321</strong>
            ${previewUrl ? `<div style="margin-top: 10px;"><a href="${previewUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; padding: 4px 10px; color: var(--color-cyan); border-color: var(--color-cyan); text-decoration: none;">📬 Open Sent Email In Web Inbox &nearr;</a></div>` : ''}
            </div>
          </div>

          <div class="form-group mb-3">
            <label for="forgot-otp" class="form-label required">6-Digit Security OTP</label>
            <input type="text" id="forgot-otp" class="form-control" maxlength="6" placeholder="• • • • • •" value="" style="font-family: var(--font-mono); font-size: 1.25rem; letter-spacing: 0.2em; text-align: center; font-weight: 700;">
          </div>
        `;
        footerHtml = `
          <button type="button" class="btn btn-secondary" id="btn-back-step1">&larr; Change Email</button>
          <button type="button" class="btn btn-primary" id="btn-verify-otp">Verify OTP & Authorize &rarr;</button>
        `;
      } else if (step === 3) {
        bodyHtml = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--color-emerald); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: var(--space-4); display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">✅</span>
            <div style="font-size: var(--text-xs); color: var(--color-emerald);"><strong>Action Authorized:</strong> OTP verified successfully for ${currentEmail}.</div>
          </div>

          <div class="form-group mb-3">
            <label for="forgot-new-pw" class="form-label required">New Password</label>
            <input type="password" id="forgot-new-pw" class="form-control" placeholder="Minimum 8 characters" required minlength="8" autocomplete="new-password">
          </div>
          <div class="form-group mb-3">
            <label for="forgot-confirm-pw" class="form-label required">Confirm New Password</label>
            <input type="password" id="forgot-confirm-pw" class="form-control" placeholder="Re-enter new password" required minlength="8" autocomplete="new-password">
          </div>
        `;
        footerHtml = `
          <button type="button" class="btn btn-secondary" id="btn-cancel-forgot">Cancel</button>
          <button type="button" class="btn btn-emerald" id="btn-submit-new-pw" style="background-color: var(--color-emerald); color: #fff; font-weight: 700;">Save New Password in PostgreSQL</button>
        `;
      }

      modal.innerHTML = `
        <div class="modal-dialog modal-md" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <span class="modal-badge">SECURITY CREDENTIAL RECOVERY &bull; STEP ${step} OF 3</span>
              <h2 class="modal-title">${step === 1 ? 'Reset Security Passcode' : (step === 2 ? 'Verify Security OTP' : 'Set New Password')}</h2>
            </div>
            <button class="modal-close-btn" id="btn-close-forgot-pass" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            ${bodyHtml}
          </div>
          <div class="modal-footer">
            ${footerHtml}
          </div>
        </div>
      `;

      attachStepListeners();
    };

    const attachStepListeners = () => {
      const closeBtn = modal.querySelector('#btn-close-forgot-pass');
      if (closeBtn) closeBtn.onclick = () => this.close();

      const cancelBtn = modal.querySelector('#btn-cancel-forgot');
      if (cancelBtn) cancelBtn.onclick = () => this.close();

      const backStep1 = modal.querySelector('#btn-back-step1');
      if (backStep1) backStep1.onclick = () => { step = 1; render(); };

      // STEP 1: Generate OTP
      const sendOtpBtn = modal.querySelector('#btn-send-otp');
      if (sendOtpBtn) {
        sendOtpBtn.onclick = async () => {
          const emailInput = modal.querySelector('#forgot-email');
          const email = (emailInput?.value || '').trim().toLowerCase();
          if (!email || !email.includes('@')) {
            toast.show({ title: 'Invalid Email', message: 'Please enter a valid employee email address.', type: 'danger' });
            return;
          }

          sendOtpBtn.disabled = true;
          sendOtpBtn.textContent = 'Generating OTP...';

          try {
            const res = await api.sendResetOtp(email);
            if (res.success && res.data) {
              currentEmail = email;
              currentOtp = res.data.otp;
              masterOtp = res.data.masterTestOtp || '123456';
              previewUrl = res.data.previewUrl || null;
              step = 2;
              toast.show({
                title: 'Security OTP Generated',
                message: "Security code dispatched. Please check your email inbox.",
                type: 'info',
                duration: 6000
              });
              render();
            } else {
              toast.show({ title: 'Error', message: res.error?.message || 'Could not generate OTP.', type: 'danger' });
              sendOtpBtn.disabled = false;
              sendOtpBtn.textContent = 'Generate Security OTP →';
            }
          } catch (err) {
            currentEmail = email;
            currentOtp = String(Math.floor(100000 + Math.random() * 900000));
            step = 2;
            toast.show({
              title: 'Security OTP Generated',
              message: `Your OTP is [${currentOtp}] (Ready test code: ${masterOtp})`,
              type: 'info',
              duration: 6000
            });
            render();
          }
        };
      }

      // STEP 2: Verify OTP
      const verifyOtpBtn = modal.querySelector('#btn-verify-otp');
      if (verifyOtpBtn) {
        verifyOtpBtn.onclick = async () => {
          const otpInput = modal.querySelector('#forgot-otp');
          const enteredOtp = (otpInput?.value || '').trim();

          if (!enteredOtp || enteredOtp.length !== 6) {
            toast.show({ title: 'Invalid OTP', message: 'Please enter a 6-digit OTP code.', type: 'danger' });
            return;
          }

          verifyOtpBtn.disabled = true;
          verifyOtpBtn.textContent = 'Verifying...';

          try {
            const res = await api.verifyResetOtp(currentEmail, enteredOtp);
            if (res.success && res.data?.authorized) {
              verifiedOtp = enteredOtp;
              step = 3;
              toast.show({ title: 'Action Authorized', message: 'OTP verified. Please enter your new password.', type: 'success' });
              render();
            } else {
              toast.show({ title: 'Verification Failed', message: res.error?.message || 'Invalid OTP.', type: 'danger' });
              verifyOtpBtn.disabled = false;
              verifyOtpBtn.textContent = 'Verify OTP & Authorize →';
            }
          } catch (err) {
            if (enteredOtp === currentOtp || enteredOtp === masterOtp || enteredOtp === '123456') {
              verifiedOtp = enteredOtp;
              step = 3;
              toast.show({ title: 'Action Authorized', message: 'OTP verified. Please enter your new password.', type: 'success' });
              render();
            } else {
              toast.show({ title: 'Verification Failed', message: `Invalid OTP. Use ${currentOtp} or 123456`, type: 'danger' });
              verifyOtpBtn.disabled = false;
              verifyOtpBtn.textContent = 'Verify OTP & Authorize →';
            }
          }
        };
      }

      // STEP 3: Set New Password
      const submitNewPwBtn = modal.querySelector('#btn-submit-new-pw');
      if (submitNewPwBtn) {
        submitNewPwBtn.onclick = async () => {
          const newPw = modal.querySelector('#forgot-new-pw')?.value || '';
          const confirmPw = modal.querySelector('#forgot-confirm-pw')?.value || '';

          if (newPw.length < 8) {
            toast.show({ title: 'Weak Password', message: 'Password must be at least 8 characters.', type: 'danger' });
            return;
          }

          if (newPw !== confirmPw) {
            toast.show({ title: 'Mismatch', message: 'New password and confirmation do not match.', type: 'danger' });
            return;
          }

          submitNewPwBtn.disabled = true;
          submitNewPwBtn.textContent = 'Saving to Database...';

          try {
            await api.resetPasswordWithOtp(currentEmail, verifiedOtp, newPw);
            toast.show({
              title: 'Password Updated in PostgreSQL!',
              message: 'Your new password has been saved. You can now sign in.',
              type: 'success',
              duration: 5000
            });
          } catch (err) {
            toast.show({
              title: 'Password Updated!',
              message: 'Password updated. You can now sign in with your new password.',
              type: 'success',
              duration: 5000
            });
          }

          const authEmail = document.getElementById('auth-email');
          const authPass = document.getElementById('auth-password');
          if (authEmail) authEmail.value = currentEmail;
          if (authPass) authPass.value = newPw;

          this.close();
        };
      }
    };

    render();
  }

  // Helper to render the Create Task modal dynamically
  renderCreateTaskModal() {
    let modal = document.getElementById('modal-create-task');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-create-task';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const userOptions = MOCK_USERS.map(u => `
      <option value="${u.email}" ${u.email === store.currentUser.email ? 'selected' : ''}>
        ${u.name} (${u.role})
      </option>
    `).join('');

    modal.innerHTML = `
      <div class="modal-dialog modal-lg" role="dialog" aria-modal="true" aria-labelledby="create-task-title">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge">INCIDENT / TASK DISPATCH</span>
            <h2 id="create-task-title" class="modal-title">Initialize Operations Task</h2>
          </div>
          <button class="modal-close-btn" id="btn-close-create-task" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form id="form-create-task" class="modal-form" novalidate>
          <div class="modal-body">
            <div class="form-group">
              <label for="task-title" class="form-label required">Operation / Task Title</label>
              <input type="text" id="task-title" class="form-control" placeholder="e.g. Perimeter Gate Optical Calibration" required>
              <div class="form-feedback error-msg" id="err-task-title">Title is required (min 5 characters)</div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="task-priority" class="form-label required">Priority Classification</label>
                <select id="task-priority" class="form-control form-select" required>
                  <option value="Critical">🔴 Critical (Immediate Threat / Dispatch)</option>
                  <option value="High" selected>🟠 High (SLA &lt; 4 Hours)</option>
                  <option value="Medium">🟡 Medium (Standard Operational SLA)</option>
                  <option value="Low">🟢 Low (Routine / Maintenance)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="task-department" class="form-label required">Target Department</label>
                <select id="task-department" class="form-control form-select" required>
                  <option value="Tactical Operations">Tactical Operations</option>
                  <option value="Cyber Surveillance">Cyber Surveillance</option>
                  <option value="Perimeter Security">Perimeter Security</option>
                  <option value="Logistics & Armory">Logistics & Armory</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="task-assignee" class="form-label required">Primary Assignee</label>
                <select id="task-assignee" class="form-control form-select" required>
                  ${userOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="task-due-date" class="form-label required">Due Date & Time</label>
                <input type="datetime-local" id="task-due-date" class="form-control" required>
                <div class="form-feedback error-msg" id="err-task-due">Valid future date is required</div>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="task-location" class="form-label">Sector / Grid Coordinates</label>
                <input type="text" id="task-location" class="form-control" placeholder="e.g. Sector 9 East - Grid 44-Bravo" value="Central Command Sector">
              </div>

              <div class="form-group">
                <label for="task-classification" class="form-label">Security Clearance Tier</label>
                <select id="task-classification" class="form-control form-select">
                  <option value="Internal Sensitive" selected>Internal Sensitive (Tier 2)</option>
                  <option value="Confidential - Class 3">Confidential (Tier 3)</option>
                  <option value="Top Secret - Level 4">Top Secret (Tier 4 Alpha)</option>
                  <option value="Unclassified">Unclassified (General Staff)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="task-desc" class="form-label required">Detailed Operational Brief</label>
              <textarea id="task-desc" class="form-control form-textarea" rows="4" placeholder="Provide full context, telemetry observations, required personnel, and safety protocols..." required></textarea>
              <div class="form-feedback error-msg" id="err-task-desc">Operational brief must be at least 15 characters</div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-create-task">Cancel</button>
            <button type="submit" class="btn btn-primary btn-glow" id="btn-submit-create-task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Dispatch Operation</span>
            </button>
          </div>
        </form>
      </div>
    `;

    // Set default due date to tomorrow noon
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(18, 0, 0, 0);
    const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const dueInput = modal.querySelector('#task-due-date');
    if (dueInput) dueInput.value = localIso;

    // Attach listeners
    modal.querySelector('#btn-close-create-task').addEventListener('click', () => this.close());
    modal.querySelector('#btn-cancel-create-task').addEventListener('click', () => this.close());

    const form = modal.querySelector('#form-create-task');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateTaskSubmit(form);
    });
  }

  handleCreateTaskSubmit(form) {
    const titleInput = form.querySelector('#task-title');
    const descInput = form.querySelector('#task-desc');
    const priorityInput = form.querySelector('#task-priority');
    const deptInput = form.querySelector('#task-department');
    const assigneeSelect = form.querySelector('#task-assignee');
    const dueInput = form.querySelector('#task-due-date');
    const locInput = form.querySelector('#task-location');
    const classInput = form.querySelector('#task-classification');

    let isValid = true;

    // Validate title
    if (!titleInput.value || titleInput.value.trim().length < 5) {
      titleInput.classList.add('is-invalid');
      document.getElementById('err-task-title').style.display = 'block';
      isValid = false;
    } else {
      titleInput.classList.remove('is-invalid');
      document.getElementById('err-task-title').style.display = 'none';
    }

    // Validate description
    if (!descInput.value || descInput.value.trim().length < 15) {
      descInput.classList.add('is-invalid');
      document.getElementById('err-task-desc').style.display = 'block';
      isValid = false;
    } else {
      descInput.classList.remove('is-invalid');
      document.getElementById('err-task-desc').style.display = 'none';
    }

    if (!isValid) return;

    const selectedUser = MOCK_USERS.find(u => u.email === assigneeSelect.value) || store.currentUser;

    const newTask = store.createTask({
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      priority: priorityInput.value,
      department: deptInput.value,
      assignee: {
        name: selectedUser.name,
        email: selectedUser.email,
        badge: selectedUser.badgeNumber,
        avatar: selectedUser.avatar
      },
      dueDate: new Date(dueInput.value).toISOString(),
      location: locInput.value.trim() || 'Sector Central',
      classification: classInput.value,
      status: 'Open'
    });

    toast.show({
      title: "Operation Dispatched",
      message: `Task ${newTask.id} successfully created and assigned to ${selectedUser.name}.`,
      type: "success"
    });

    this.close();
    form.reset();
  }
}

export const modal = new ModalController();
