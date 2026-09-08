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
          <button class="btn btn-primary" id="btn-back-to-tasks">&larr; Return to Tasks List</div>
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

    const canEditProgress = store.canEditTaskProgress(task);
    const isManager = store.isManager();
    const canManagerClose = store.canManagerCloseTask(task);

    if (!Array.isArray(task.comments)) task.comments = [];
    if (!Array.isArray(task.timeline)) task.timeline = [];
    if (!Array.isArray(task.attachments)) task.attachments = [];

    const stageIdx = getStageIndex(task.status);
    const stages = [
      { id: 'Open', label: 'Open', num: '1' },
      { id: 'Ongoing', label: 'Ongoing', num: '2' },
      { id: 'In Review', label: 'In Review', num: '3' },
      { id: 'Closed', label: 'Closed', num: '4' }
    ];

    const curStatus = (task.status || '').toLowerCase();
    const isOpen = curStatus === 'open';
    const isOngoing = curStatus === 'ongoing' || curStatus.includes('progress');
    const isInReview = curStatus.includes('review');
    const isClosed = curStatus === 'closed' || curStatus === 'completed' || curStatus === 'resolved';

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
              ${canManagerClose ? `
                <button id="btn-manager-force-close" class="btn btn-xs btn-danger-soft" style="margin-left: 8px;" title="Manager Close Task">
                  🛡️ Manager Close Task
                </button>
              ` : ''}
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
            <div class="stepper-title font-mono text-xs text-muted" style="margin-bottom: var(--space-2); letter-spacing: 0.08em;">OPERATIONAL LIFECYCLE STAGE:</div>
            <div class="lifecycle-stepper">
              ${stages.map((stage, idx) => {
                const isActive = stageIdx === idx;
                const isPast = stageIdx > idx;
                const statusClass = isActive ? 'current' : (isPast ? 'completed' : 'upcoming');
                return `
                  <div class="lifecycle-step ${statusClass}">
                    <div class="lifecycle-step-icon">
                      ${isPast ? '✓' : stage.num}
                    </div>
                    <span class="lifecycle-step-text" style="font-weight: ${isActive ? '700' : '500'};">${stage.label}</span>
                  </div>
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
              <h3 class="panel-subhead">${isManager ? 'OPERATIONAL CONTROLS (MANAGER)' : 'WORKFLOW ACTIONS'}</h3>
              <div class="action-buttons-stack">
                ${isManager ? `
                  <!-- Manager Sarah Controls (Strictly NO Submit for Review, NO Mark Completed) -->
                  ${isClosed ? `
                    <div class="resolved-banner">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>Task closed & verified by Manager Sarah.</span>
                    </div>
                    <button class="btn btn-secondary btn-block btn-set-status" data-status="Ongoing" style="margin-top: var(--space-2);">
                      <span>Reopen Task to Ongoing</span>
                    </button>
                  ` : `
                    ${isInReview ? `
                      <button id="btn-manager-action-close" class="btn btn-emerald btn-block" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; padding: 12px;">
                        <span>🛡️ Approve & Close Task (100% Verified)</span>
                      </button>
                      <button class="btn btn-secondary btn-block btn-set-status" data-status="Ongoing" style="margin-top: var(--space-2);">
                        <span>↩ Return to Agent (Reopen for Rework)</span>
                      </button>
                    ` : `
                      <button id="btn-manager-action-close" class="btn btn-danger-soft btn-block" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;">
                        <span>🛡️ Manager Close & Resolve Task</span>
                      </button>
                      ${isOpen ? `
                        <button class="btn btn-primary-outline btn-block btn-set-status" data-status="Ongoing" style="margin-top: var(--space-2);">
                          <span>Dispatch to Ongoing</span>
                        </button>
                      ` : ''}
                    `}
                  `}
                ` : `
                  <!-- Agent Controls -->
                  ${canEditProgress ? `
                    ${isOpen ? `
                      <button class="btn btn-primary btn-block btn-set-status" data-status="Ongoing">
                        <span>▶ Start Work (Move to Ongoing)</span>
                      </button>
                    ` : ''}

                    ${isOngoing ? `
                      <button class="btn btn-purple btn-block btn-set-status" data-status="In Review" id="btn-submit-review">
                        <span>📋 Submit for Manager Review</span>
                      </button>
                      <div style="font-size: 11px; color: var(--color-text-secondary); text-align: center; margin-top: 6px;">
                        ⚠️ Once submitted, work is locked and cannot be undone by agents.
                      </div>
                    ` : ''}

                    ${isInReview ? `
                      <div style="padding: 16px; background: rgba(168, 85, 247, 0.12); border: 1px dashed var(--color-purple); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 1.5rem; margin-bottom: 6px;">⏳</div>
                        <div style="font-size: var(--text-sm); font-weight: 700; color: var(--color-purple);">Submitted for Manager Review</div>
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">
                          Locked in review &mdash; cannot be undone or altered by agents. Awaiting Manager Sarah to verify and close.
                        </div>
                      </div>
                    ` : ''}

                    ${isClosed ? `
                      <div class="resolved-banner">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Task completed & closed.</span>
                      </div>
                    ` : ''}
                  ` : `
                    <div style="padding: 12px; border: 1px dashed var(--color-border); border-radius: var(--radius-md); text-align: center; font-size: var(--text-xs); color: var(--color-text-secondary);">
                      ${isInReview ? `
                        <div style="color: var(--color-purple); font-weight: 600;">⏳ In Manager Review</div>
                        <div style="font-size: 10px; margin-top: 2px;">Assigned to ${task.assignee ? task.assignee.name : 'Agent'}</div>
                      ` : `
                        🔒 Read-Only (Assigned to ${task.assignee ? task.assignee.name : 'another agent'})
                      `}
                    </div>
                  `}
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
                  ${!canEditProgress ? `
                    <div class="progress-lock-banner" style="display: flex; align-items: center; gap: 8px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; margin-bottom: 8px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span>Progress is locked. Only assigned agent (<strong>${(task.assignee && task.assignee.name) ? task.assignee.name : (task.assignee || 'Assigned Agent')}</strong>) can update progress and work status.</span>
                    </div>
                  ` : ''}
                  <label for="input-task-progress-slider" style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-bottom: 4px;">Adjust Progress Slider:</label>
                  <input type="range" id="input-task-progress-slider" min="0" max="100" step="5" value="${task.progress}" ${!canEditProgress ? 'disabled' : ''} style="width: 100%; cursor: ${canEditProgress ? 'pointer' : 'not-allowed'}; opacity: ${canEditProgress ? '1' : '0.45'}; accent-color: var(--color-cyan);">
                  <div style="display: flex; justify-content: space-between; gap: 4px; margin-top: 6px;">
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" ${!canEditProgress ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} data-prog="0">0%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" ${!canEditProgress ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} data-prog="25">25%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" ${!canEditProgress ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} data-prog="50">50%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" ${!canEditProgress ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} data-prog="75">75%</button>
                    <button type="button" class="btn btn-xs btn-outline btn-quick-prog" ${!canEditProgress ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} data-prog="100">100%</button>
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
    const canEditProgress = store.canEditTaskProgress(task);
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
    // Wire Manager Force Close Button
    const btnMgrCloses = container.querySelectorAll('#btn-manager-force-close, #btn-manager-action-close');
    if (btnMgrCloses && btnMgrCloses.length > 0) {
      btnMgrCloses.forEach(btnMgrClose => {
      btnMgrClose.addEventListener('click', () => {
        const note = prompt('Enter manager resolution remarks:', 'Task closed and resolved by Operations Manager.');
        if (note !== null) {
          store.managerCloseTask(task.id, note.trim());
          toast.show('Task ' + task.id + ' successfully closed by Manager.', 'success');
          render();
        }
      });
      });
    }

    const slider = container.querySelector('#input-task-progress-slider');
    const progDisplay = container.querySelector('#progress-val-display');
    if (slider && canEditProgress) {
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
    if (canEditProgress) container.querySelectorAll('.btn-quick-prog').forEach(btn => {
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
  const s = (status || '').toLowerCase();
  if (s === 'open') return 0;
  if (s === 'ongoing' || s.includes('progress')) return 1;
  if (s.includes('review')) return 2;
  if (s === 'closed' || s === 'completed' || s === 'resolved') return 3;
  return 0;
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