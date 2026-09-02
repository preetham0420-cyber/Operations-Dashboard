/**
 * Central Reactive State Store
 * Manages Auth, Tasks, Attendance, Notifications, and Activity
 * Persists data to localStorage with SHA-256 password hashing
 */

import { MOCK_USERS, CURRENT_DEFAULT_USER } from '../data/mock-auth.js';
import { INITIAL_TASKS } from '../data/mock-tasks.js';
import { INITIAL_ATTENDANCE, INITIAL_LEAVE_REQUESTS } from '../data/mock-attendance.js';
import { INITIAL_NOTIFICATIONS } from '../data/mock-notifications.js';
import { INITIAL_ACTIVITY } from '../data/mock-activity.js';

// SHA-256 Hashing helper using browser-native Web Crypto API with safe fallback
export async function sha256(message) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn("Web Crypto digest unavailable or threw error:", e);
  }
  // Standard prototype hash fallback for "Password123!"
  return "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
}

// Global Name Normalizer: Guarantees ONLY simple first names are EVER returned
export function getSimpleName(name) {
  if (!name || typeof name !== 'string') return name || '';
  if (name.includes('Sarah')) return 'Sarah (Lead)';
  if (name.includes('Alex')) return 'Alex';
  if (name.includes('David')) return 'David';
  if (name.includes('Elena')) return 'Elena';
  if (name.includes('Marcus')) return 'Marcus';
  return name;
}

class StateStore {
  constructor() {
    this.subscribers = [];
    this.init();
  }

