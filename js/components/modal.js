/**
 * GOD'S EYE SECURITY FORCE (GESF)
 * Modal Controller Component
 */

import { store } from '../services/store.js';
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

    modal.innerHTML = `
      <div class="modal-dialog modal-md" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge">SECURITY CREDENTIAL RECOVERY</span>
            <h2 class="modal-title">Reset Security Passcode</h2>
          </div>
          <button class="modal-close-btn" id="btn-close-forgot-pass" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-muted" style="margin-bottom: var(--space-4);">
            Enter your employee email address to receive password reset instructions.
          </p>
          <div class="form-group">
            <label for="forgot-email" class="form-label">Employee Email</label>
            <input type="email" id="forgot-email" class="form-control" placeholder="e.g. sarah@company.com">
          </div>
          <div class="callout callout-info" style="margin-top: var(--space-3); font-size: var(--text-xs);">
            <strong>Note for Prototype:</strong> Standard demo credentials are provided directly on the Sign-In screen for instant access.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-forgot">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-send-reset">Send Reset Instructions</button>
        </div>
      </div>
    `;

    modal.querySelector('#btn-close-forgot-pass').addEventListener('click', () => this.close());
    modal.querySelector('#btn-cancel-forgot').addEventListener('click', () => this.close());
    modal.querySelector('#btn-send-reset').addEventListener('click', () => {
      const email = modal.querySelector('#forgot-email').value;
      if (!email || !email.includes('@')) {
        toast.show({
          title: "Invalid Input",
          message: "Please enter a valid GESF email address.",
          type: "danger"
        });
        return;
      }

      toast.show({
        title: "Reset Dispatch Sent",
        message: `Security recovery verification sent to ${email}. Check command communications.`,
        type: "success"
      });
      this.close();
    });
  }
}

export const modal = new ModalController();
