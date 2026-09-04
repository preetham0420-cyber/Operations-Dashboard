/**
 * Notifications Center View
 * Clean, modern, easy-to-scan layout with clear separation between unread and read alerts
 */

import { store } from '../services/store.js';
import { navigation } from '../components/navigation.js';
import { toast } from '../components/toast.js';

export function renderNotificationsView(container) {
  let activeTab = 'all'; // 'all', 'unread', 'read'

  function render() {
    const allNotifs = store.getNotifications();
    const unreadList = allNotifs.filter(n => !n.read);
    const readList = allNotifs.filter(n => n.read);
    const unreadTotal = unreadList.length;

    container.innerHTML = `
      <div class="view-content-wrapper">
        <!-- Page Header -->
        <div class="view-header-row">
          <div>
            <span class="view-subtitle">COMMUNICATIONS & UPDATES</span>
            <h1 class="view-title">Notifications</h1>
          </div>
          <div class="view-header-actions">
            ${unreadTotal > 0 ? `
              <button class="btn btn-sm btn-outline" id="btn-mark-all-read">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Mark All as Read (${unreadTotal})</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Clean Filter Tabs -->
        <div class="notif-filter-tabs">
          <button class="notif-tab ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
            All (${allNotifs.length})
          </button>
          <button class="notif-tab ${activeTab === 'unread' ? 'active' : ''}" data-tab="unread">
            Unread (${unreadTotal})
          </button>
          <button class="notif-tab ${activeTab === 'read' ? 'active' : ''}" data-tab="read">
            Read (${readList.length})
          </button>
        </div>

        <!-- Notification Content Area -->
        <div class="notifs-feed-wrapper">
          ${allNotifs.length === 0 ? `
            <div class="card empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <h3 class="empty-state-title">No Notifications</h3>
              <p class="empty-state-text">You have no notifications in your inbox.</p>
            </div>
          ` : `
            ${(activeTab === 'all' || activeTab === 'unread') && unreadList.length > 0 ? `
              <div class="notif-section-block">
                <div class="notif-section-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="notif-status-dot unread"></span>
                    <span class="notif-section-title">Unread Notifications</span>
                  </div>
                  <span class="badge badge-xs badge-cyan">${unreadList.length} unread</span>
                </div>
                <div class="notif-clean-list">
                  ${unreadList.map(n => renderNotificationItem(n)).join('')}
                </div>
              </div>
            ` : ''}

            ${activeTab === 'unread' && unreadList.length === 0 ? `
              <div class="card empty-state" style="padding: var(--space-6);">
                <p class="text-muted text-sm">All notifications have been read.</p>
              </div>
            ` : ''}

            ${(activeTab === 'all' || activeTab === 'read') && readList.length > 0 ? `
              <div class="notif-section-block" style="${(activeTab === 'all' && unreadList.length > 0) ? 'margin-top: var(--space-5);' : ''}">
                <div class="notif-section-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="notif-status-dot read"></span>
                    <span class="notif-section-title text-muted">Earlier Notifications</span>
                  </div>
                  <span class="badge badge-xs badge-neutral">${readList.length} read</span>
                </div>
                <div class="notif-clean-list">
                  ${readList.map(n => renderNotificationItem(n)).join('')}
                </div>
              </div>
            ` : ''}

            ${activeTab === 'read' && readList.length === 0 ? `
              <div class="card empty-state" style="padding: var(--space-6);">
                <p class="text-muted text-sm">No read notifications yet.</p>
              </div>
            ` : ''}
          `}
        </div>
      </div>
    `;

    attachListeners();
  }

  function renderNotificationItem(n) {
    const isUnread = !n.read;
    return `
      <div class="notif-item-card ${isUnread ? 'is-unread' : 'is-read'}" data-notif-id="${n.id}">
        <div class="notif-item-indicator">
          <span class="notif-dot-marker ${isUnread ? 'dot-cyan' : 'dot-muted'}"></span>
        </div>

        <div class="notif-item-content">
          <div class="notif-item-topbar">
            <div class="notif-title-row">
              <span class="notif-item-title ${isUnread ? 'font-semibold' : ''}">${n.title}</span>
              ${isUnread ? `<span class="badge badge-xs badge-cyan">New</span>` : ''}
              <span class="badge badge-xs ${getPriorityBadgeClass(n.priority || 'Medium')}">${n.priority || 'Normal'}</span>
            </div>
            <span class="notif-item-time font-mono text-muted text-xs">${formatTimeAgo(n.timestamp)}</span>
          </div>

          <p class="notif-item-message">${n.message}</p>

          <div class="notif-item-footer">
            <div class="notif-footer-meta">
              ${n.taskId ? `
                <button type="button" class="btn-link font-mono text-xs btn-goto-task" data-task-id="${n.taskId}">
                  <span>View ${n.taskId} &rarr;</span>
                </button>
              ` : ''}
            </div>

            <div class="notif-footer-actions">
              <button type="button" class="btn-link text-xs btn-toggle-read" data-notif-id="${n.id}">
                ${isUnread ? 'Mark as read' : 'Mark as unread'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function attachListeners() {
    // Tab switching
    container.querySelectorAll('.notif-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.getAttribute('data-tab');
        render();
      });
    });

    // Mark all as read
    const markAllBtn = container.querySelector('#btn-mark-all-read');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        store.markAllNotificationsAsRead();
        toast.show({
          title: "Updated",
          message: "All notifications marked as read.",
          type: "success"
        });
        render();
      });
    }

    // Toggle single read status
    container.querySelectorAll('.btn-toggle-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-notif-id');
        store.toggleNotificationRead(id);
        render();
      });
    });

    // Go to linked task (routes to Tasks view with search filter)
    container.querySelectorAll('.btn-goto-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.getAttribute('data-task-id');
        navigation.navigate('tasks', { search: taskId });
      });
    });
  }

  render();
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'High': return 'badge-amber';
    case 'Medium': return 'badge-cyan';
    case 'Low': return 'badge-neutral';
    default: return 'badge-neutral';
  }
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