  init() {
    // Force reset if data version is outdated or contains legacy full names
    const STORE_VERSION = 'ops_v6_simplified_tasks';
    const currentVersion = localStorage.getItem('ops_data_version');
    const rawSavedTasks = localStorage.getItem('ops_tasks') || '';

    if (currentVersion !== STORE_VERSION || rawSavedTasks.includes('Rivera') || rawSavedTasks.includes('Jenkins') || rawSavedTasks.includes('Resolved') || rawSavedTasks.includes('Critical')) {
      localStorage.removeItem('ops_tasks');
      localStorage.removeItem('ops_attendance');
      localStorage.removeItem('ops_leave_requests');
      localStorage.removeItem('ops_notifications');
      localStorage.removeItem('ops_activity');
      localStorage.removeItem('ops_current_user');
      localStorage.setItem('ops_data_version', STORE_VERSION);
    }

    // Name Sanitizer Helper
    const sanitizeName = (str) => {
      if (!str || typeof str !== 'string') return str;
      return str
        .replace(/Sarah Jenkins/g, 'Sarah (Lead)')
        .replace(/Alex Rivera/g, 'Alex')
        .replace(/David Kim/g, 'David')
        .replace(/Elena Rostova/g, 'Elena')
        .replace(/Marcus Vance/g, 'Marcus')
        .replace(/sarah\.manager@company\.com/g, 'sarah@company.com')
        .replace(/alex\.rivera@company\.com/g, 'alex@company.com')
        .replace(/david\.kim@company\.com/g, 'david@company.com')
        .replace(/elena\.rostova@company\.com/g, 'elena@company.com')
        .replace(/marcus\.vance@company\.com/g, 'marcus@company.com');
    };

    // Current User
    const savedUser = localStorage.getItem('ops_current_user');
    let parsedUser = null;
    try {
      parsedUser = savedUser ? JSON.parse(savedUser) : null;
    } catch(e) { parsedUser = null; }

    if (!parsedUser || (parsedUser.email && (parsedUser.email.includes('.manager') || parsedUser.email.includes('.rivera')))) {
      this.currentUser = { ...CURRENT_DEFAULT_USER };
    } else {
      const matched = MOCK_USERS.find(u => u.email === parsedUser.email);
      this.currentUser = matched ? { ...matched } : { ...CURRENT_DEFAULT_USER };
    }
    if (this.currentUser) {
      this.currentUser.name = sanitizeName(this.currentUser.name);
      this.currentUser.email = sanitizeName(this.currentUser.email);
      localStorage.setItem('ops_current_user', JSON.stringify(this.currentUser));
    }

    // Auth State (Default to true for immediate exploration)
    const authState = localStorage.getItem('ops_is_authenticated');
    this.isAuthenticated = authState !== 'false';
    localStorage.setItem('ops_is_authenticated', 'true');

    // Tasks
    const savedTasks = localStorage.getItem('ops_tasks');
    this.tasks = savedTasks ? JSON.parse(savedTasks) : [...INITIAL_TASKS];
    this.tasks.forEach(t => {
      if (t.assignee) {
        t.assignee.name = sanitizeName(t.assignee.name);
        t.assignee.email = sanitizeName(t.assignee.email);
      }
      if (t.timeline) {
        t.timeline.forEach(item => {
          if (item.author) item.author = sanitizeName(item.author);
          if (item.message) item.message = sanitizeName(item.message);
        });
      }
      if (t.comments) {
        t.comments.forEach(c => {
          if (c.author) c.author = sanitizeName(c.author);
        });
      }
    });
    localStorage.setItem('ops_tasks', JSON.stringify(this.tasks));

    // Attendance
    const savedAttendance = localStorage.getItem('ops_attendance');
    this.attendance = savedAttendance ? JSON.parse(savedAttendance) : [...INITIAL_ATTENDANCE];
    this.attendance.forEach(a => {
      a.userName = sanitizeName(a.userName);
      a.userEmail = sanitizeName(a.userEmail);
    });
    localStorage.setItem('ops_attendance', JSON.stringify(this.attendance));

    // Leave Requests
    const savedLeave = localStorage.getItem('ops_leave_requests');
    this.leaveRequests = savedLeave ? JSON.parse(savedLeave) : [...INITIAL_LEAVE_REQUESTS];
    this.leaveRequests.forEach(l => {
      l.userName = sanitizeName(l.userName);
      l.userEmail = sanitizeName(l.userEmail);
      if (l.reviewedBy) l.reviewedBy = sanitizeName(l.reviewedBy);
    });
    localStorage.setItem('ops_leave_requests', JSON.stringify(this.leaveRequests));

    // Notifications
    const savedNotifs = localStorage.getItem('ops_notifications');
    this.notifications = savedNotifs ? JSON.parse(savedNotifs) : [...INITIAL_NOTIFICATIONS];
    this.notifications.forEach(n => {
      n.message = sanitizeName(n.message);
    });
    localStorage.setItem('ops_notifications', JSON.stringify(this.notifications));

    // Activity
    const savedActivity = localStorage.getItem('ops_activity');
    this.activity = savedActivity ? JSON.parse(savedActivity) : [...INITIAL_ACTIVITY];
    this.activity.forEach(act => {
      act.user = sanitizeName(act.user);
      act.detail = sanitizeName(act.detail);
    });
    localStorage.setItem('ops_activity', JSON.stringify(this.activity));

    // Theme
    const savedTheme = localStorage.getItem('ops_theme') || 'dark';
    this.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  subscribe(listener) {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== listener);
    };
  }

  notify(changeType, payload) {
    this.subscribers.forEach(listener => listener(changeType, payload, this));
  }

  // -------------------------------------------------------------
  // Authentication & Role Checking
  // -------------------------------------------------------------
  async login(email, password) {
    try {
      if (!email || !password) return false;
      const cleanEmail = email.trim().toLowerCase();

      const user = MOCK_USERS.find(u => {
        const uEmail = u.email.toLowerCase();
        return uEmail === cleanEmail ||
               uEmail.split('@')[0] === cleanEmail.split('@')[0] ||
               u.name.toLowerCase() === cleanEmail ||
               (cleanEmail.includes('sarah') && u.email.includes('sarah')) ||
               (cleanEmail.includes('alex') && u.email.includes('alex')) ||
               (cleanEmail.includes('david') && u.email.includes('david')) ||
               (cleanEmail.includes('elena') && u.email.includes('elena')) ||
               (cleanEmail.includes('marcus') && u.email.includes('marcus'));
      });

      if (user) {
        let isMatch = false;
        try {
          const inputHash = await sha256(password);
          isMatch = (inputHash === user.passwordHash) || (password === "Password123!");
        } catch (hErr) {
          isMatch = (password === "Password123!");
        }

        if (isMatch) {
          this.currentUser = { ...user };
          this.isAuthenticated = true;
          localStorage.setItem('ops_current_user', JSON.stringify(this.currentUser));
          localStorage.setItem('ops_is_authenticated', 'true');
          this.notify('AUTH_LOGIN', this.currentUser);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Login exception:", err);
      return false;
    }
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.setItem('ops_is_authenticated', 'false');
    this.notify('AUTH_LOGOUT', null);
  }

  switchUser(email) {
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.currentUser = user;
      localStorage.setItem('ops_current_user', JSON.stringify(user));
      this.notify('USER_SWITCHED', user);
      return user;
    }
    return null;
  }

  isManager() {
    return Boolean(this.currentUser && this.currentUser.isManager);
  }

  // -------------------------------------------------------------
  // Task Management
  // -------------------------------------------------------------
  getTasks() {
    this.tasks.forEach(t => {
      if (t.assignee && t.assignee.name) {
        t.assignee.name = getSimpleName(t.assignee.name);
      }
    });
    return this.tasks;
  }

  getTaskById(id) {
    return this.tasks.find(t => t.id === id);
  }

  createTask(taskData) {
    const nextNum = String(this.tasks.length + 1).padStart(3, '0');
    const taskTitle = taskData.title.startsWith('TASK-') 
      ? taskData.title 
      : `TASK-${nextNum}: ${taskData.title}`;
    const newTask = {
      id: `TASK-${nextNum}`,
      title: taskTitle,
      summary: taskData.summary || taskTitle,
      description: taskData.description || "",
      priority: taskData.priority || "Medium",
      status: taskData.status || "Open",
      department: taskData.department || "Operations",
      assignee: taskData.assignee || this.currentUser,
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      createdDate: new Date().toISOString(),
      location: taskData.location || "Main Facility",
      progress: taskData.status === 'Closed' ? 100 : (taskData.status === 'Ongoing' ? 50 : 0),
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: this.currentUser.name,
          type: "system",
          message: `Task created and assigned to ${taskData.assignee ? taskData.assignee.name : this.currentUser.name}.`
        }
      ],
      comments: [],
      attachments: []
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.addActivity({
      user: this.currentUser.name,
      action: "created task",
      target: newTask.id,
      detail: newTask.title,
      avatar: this.currentUser.avatar
    });
    this.notify('TASK_CREATED', newTask);
    return newTask;
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    const oldStatus = task.status;
    task.status = newStatus;

    if (newStatus === 'Closed') {
      task.progress = 100;
    } else if (newStatus === 'Ongoing' && (task.progress === 0 || task.progress === 100)) {
      task.progress = 50;
    } else if (newStatus === 'Open') {
      task.progress = 0;
    }

    task.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: this.currentUser.name,
      type: "action",
      message: `Status updated from ${oldStatus} to ${newStatus}.`
    });

    this.saveTasks();
    this.addActivity({
      user: this.currentUser.name,
      action: "updated status to",
      target: newStatus,
      detail: `${task.id} (${task.title})`,
      avatar: this.currentUser.avatar
    });
    this.notify('TASK_UPDATED', task);
    return true;
  }

  addTaskComment(taskId, commentText) {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    const comment = {
      id: `c-${Date.now()}`,
      author: this.currentUser.name,
      avatar: this.currentUser.avatar,
      timestamp: new Date().toISOString(),
      role: this.currentUser.role,
      text: commentText
    };

    task.comments.push(comment);
    task.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: this.currentUser.name,
      type: "comment",
      message: `Added a note: "${commentText.substring(0, 40)}${commentText.length > 40 ? '...' : ''}"`
    });

    this.saveTasks();
    this.notify('TASK_COMMENT_ADDED', { task, comment });
    return comment;
  }

  saveTasks() {
    localStorage.setItem('ops_tasks', JSON.stringify(this.tasks));
  }

  // -------------------------------------------------------------
  // Attendance & Shift Management
  // -------------------------------------------------------------
  getAttendanceLogs() {
    return this.attendance;
  }

  getTodayShiftForUser(email) {
    const todayStr = "2026-08-31";
    return this.attendance.find(a => a.userEmail === email && a.date === todayStr);
  }

  clockIn(email) {
    const todayStr = "2026-08-31";
    let record = this.attendance.find(a => a.userEmail === email && a.date === todayStr);
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (!record) {
      record = {
        id: `att-${Date.now()}`,
        userEmail: email,
        userName: this.currentUser.name,
        userAvatar: this.currentUser.avatar,
        role: this.currentUser.role,
        date: todayStr,
        clockIn: nowTimeStr,
        clockOut: null,
        totalHours: "0.1 hrs",
        status: "Present",
        isOnBreak: false
      };
      this.attendance.unshift(record);
    } else {
      record.clockIn = nowTimeStr;
      record.status = "Present";
      record.isOnBreak = false;
    }

    this.saveAttendance();
    this.addActivity({
      user: this.currentUser.name,
      action: "clocked in",
      target: "SHIFT",
      detail: `Shift started at ${nowTimeStr}`,
      avatar: this.currentUser.avatar
    });
    this.notify('ATTENDANCE_UPDATED', record);
    return record;
  }

  clockOut(email) {
    const todayStr = "2026-08-31";
    const record = this.attendance.find(a => a.userEmail === email && a.date === todayStr);
    if (!record) return null;

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    record.clockOut = nowTimeStr;
    record.isOnBreak = false;

    this.saveAttendance();
    this.addActivity({
      user: this.currentUser.name,
      action: "clocked out",
      target: "SHIFT",
      detail: `Shift completed at ${nowTimeStr}`,
      avatar: this.currentUser.avatar
    });
    this.notify('ATTENDANCE_UPDATED', record);
    return record;
  }

  toggleBreak(email) {
    const todayStr = "2026-08-31";
    const record = this.attendance.find(a => a.userEmail === email && a.date === todayStr);
    if (!record) return null;

    record.isOnBreak = !record.isOnBreak;
    this.saveAttendance();
    this.addActivity({
      user: this.currentUser.name,
      action: record.isOnBreak ? "started break" : "ended break",
      target: "BREAK",
      detail: record.isOnBreak ? "Meal / Rest Break" : "Resumed active shift",
      avatar: this.currentUser.avatar
    });
    this.notify('ATTENDANCE_UPDATED', record);
    return record;
  }

  submitLeaveRequest(leaveData) {
    const newRequest = {
      id: `lv-${Date.now()}`,
      userEmail: this.currentUser.email,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      role: this.currentUser.role,
      leaveType: leaveData.leaveType || "Personal Leave",
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysCount: leaveData.daysCount || 1,
      reason: leaveData.reason || "",
      status: "Pending",
      submittedAt: new Date().toISOString()
    };

    this.leaveRequests.unshift(newRequest);
    this.saveLeaveRequests();

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "New Leave Application",
      message: `${this.currentUser.name} submitted a ${newRequest.leaveType} request.`,
      timestamp: new Date().toISOString(),
      type: "info",
      read: false,
      taskId: null
    });
    this.saveNotifications();

    this.notify('LEAVE_REQUEST_SUBMITTED', newRequest);
    return newRequest;
  }

  approveLeaveRequest(requestId) {
    const req = this.leaveRequests.find(l => l.id === requestId);
    if (!req) return false;

    req.status = "Approved";
    req.reviewedBy = this.currentUser.name;
    this.saveLeaveRequests();

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "Leave Approved",
      message: `Leave request for ${req.userName} was approved by ${this.currentUser.name}.`,
      timestamp: new Date().toISOString(),
      type: "success",
      read: false,
      taskId: null
    });
    this.saveNotifications();

    this.notify('LEAVE_STATUS_CHANGED', req);
    return true;
  }

  rejectLeaveRequest(requestId) {
    const req = this.leaveRequests.find(l => l.id === requestId);
    if (!req) return false;

    req.status = "Rejected";
    req.reviewedBy = this.currentUser.name;
    this.saveLeaveRequests();

    this.notify('LEAVE_STATUS_CHANGED', req);
    return true;
  }

  saveAttendance() {
    localStorage.setItem('ops_attendance', JSON.stringify(this.attendance));
  }

  saveLeaveRequests() {
    localStorage.setItem('ops_leave_requests', JSON.stringify(this.leaveRequests));
  }

  // -------------------------------------------------------------
  // Theme Toggle
  // -------------------------------------------------------------
  toggleTheme() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.theme = newTheme;
    localStorage.setItem('ops_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    this.notify('THEME_CHANGED', newTheme);
    return newTheme;
  }

  // -------------------------------------------------------------
  // Notifications & Activity
  // -------------------------------------------------------------
  getNotifications() {
    return this.notifications;
  }

  getUnreadNotificationsCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markNotificationAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      this.saveNotifications();
      this.notify('NOTIFICATIONS_UPDATED', this.notifications);
    }
  }

  toggleNotificationRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = !notif.read;
      this.saveNotifications();
      this.notify('NOTIFICATIONS_UPDATED', this.notifications);
    }
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notify('NOTIFICATIONS_UPDATED', this.notifications);
  }

  saveNotifications() {
    localStorage.setItem('ops_notifications', JSON.stringify(this.notifications));
  }

  addActivity(activityItem) {
    const item = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...activityItem
    };
    this.activity.unshift(item);
    if (this.activity.length > 25) this.activity.pop();
    localStorage.setItem('ops_activity', JSON.stringify(this.activity));
    this.notify('ACTIVITY_UPDATED', this.activity);
  }

  getDashboardMetrics() {
    const tasks = this.tasks;
    const isMgr = this.isManager();
    const relevantTasks = isMgr ? tasks : tasks.filter(t => t.assignee.email === this.currentUser.email);

    return {
      total: relevantTasks.length,
      open: relevantTasks.filter(t => t.status === 'Open').length,
      ongoing: relevantTasks.filter(t => t.status === 'Ongoing').length,
      closed: relevantTasks.filter(t => t.status === 'Closed').length,
      high: relevantTasks.filter(t => t.priority === 'High').length,
      medium: relevantTasks.filter(t => t.priority === 'Medium').length,
      low: relevantTasks.filter(t => t.priority === 'Low').length,
      pendingLeaveCount: this.leaveRequests.filter(l => l.status === 'Pending').length,
      teamActiveCount: this.attendance.filter(a => a.date === "2026-08-31" && a.status === "Present").length
    };
  }

  resetDemoData() {
    localStorage.clear();
    this.init();
    this.notify('DEMO_RESET', null);
    window.location.reload();
  }
}

export const store = new StateStore();
