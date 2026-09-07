/**
 * Task Detail & Investigation View
 * Full record, lifecycle progression, comments, interactive progress slider, and attachments
 */

import { store } from '../services/store.js';
import { navigation } from '../components/navigation.js';
import { toast } from '../components/toast.js';

export function renderTaskDetailView(container, params = {}) {
  const p = params || {};
  const taskId = p.taskId || (store.getTasks()[0] ? store.getTasks()[0].id : null);
  let task = store.getTaskById(taskId);

  if (!task) {
    container.innerHTML = `
      <div class="view-content-wrapper">
        <div class="card empty-state">
          <h2 class="empty-state-title">Task Not Found</h2>
          <p class="empty-state-text">The requested task ID (${taskId || 'N/A'}) does not exist in active records.</p>
          <button class="btn btn-primary" id="btn-back-to-tasks">&larr; Return to Tasks List</button>
        </div>
      </div>
    `;
    const backBtn = container.querySelector('#btn-back-to-tasks');
    if (backBtn) backBtn.addEventListener('click', () => navigation.navigate('tasks'));
    return;
  }

  function render() {
    task = store.getTaskById(taskId);
    if (!task) return;

    if (!Array.isArray(task.comments)) task.comments = [];
    if (!Array.isArray(task.timeline)) task.timeline = [];
    if (!Array.isArray(task.attachments)) task.attachments = [];

    const stageIdx = getStageIndex(task.status);
    const stages = ['Open', 'In Progress', 'Under Review', 'Resolved'];

    container.innerHTML = `
      <div class="view-content-wrapper">
        <!-- Breadcrumb & Top Actions -->
        <div class="detail-nav-row">
          <button class="btn-link font-mono" id="btn-detail-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            <span>Back to Task Management</span>
          </button>
          
          <div class="detail-top-actions">
            <span class="font-mono text-muted text-xs">Created: ${formatTimestamp(task.createdAt || task.createdDate)}</span>
            <button class="btn btn-xs btn-outline" id="btn-print-dossier" title="Export Summary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Export Task PDF</span>
            </button>
          </div>
        </div>

        <!-- Task Banner Card -->
        <div class="card detail-banner-card">
          <div class="detail-banner-header">
            <div class="detail-id-wrap">
              <span class="font-mono text-lg font-bold text-cyan">${task.id}</span>
              <span class="badge ${getPriorityBadgeClass(task.priority)}">${task.priority} Priority</span>
              <span class="badge ${getStatusBadgeClass(task.status)}">${task.status}</span>
            </div>
            <div class="detail-due-wrap">
              <span class="text-muted text-xs">SLA Target Due:</span>
              <span class="font-mono text-xs font-semibold text-contrast">${formatDueDate(task.dueDate)}</span>
            </div>
          </div>

          <h1 class="detail-title">${task.title}</h1>
          <p class="detail-desc">${task.description || task.summary}</p>

          <!-- Interactive 4-Stage Operational Lifecycle Stepper -->
          <div class="lifecycle-stepper-wrap">
            <div class="stepper-title font-mono text-xs text-muted">OPERATIONAL LIFECYCLE STAGE:</div>
            <div class="lifecycle-stepper">
              ${stages.map((stage, idx) => {
                const isActive = stageIdx === idx;
                const isPast = stageIdx > idx;
                const statusClass = isActive ? 'step-active' : (isPast ? 'step-done' : 'step-upcoming');
                return `
                  <button type="button" class="stepper-step ${statusClass}" data-set-status="${stage}">
                    <span class="step-num">${isPast ? '✓' : idx + 1}</span>
                    <span class="step-text">${stage}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- 2-Column Investigation Grid -->
        <div class="detail-columns-grid">
          <!-- Left Column: Chronological Audit Log & Comments -->
          <div class="detail-left-col">
            <!-- Timeline & Audit Log -->
            <div class="card panel-card">
              <div class="panel-header">
                <div class="panel-title-wrap">
                  <div class="panel-indicator bg-cyan"></div>
                  <h2 class="panel-title">Audit Log & Event Timeline</h2>
                </div>
              </div>

              <div class="audit-timeline">
                ${task.timeline.length === 0 ? `
                  <div class="text-muted text-sm" style="padding: var(--space-3) 0;">No timeline events logged.</div>
                ` : task.timeline.map(item => `
                  <div class="audit-timeline-item">
                    <div class="audit-item-marker ${item.type === 'action' ? 'marker-cyan' : 'marker-purple'}"></div>
                    <div class="audit-item-content">
                      <div class="audit-header">
                        <span class="audit-author">${item.author}</span>
                        <span class="audit-time font-mono">${formatTimestamp(item.timestamp)}</span>
                      </div>
                      <div class="audit-message">${item.message}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Notes & Comments Thread -->
            <div class="card panel-card" style="margin-top: var(--space-4);">
              <div class="panel-header">
                <div class="panel-title-wrap">
                  <div class="panel-indicator bg-emerald"></div>
                  <h2 class="panel-title">Discussion & Progress Notes (${task.comments.length})</h2>
                </div>
              </div>

              <div class="comments-list">
                ${task.comments.length === 0 ? `
                  <div class="text-muted text-sm" style="padding: var(--space-3) 0;">
                    No notes added yet. Add a progress update below.
                  </div>
                ` : task.comments.map(c => `
                  <div class="comment-item">
                    <img src="${c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${c.author}" class="comment-avatar">
                    <div class="comment-content">
                      <div class="comment-meta">
                        <span class="comment-author font-semibold">${c.author}</span>
                        <span class="comment-role badge badge-xs badge-neutral">${c.role || 'Agent'}</span>
                        <span class="comment-time font-mono text-muted text-xs">${formatTimeAgo(c.timestamp)}</span>
                      </div>
                      <div class="comment-text" style="margin-top: 4px; font-size: var(--text-sm); color: var(--color-text-primary); line-height: 1.4;">${c.text}</div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Add Comment Input Form -->
              <form id="form-add-comment" class="comment-input-form" style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--color-border-subtle);">
                <div class="form-group" style="margin-bottom: var(--space-2);">
                  <label for="new-comment-text" class="form-label text-xs" style="font-weight: 600; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">Add Progress Update / Comment</label>
                  <textarea id="new-comment-text" class="form-control form-textarea" rows="3" placeholder="Type your comment or update here..." required style="width: 100%; box-sizing: border-box;"></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                  <button type="submit" class="btn btn-sm btn-primary" id="btn-submit-comment">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Right Sidebar: Assignee Info, Status Actions, Attachments -->
          <div class="detail-right-col">
            <!-- Primary Action Card -->
            <div class="card panel-card panel-action-card">
              <h3 class="panel-subhead">QUICK STATUS UPDATE</h3>
              <div class="action-buttons-stack">
                ${task.status !== 'In Progress' && task.status !== 'Resolved' ? `
                  <button class="btn btn-primary btn-block btn-set-status" data-status="In Progress">
                    <span>Mark as In Progress</span>
                  </button>
                ` : ''}

                ${task.status === 'In Progress' ? `
                  <button class="btn btn-purple btn-block btn-set-status" data-status="Under Review">
                    <span>Submit for Manager Review</span>
                  </button>
                ` : ''}

                ${task.status !== 'Resolved' ? `
                  <button class="btn btn-emerald btn-block btn-set-status" data-status="Resolved">
                    <span>Mark Task Completed</span>
                  </button>
                ` : `
                  <div class="resolved-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Task completed & resolved.</span>
                  </div>
                  <button class="btn btn-secondary btn-block btn-set-status" data-status="In Progress" style="margin-top: var(--space-2);">
                    <span>Reopen Task</span>
                  </button>
                `}
              </div>
            </div>

            <!-- Assigned Employee & Interactive Progress Card -->
            <div class="card panel-card" style="margin-top: var(--space-4);">
              <h3 class="panel-subhead">ASSIGNED EMPLOYEE</h3>
              <div class="detail-officer-box">
                <img src="${task.assignee.avatar}" alt="${task.assignee.name}" class="officer-box-avatar">
                <div class="officer-box-info">
                  <div class="officer-name font-semibold">${task.assignee.name}</div>
                  <div class="officer-badge text-cyan">${task.assignee.role || 'Operations Agent'}</div>
                  <div class="officer-email text-muted text-xs">${task.assignee.email}</div>
                </div>
              </div>

              <div class="detail-divider"></div>

              <div class="detail-meta-list">
                <div class="meta-row">
                  <span class="meta-title">Department:</span>
                  <span class="meta-value">${task.department}</span>
                </div>
                
                <!-- Interactive Progress Control -->
                <div class="meta-row" style="margin-top: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
                  <span class="meta-title">Task Progress:</span>
                  <span class="meta-value font-mono font-bold ${task.progress === 100 ? 'text-emerald' : 'text-cyan'}" id="progress-val-display">${task.progress}%</span>
                </div>
                <div class="progress-bar-wrap" style="margin-top: var(--space-1); height: 8px;">
                  <div class="progress-bar-fill ${task.progress === 100 ? 'bg-emerald' : 'bg-cyan'}" style="width: ${task.progress}%;"></div>
                </div>

                <div style="margin-top: var(--space-3);">
                  <label for="input-task-progress-slider" style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-bottom: 4px;">Adjust Progress Slider:</label>
                  <input type="range" id="input-task-progress-slider" min="0" max="100" step="5" value="${task.progress}" style="width: 100%; cursor: pointer; accent-color: var(--color-cyan);">
                  <div style="display: flex; justify-content: space-between; gap: 4px; margin-top: 6px;">
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" data-prog="0">0%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" data-prog="25">25%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" data-prog="50">50%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" data-prog="75">75%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" data-prog="100">100%</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Attachments Card -->
            <div class="card panel-card" style="margin-top: var(--space-4);">
              <div class="panel-header">
                <div class="panel-title-wrap">
                  <h3 class="panel-subhead" style="margin: 0;">ATTACHED FILES (${task.attachments.length})</h3>
                </div>
              </div>

              <div class="attachments-list">
                ${task.attachments.length === 0 ? `
                  <div class="text-muted text-xs" style="padding: var(--space-2) 0;">No documents attached.</div>
                ` : task.attachments.map(att => `
                  <a href="${att.url}" class="attachment-item-link" onclick="event.preventDefault(); alert('Opening document: ${att.name}');">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div class="att-meta">
                      <span class="att-name">${att.name}</span>
                      <span class="att-size font-mono">${att.size}</span>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    attachListeners();
  }

  function attachListeners() {
    container.querySelector('#btn-detail-back').onclick = () => {
      navigation.navigate('tasks');
    };

    const printBtn = container.querySelector('#btn-print-dossier');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    // Status Stepper and Quick Status Buttons
    container.querySelectorAll('[data-set-status], .btn-set-status').forEach(btn => {
      btn.onclick = () => {
        const newStatus = btn.getAttribute('data-set-status') || btn.getAttribute('data-status');
        if (newStatus && newStatus !== task.status) {
          store.updateTaskStatus(task.id, newStatus);
          toast.show({
            title: "Status Updated",
            message: `Task ${task.id} updated to: ${newStatus}`,
            type: "success"
          });
          render();
        }
      };
    });

    // Progress Slider
    const slider = container.querySelector('#input-task-progress-slider');
    const progDisplay = container.querySelector('#progress-val-display');
    if (slider) {
      slider.oninput = () => {
        if (progDisplay) progDisplay.textContent = `${slider.value}%`;
      };
      slider.onchange = () => {
        store.updateTaskProgress(task.id, slider.value);
        toast.show({
          title: "Progress Updated",
          message: `Task progress set to ${slider.value}%.`,
          type: "success"
        });
        render();
      };
    }

    // Quick Progress Preset Buttons
    container.querySelectorAll('.btn-quick-prog').forEach(btn => {
      btn.onclick = () => {
        const val = btn.getAttribute('data-prog');
        store.updateTaskProgress(task.id, val);
        toast.show({
          title: "Progress Updated",
          message: `Task progress set to ${val}%.`,
          type: "success"
        });
        render();
      };
    });

    // Form Add Comment
    const commentForm = container.querySelector('#form-add-comment');
    if (commentForm) {
      commentForm.onsubmit = (e) => {
        e.preventDefault();
        const textInput = container.querySelector('#new-comment-text');
        if (!textInput || !textInput.value.trim()) return;

        const noteText = textInput.value.trim();
        textInput.value = '';
        store.addTaskComment(task.id, noteText);
        toast.show({
          title: "Note Posted",
          message: "Your progress update was appended to the task history.",
          type: "success"
        });
        render();
      };
    }
  }

  render();
}

function getStageIndex(status) {
  const map = { 'Open': 0, 'In Progress': 1, 'Ongoing': 1, 'Under Review': 2, 'Resolved': 3, 'Closed': 3 };
  return map[status] !== undefined ? map[status] : 0;
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'Critical': return 'badge-critical';
    case 'High': return 'badge-high';
    case 'Medium': return 'badge-medium';
    case 'Low': return 'badge-low';
    default: return 'badge-neutral';
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Open': return 'badge-open';
    case 'In Progress': case 'Ongoing': return 'badge-progress';
    case 'Under Review': return 'badge-review';
    case 'Resolved': case 'Closed': return 'badge-resolved';
    case 'Overdue': return 'badge-overdue';
    default: return 'badge-neutral';
  }
}

function formatDueDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTimestamp(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const past = new Date(isoString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}