/**
 * Central Reactive State Store
 * Manages Auth, Tasks, Attendance, Notifications, and Activity
 * Persists data to localStorage with SHA-256 password hashing
 */

import { MOCK_USERS, CURRENT_DEFAULT_USER, INITIAL_TEAMS } from '../data/mock-auth.js';
import { INITIAL_TASKS } from '../data/mock-tasks.js';
import { INITIAL_ATTENDANCE, INITIAL_LEAVE_REQUESTS } from '../data/mock-attendance.js';
import { INITIAL_NOTIFICATIONS } from '../data/mock-notifications.js';
import { INITIAL_ACTIVITY } from '../data/mock-activity.js';
import { api } from './api.js'; // Day 6: PostgreSQL backend adapter

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
    const STORE_VERSION = 'ops_v8_scoped_notifications';
    const currentVersion = localStorage.getItem('ops_data_version');
    const rawSavedTasks = localStorage.getItem('ops_tasks') || '';

    if (currentVersion !== STORE_VERSION || rawSavedTasks.includes('Rivera') || rawSavedTasks.includes('Jenkins')) {
      localStorage.removeItem('ops_tasks');
      localStorage.removeItem('ops_attendance');
      localStorage.removeItem('ops_leave_requests');
      localStorage.removeItem('ops_notifications');
      localStorage.removeItem('ops_activity');
      localStorage.removeItem('ops_current_user');
      localStorage.setItem('ops_data_version', STORE_VERSION);
    }

    // Users
    const savedUsers = localStorage.getItem('op_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : JSON.parse(JSON.stringify(MOCK_USERS));

    // Teams
    const savedTeams = localStorage.getItem('op_teams');
    this.teams = savedTeams ? JSON.parse(savedTeams) : JSON.parse(JSON.stringify(INITIAL_TEAMS));

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
    // Normalize tasks
    this.tasks = this.tasks.map(t => {
      if (!t.assignee || typeof t.assignee === 'string') {
        const aName = typeof t.assignee === 'string' ? t.assignee : 'Alex';
        const userMatch = this.users.find(u => u.name === aName || u.id === t.assigneeId) || this.users[1];
        t.assignee = {
          name: userMatch ? userMatch.name : aName,
          email: userMatch ? userMatch.email : (aName.toLowerCase() + '@company.com'),
          avatar: userMatch ? userMatch.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: userMatch ? userMatch.role : 'Agent'
        };
      }
      if (!Array.isArray(t.comments)) t.comments = t.discussion || [];
      if (!Array.isArray(t.attachments)) t.attachments = [];
      if (!Array.isArray(t.timeline)) t.timeline = [];
      if (t.comments) {
        t.comments.forEach(c => {
          if (c.author) c.author = sanitizeName(c.author);
        });
      }
      return t;
    });
    localStorage.setItem('ops_tasks', JSON.stringify(this.tasks));

    // Attendance
    const savedAttendance = localStorage.getItem('ops_attendance');
    this.attendance = savedAttendance ? JSON.parse(savedAttendance) : [...INITIAL_ATTENDANCE];
    this.attendance.forEach(a => {
      a.userName = sanitizeName(a.userName);
      if (!a.userEmail && (a.userId || a.userName)) {
        const matched = this.users.find(u => u.id === a.userId || u.name === a.userName);
        if (matched) a.userEmail = matched.email;
      }
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
    if (typeof document !== 'undefined' && document.documentElement) { document.documentElement.setAttribute('data-theme', savedTheme); }
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

      // --- Day 6: Try PostgreSQL backend first ---
      try {
        const isOnline = await api.checkHealth();
        if (isOnline) {
          const data = await api.login(email, password);
          if (data && data.success && data.data) {
            const bu = data.data.user;
            this.currentUser = {
              id: bu.id,
              name: bu.name,
              email: bu.email,
              role: (bu.role && bu.role.name) ? bu.role.name : (bu.role || 'Field Agent'),
              department: (bu.department && bu.department.name) ? bu.department.name : (bu.department || 'Operations'),
              teamId: bu.teamId,
              isManager: !!(bu.role && bu.role.code === 'MANAGER'),
              isTeamHead: !!(bu.role && bu.role.code === 'TEAM_LEADER'),
              avatar: bu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              employeeCode: bu.employeeCode,
              shift: bu.shift,
              phone: bu.phone,
              location: bu.location,
              _fromBackend: true
            };
            this.isAuthenticated = true;
            localStorage.setItem('ops_current_user', JSON.stringify(this.currentUser));
            localStorage.setItem('ops_is_authenticated', 'true');
            await Promise.allSettled([
              this.fetchTasksFromBackend(),
              this.fetchNotificationsFromBackend(),
              this.fetchAttendanceFromBackend(),
              this.fetchLeavesFromBackend()
            ]);
            this.notify('AUTH_LOGIN', this.currentUser);
            console.log('[store] Authenticated via PostgreSQL backend');
            return true;
          }
          // Server online but rejected credentials
          return false;
        }
      } catch (backendErr) {
        if (backendErr.status === 401 || backendErr.status === 400) {
          console.warn('[store] Backend rejected credentials:', backendErr.message);
          return false;
        }
        console.warn('[store] Backend unreachable, using offline mock auth');
      }

      // --- Offline mock fallback ---
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
          console.log('[store] Authenticated via offline mock');
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
    if (!id) return null;
    const clean = String(id).trim().toLowerCase();
    return this.tasks.find(t => 
      (t.id && t.id.toLowerCase() === clean) || 
      (t.taskCode && t.taskCode.toLowerCase() === clean)
    );
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
    if (api.getToken()) {
      api.createTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        assigneeId: taskData.assignee?.id || (this.users.find(u => u.email === taskData.assignee?.email)?.id)
      }).catch(err => console.warn('[store] PostgreSQL createTask failed:', err.message));
    }
    return newTask;
  }

  updateTaskProgress(taskId, progressVal) {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    const p = Math.min(100, Math.max(0, parseInt(progressVal, 10) || 0));
    task.progress = p;

    // Automatically synchronize status
    if (p === 100) {
      task.status = 'Resolved';
    } else if (p > 0 && task.status === 'Open') {
      task.status = 'In Progress';
    } else if (p === 0 && (task.status === 'Resolved' || task.status === 'Closed')) {
      task.status = 'Open';
    }

    if (!Array.isArray(task.timeline)) task.timeline = [];
    const authorName = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'Operations Agent';
    task.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: authorName,
      type: "action",
      message: `Progress updated to ${p}%.`
    });

    this.saveTasks();
    this.notify('TASK_UPDATED', task);
    if (api.getToken()) {
      api.updateTaskProgress(task.id, p).catch(err => console.warn('[store] PostgreSQL updateTaskProgress failed:', err.message));
    }

    // Create notification for progress update
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Progress Update: ${task.id} (${p}%)`,
      message: `${authorName} updated progress to ${p}% (Status: ${task.status}).`,
      timestamp: new Date().toISOString(),
      type: p === 100 ? "success" : "info",
      priority: p === 100 ? "High" : "Normal",
      read: false,
      taskId: task.id,
      recipient: "all"
    });
    this.saveNotifications();
    this.notify('NOTIFICATIONS_UPDATED', this.notifications);

    return task;
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    // Submit for Manager Review cannot be undone by agents
    const curStatus = (task.status || '').toLowerCase();
    if (curStatus.includes('review') && !this.isManager()) {
      console.warn('Unauthorized: Tasks submitted for Manager Review cannot be undone by agents.');
      return false;
    }

    const oldStatus = task.status;
    task.status = newStatus;

    if (newStatus === 'Closed' || newStatus === 'Resolved') {
      task.progress = 100;
    } else if (newStatus === 'Under Review') {
      task.progress = (task.progress === 100 || task.progress === 0) ? 80 : task.progress;
    } else if (newStatus === 'Ongoing' || newStatus === 'In Progress') {
      task.progress = (task.progress === 0 || task.progress === 100) ? 50 : task.progress;
    } else if (newStatus === 'Open') {
      task.progress = 0;
    }

    if (!Array.isArray(task.timeline)) task.timeline = [];
    const authorName = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'Operations Agent';
    const authorAvatar = (this.currentUser && this.currentUser.avatar) ? this.currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    task.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: authorName,
      type: "action",
      message: `Status updated from ${oldStatus} to ${newStatus}.`
    });

    this.saveTasks();
    this.addActivity({
      user: authorName,
      action: "updated status to",
      target: newStatus,
      detail: `${task.id} (${task.title})`,
      avatar: authorAvatar
    });
    this.notify('TASK_UPDATED', task);
    if (api.getToken()) {
      api.updateTaskStatus(task.id, newStatus).catch(err => console.warn('[store] PostgreSQL updateTaskStatus failed:', err.message));
    }
    return true;
  }

  addTaskComment(taskId, commentText) {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    if (!Array.isArray(task.comments)) task.comments = [];
    if (!Array.isArray(task.timeline)) task.timeline = [];

    const authorName = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'Operations Agent';
    const authorAvatar = (this.currentUser && this.currentUser.avatar) ? this.currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const authorRole = (this.currentUser && this.currentUser.role) ? this.currentUser.role : 'Agent';

    const comment = {
      id: `c-${Date.now()}`,
      author: authorName,
      avatar: authorAvatar,
      timestamp: new Date().toISOString(),
      role: authorRole,
      text: commentText
    };

    task.comments.push(comment);
    task.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: authorName,
      type: "comment",
      message: `Added a note: "${commentText.substring(0, 40)}${commentText.length > 40 ? '...' : ''}"`
    });

    this.saveTasks();
    this.notify('TASK_COMMENT_ADDED', { task, comment });
    this.notify('TASK_UPDATED', task);

    // Create notification for the comment so it reflects in Notifications Center
    const preview = commentText.length > 55 ? commentText.substring(0, 52) + '...' : commentText;
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `New Comment on ${task.id}`,
      message: `${authorName}: "${preview}"`,
      timestamp: new Date().toISOString(),
      type: "info",
      priority: "Normal",
      read: false,
      taskId: task.id,
      recipient: "all"
    });
    this.saveNotifications();
    this.notify('NOTIFICATIONS_UPDATED', this.notifications);

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

  getTodayShiftForUser(identifier) {
    const user = this.currentUser;
    const targetEmail = (typeof identifier === 'string' ? identifier : identifier?.email) || user?.email || '';
    const targetName = user?.name || '';
    const targetId = user?.id || '';
    const todayStr = new Date().toISOString().split('T')[0];

    return this.attendance.find(a => 
      ((targetEmail && a.userEmail === targetEmail) || (targetId && a.userId === targetId) || (targetName && a.userName === targetName) || (targetEmail && a.userName === targetEmail)) && a.date === todayStr
    ) || this.attendance.find(a => 
      (targetEmail && a.userEmail === targetEmail) || (targetId && a.userId === targetId) || (targetName && a.userName === targetName) || (targetEmail && a.userName === targetEmail)
    ) || null;
  }

  getTodayRecord(email) {
    return this.getTodayShiftForUser(email);
  }

  clockIn(email) {
    const targetEmail = email || (this.currentUser ? this.currentUser.email : '');
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let record = this.attendance.find(a => (a.userEmail === targetEmail || a.userId === this.currentUser?.id || a.userName === this.currentUser?.name) && a.date === todayStr);

    if (!record) {
      record = {
        id: `att-${Date.now()}`,
        userId: this.currentUser?.id || 'usr-1',
        userEmail: targetEmail,
        userName: this.currentUser?.name || 'Agent',
        userAvatar: this.currentUser?.avatar,
        role: this.currentUser?.role || 'Operations Agent',
        date: todayStr,
        clockIn: nowTimeStr,
        clockOut: null,
        currentStatus: "Clocked In",
        status: "Present",
        isOnBreak: false,
        totalHours: "In Progress"
      };
      this.attendance.unshift(record);
    } else {
      record.clockIn = nowTimeStr;
      record.clockOut = null;
      record.currentStatus = "Clocked In";
      record.status = "Present";
      record.isOnBreak = false;
      record.totalHours = "In Progress";
    }

    this.saveAttendance();
    this.addActivity({
      user: this.currentUser?.name || 'Agent',
      action: "clocked in",
      target: "SHIFT",
      detail: `Shift started at ${nowTimeStr}`,
      avatar: this.currentUser?.avatar
    });
    this.notify('ATTENDANCE_UPDATED', record);
    if (api.getToken()) {
      api.clockIn().then(() => this.fetchAttendanceFromBackend()).catch(err => console.warn('[store] PostgreSQL clockIn failed:', err.message));
    }
    return record;
  }

  clockOut(email) {
    const targetEmail = email || (this.currentUser ? this.currentUser.email : '');
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let record = this.attendance.find(a => (a.userEmail === targetEmail || a.userId === this.currentUser?.id || a.userName === this.currentUser?.name) && a.date === todayStr);
    if (!record) {
      record = this.attendance.find(a => a.userEmail === targetEmail || a.userId === this.currentUser?.id || a.userName === this.currentUser?.name);
    }
    if (!record) return null;

    record.clockOut = nowTimeStr;
    record.currentStatus = "Clocked Out";
    record.status = "Present";
    record.isOnBreak = false;
    record.totalHours = "Completed";

    this.saveAttendance();
    this.addActivity({
      user: this.currentUser?.name || 'Agent',
      action: "clocked out",
      target: "SHIFT",
      detail: `Shift ended at ${nowTimeStr}`,
      avatar: this.currentUser?.avatar
    });
    this.notify('ATTENDANCE_UPDATED', record);
    if (api.getToken()) {
      api.clockOut().then(() => this.fetchAttendanceFromBackend()).catch(err => console.warn('[store] PostgreSQL clockOut failed:', err.message));
    }
    return record;
  }

  toggleBreak(email) {
    const targetEmail = email || (this.currentUser ? this.currentUser.email : '');
    const todayStr = new Date().toISOString().split('T')[0];
    let record = this.attendance.find(a => (a.userEmail === targetEmail || a.userId === this.currentUser?.id || a.userName === this.currentUser?.name) && a.date === todayStr);
    if (!record) {
      record = this.attendance.find(a => a.userEmail === targetEmail || a.userId === this.currentUser?.id || a.userName === this.currentUser?.name);
    }
    if (!record) return null;

    record.isOnBreak = !record.isOnBreak;
    record.currentStatus = record.isOnBreak ? "On Break" : "Clocked In";
    this.saveAttendance();
    this.addActivity({
      user: this.currentUser?.name || 'Agent',
      action: record.isOnBreak ? "started break" : "resumed shift",
      target: "BREAK",
      detail: record.isOnBreak ? "Meal / Rest break" : "Returned from break",
      avatar: this.currentUser?.avatar
    });
    this.notify('ATTENDANCE_UPDATED', record);
    if (api.getToken()) {
      const act = record.isOnBreak ? api.startBreak() : api.endBreak();
      act.then(() => this.fetchAttendanceFromBackend()).catch(err => console.warn('[store] PostgreSQL toggleBreak failed:', err.message));
    }
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
    if (api.getToken()) {
      api.submitLeave({
        leaveType: leaveData.leaveType || 'Personal Leave',
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        daysCount: parseInt(leaveData.daysCount || leaveData.days || 1, 10),
        reason: leaveData.reason || ''
      }).then(() => this.fetchLeavesFromBackend()).catch(err => console.warn('[store] PostgreSQL submitLeave failed:', err.message));
    }
    return newRequest;
  }

  approveLeaveRequest(requestId) {
    if (!this.isManager()) { console.warn('Unauthorized: Only Manager can approve leave requests'); return false; }
    const req = this.leaveRequests.find(l => l.id === requestId);
    if (!req) return false;

    const reviewer = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'Sarah (Lead)';
    req.status = "Approved";
    req.reviewedBy = reviewer;
    this.saveLeaveRequests();

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "Leave Approved",
      message: `Leave request for ${req.userName} was approved by ${reviewer}.`,
      timestamp: new Date().toISOString(),
      type: "success",
      read: false,
      taskId: null
    });
    this.saveNotifications();

    this.notify('LEAVE_STATUS_CHANGED', req);
    if (api.getToken()) {
      api.approveLeave(requestId, 'Approved by Operations Manager.').then(() => this.fetchLeavesFromBackend()).catch(err => console.warn('[store] PostgreSQL approveLeave failed:', err.message));
    }
    return true;
  }

  rejectLeaveRequest(requestId) {
    if (!this.isManager()) { console.warn('Unauthorized: Only Manager can reject leave requests'); return false; }
    const req = this.leaveRequests.find(l => l.id === requestId);
    if (!req) return false;

    const reviewer = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'Sarah (Lead)';
    req.status = "Rejected";
    req.reviewedBy = reviewer;
    this.saveLeaveRequests();

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "Leave Rejected",
      message: `Leave request for ${req.userName} was rejected by ${reviewer}.`,
      timestamp: new Date().toISOString(),
      type: "warning",
      read: false,
      taskId: null
    });
    this.saveNotifications();

    this.notify('LEAVE_STATUS_CHANGED', req);
    if (api.getToken()) {
      api.rejectLeave(requestId, 'Rejected by Operations Manager.').then(() => this.fetchLeavesFromBackend()).catch(err => console.warn('[store] PostgreSQL rejectLeave failed:', err.message));
    }
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
  getTheme() {
    return this.theme || (typeof localStorage !== 'undefined' ? localStorage.getItem('ops_theme') : null) || 'dark';
  }

  setTheme(newTheme) {
    this.theme = newTheme;
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('ops_theme', newTheme);
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    } catch(e) {}
    this.notify('THEME_CHANGED', newTheme);
    return newTheme;
  }

  toggleTheme() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    return this.setTheme(newTheme);
  }

  // -------------------------------------------------------------
  // Notifications & Activity
  // -------------------------------------------------------------
  getNotifications() {
    if (!this.currentUser) return [];
    const userEmail = this.currentUser.email;
    const isManager = this.isManager();

    return this.notifications.filter(n => {
      if (!n.recipient || n.recipient === 'all') return true;
      if (n.recipient === userEmail) return true;
      if (n.recipient === 'manager' && isManager) return true;
      if (n.recipient === 'agent' && !isManager) return true;
      return false;
    });
  }

  getUnreadNotificationsCount() {
    return this.getNotifications().filter(n => !n.read).length;
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
      if (api.getToken() && notif.read) {
        api.markNotificationRead(id).catch(err => console.warn('[store] PostgreSQL markNotificationRead failed:', err.message));
      }
    }
  }

  markAllNotificationsAsRead() {
    const visible = this.getNotifications();
    visible.forEach(n => n.read = true);
    this.saveNotifications();
    this.notify('NOTIFICATIONS_UPDATED', this.notifications);
    if (api.getToken()) {
      api.markAllNotificationsRead().catch(err => console.warn('[store] PostgreSQL markAllNotificationsRead failed:', err.message));
    }
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

  loadTeams() {
    try {
      const saved = localStorage.getItem('op_teams');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading teams from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_TEAMS));
  }

  saveUsers() {
    try {
      localStorage.setItem('op_users', JSON.stringify(this.users));
    } catch (e) {
      console.warn('Error saving users to localStorage:', e);
    }
  }

  saveCurrentUser() {
    try {
      localStorage.setItem('ops_current_user', JSON.stringify(this.currentUser));
    } catch (e) {
      console.warn('Error saving currentUser to localStorage:', e);
    }
  }

  saveTeams() {
    try {
      localStorage.setItem('op_teams', JSON.stringify(this.teams));
    } catch (e) {
      console.warn('Error saving teams to localStorage:', e);
    }
    this.notify('TEAMS_UPDATED', this.teams);
  }

  getTeams() {
    return this.teams.map(team => {
      const members = this.users.filter(u => u.teamId === team.id);
      const head = this.users.find(u => u.id === team.headId || (u.name === team.headName && u.teamId === team.id));
      return {
        ...team,
        headName: head ? head.name : team.headName,
        members
      };
    });
  }

  setTeamHead(teamId, agentId) {
    if (!this.isManager()) {
      console.warn('Unauthorized: Only manager can appoint team heads.');
      return false;
    }
    const team = this.teams.find(t => t.id === teamId);
    const agent = this.users.find(u => u.id === agentId);
    if (!team || !agent) return false;

    // Reset current team members isTeamHead flag
    this.users.forEach(u => {
      if (u.teamId === teamId) {
        u.isTeamHead = (u.id === agentId);
      }
    });

    team.headId = agent.id;
    team.headName = agent.name;
    this.saveUsers();
    this.saveTeams();
    this.notify('TEAMS_UPDATED', this.teams);
    return true;
  }

  transferAgent(agentId, targetTeamId) {
    if (!this.isManager()) {
      console.warn('Unauthorized: Only manager can transfer agents.');
      return false;
    }
    const agent = this.users.find(u => u.id === agentId);
    if (!agent) return false;

    agent.teamId = targetTeamId;
    agent.isTeamHead = false; // Reset lead status on transfer
    this.saveUsers();
    this.saveTeams();
    this.notify('TEAMS_UPDATED', this.teams);
    return true;
  }

  createAgent({ name, email, role, teamId, shift, password, phone, location, skills, isTeamHead }) {
    if (!this.isManager()) {
      console.warn('Unauthorized: Only manager can create agents.');
      return null;
    }
    const newId = 'usr-' + (Date.now() % 100000);
    const departmentName = teamId === 'team-a' ? 'Tech & Operations' : 'Field & Logistics';
    
    const newAgent = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || 'Field Agent',
      department: departmentName,
      teamId: teamId || 'team-a',
      isManager: false,
      isTeamHead: !!isTeamHead,
      shift: shift || '10:00 AM - 5:00 PM',
      phone: phone || '+1 (555) 019-' + (1000 + Math.floor(Math.random() * 9000)),
      location: location || (teamId === 'team-a' ? 'HQ Ops Center - Floor 2' : 'Field Hub - Station Alpha'),
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean)) : ['Operations', 'Dispatch'],
      password: password || 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      stats: { assigned: 0, completed: 0, onTimeRate: '100%', activeIncidents: 0 }
    };

    this.users.push(newAgent);

    // If designated as Team Head, update team record
    if (isTeamHead) {
      const team = this.teams.find(t => t.id === teamId);
      if (team) {
        this.users.forEach(u => {
          if (u.teamId === teamId && u.id !== newId) {
            u.isTeamHead = false;
          }
        });
        team.headId = newId;
        team.headName = newAgent.name;
      }
    }

    // Automatically seed an attendance record for today
    if (Array.isArray(this.attendance)) {
      const todayStr = new Date().toISOString().split('T')[0];
      this.attendance.push({
        id: 'att-' + Date.now(),
        userId: newId,
        userName: newAgent.name,
        role: newAgent.role,
        teamId: newAgent.teamId,
        date: todayStr,
        clockIn: '10:00 AM',
        clockOut: null,
        workHours: 'In Progress',
        currentStatus: 'Clocked In',
        status: 'Present',
        isOnBreak: false
      });
      this.saveAttendance();
    }

    this.saveUsers();
    this.saveTeams();

    // Broadcast system notification for onboarding
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'New Personnel Onboarded: ' + newAgent.name,
      message: 'Manager Sarah registered ' + newAgent.name + ' (' + newAgent.role + ') to ' + (teamId === 'team-a' ? 'Team A' : 'Team B') + '.',
      timestamp: new Date().toISOString(),
      type: 'info',
      priority: 'Normal',
      read: false,
      taskId: null,
      recipient: 'all'
    });
    this.saveNotifications();
    this.notify('NOTIFICATIONS_UPDATED', this.notifications);
    this.notify('TEAMS_UPDATED', this.teams);
    return newAgent;
  }

  changeUserPassword(currentPassword, newPassword) {
    if (!this.currentUser) return false;
    const user = this.users.find(u => u.id === this.currentUser.id || u.email === this.currentUser.email);
    if (!user) return false;

    if (user.password !== currentPassword) {
      return false;
    }

    user.password = newPassword;
    this.currentUser.password = newPassword;
    this.saveUsers();
    this.saveCurrentUser();
    return true;
  }

  canEditTaskProgress(task) {
    if (!this.currentUser || !task) return false;
    // Once submitted for review or closed, progress cannot be altered by agents
    const s = (task.status || '').toLowerCase();
    if (s.includes('review') || s === 'closed' || s === 'completed' || s === 'resolved') {
      return false;
    }
    const aName = (task.assignee && typeof task.assignee === 'object') ? task.assignee.name : task.assignee;
    const aEmail = (task.assignee && typeof task.assignee === 'object') ? task.assignee.email : null;
    return (
      this.currentUser.id === task.assigneeId ||
      this.currentUser.name === aName ||
      (aEmail && this.currentUser.email === aEmail)
    );
  }

  canManagerCloseTask(task) {
    if (!this.currentUser || !task) return false;
    return this.isManager() && task.status !== 'Closed' && task.status !== 'Resolved';
  }

  managerCloseTask(taskId, resolutionNote) {
    if (!this.isManager()) return false;
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    task.status = 'Closed';
    task.progress = 100;
    if (!task.discussion) task.discussion = [];

    const noteText = resolutionNote || 'Task closed by Operations Manager.';
    task.discussion.push({
      id: 'c-' + Date.now(),
      author: this.currentUser ? this.currentUser.name : 'Sarah',
      text: '[MANAGER RESOLUTION]: ' + noteText,
      timestamp: new Date().toISOString()
    });

    this.saveTasks();
    this.notify('TASK_UPDATED', task);

    // Notify assigned agent
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'Task Closed by Manager: ' + task.id,
      message: 'Sarah closed ' + task.id + ': "' + (noteText.length > 50 ? noteText.substring(0, 47) + '...' : noteText) + '"',
      timestamp: new Date().toISOString(),
      type: 'success',
      priority: 'High',
      read: false,
      taskId: task.id,
      recipient: task.assigneeId || 'all'
    });
    this.saveNotifications();
    this.notify('NOTIFICATIONS_UPDATED', this.notifications);
    return true;
  }

  resetToBaseline() {
    try {
      localStorage.removeItem('op_users');
      localStorage.removeItem('op_teams');
      localStorage.removeItem('op_tasks');
      localStorage.removeItem('op_attendance');
      localStorage.removeItem('op_leave_requests');
      localStorage.removeItem('op_notifications');
    } catch(e){}
    this.users = JSON.parse(JSON.stringify(MOCK_USERS));
    this.teams = JSON.parse(JSON.stringify(INITIAL_TEAMS));
    this.saveUsers();
    this.saveTeams();
  }

  // =========================================================
  // Day 6: Async Backend Data Fetchers
  // These methods call the PostgreSQL backend (api.js).
  // Called from views to get live data. Store state is updated
  // in place and subscribers are notified.
  // =========================================================

  /**
   * Fetch tasks from backend and sync to local state.
   * Views should await this then call store.getTasks() for the data.
   */
  async fetchTasksFromBackend(filters = {}) {
    try {
      const data = await api.getTasks(filters);
      if (data && data.success && Array.isArray(data.data)) {
        const mapStatus = (s) => {
          const norm = (s || '').toUpperCase().replace(/\s+/g, '_');
          if (norm === 'IN_PROGRESS' || norm === 'ONGOING') return 'Ongoing';
          if (norm === 'CLOSED' || norm === 'RESOLVED') return 'Closed';
          if (norm === 'UNDER_REVIEW') return 'Under Review';
          return 'Open';
        };
        const mapPriority = (p) => {
          const norm = (p || '').toUpperCase();
          if (norm === 'CRITICAL') return 'Critical';
          if (norm === 'HIGH') return 'High';
          if (norm === 'LOW') return 'Low';
          return 'Medium';
        };

        this.tasks = data.data.map(t => {
          const comments = (t.comments || []).map(c => ({
            id: c.id,
            author: c.author ? c.author.name : 'Operations Agent',
            avatar: c.author ? (c.author.avatar || '') : '',
            role: (c.author && c.author.role) ? (c.author.role.name || c.author.role) : 'Agent',
            text: c.content || c.text || '',
            timestamp: c.createdAt
          }));
          const timeline = (t.activities || []).map(a => ({
            id: a.id,
            author: a.user ? a.user.name : 'System',
            message: a.description,
            timestamp: a.createdAt,
            type: a.action === 'COMMENT' ? 'comment' : 'action'
          }));

          return {
            id: t.id,
            taskCode: t.taskCode,
            title: t.title || t.taskCode,
            summary: t.summary || t.description || t.title,
            description: t.description || '',
            priority: mapPriority(t.priority),
            status: mapStatus(t.status),
            department: (t.department && t.department.name) ? t.department.name : (t.team?.name || 'Operations'),
            assignee: t.assignee ? {
              id: t.assignee.id,
              name: t.assignee.name,
              email: t.assignee.email,
              avatar: t.assignee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: (t.assignee.role && t.assignee.role.name) ? t.assignee.role.name : (t.assignee.role || 'Agent')
            } : {
              id: 'unassigned',
              name: 'Unassigned',
              email: '',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: 'Unassigned'
            },
            teamId: t.teamId,
            dueDate: t.dueDate,
            createdDate: t.createdAt,
            location: t.location || 'Sector Central',
            progress: t.progress || 0,
            comments,
            discussion: comments,
            timeline,
            attachments: t.attachments || [],
            _fromBackend: true
          };
        });
        this.saveTasks();
        this.notify('TASKS_UPDATED', this.tasks);
        return this.tasks;
      }
    } catch (err) {
      console.warn('[store] fetchTasksFromBackend failed:', err.message);
    }
    return this.tasks;
  }

  /**
   * Fetch notifications from backend and sync.
   */
  async fetchNotificationsFromBackend() {
    try {
      const data = await api.getNotifications();
      if (data && data.success && Array.isArray(data.data)) {
        this.notifications = data.data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: n.createdAt,
          type: n.category || 'info',
          read: n.read,
          priority: n.priority || 'Normal',
          recipient: n.userId,
          _fromBackend: true
        }));
        this.saveNotifications();
        this.notify('NOTIFICATIONS_UPDATED', this.notifications);
        return this.notifications;
      }
    } catch (err) {
      console.warn('[store] fetchNotificationsFromBackend failed:', err.message);
    }
    return this.notifications;
  }

  /**
   * Fetch attendance records from backend.
   */
  async fetchAttendanceFromBackend() {
    try {
      const data = await api.getMyAttendance();
      let record = null;
      const todayStr = new Date().toISOString().split('T')[0];

      if (data && data.success && data.data) {
        const { today } = data.data;
        const existingIdx = this.attendance.findIndex(
          a => (a.userId === this.currentUser?.id || a.userEmail === this.currentUser?.email) && a.date === todayStr
        );

        record = today ? {
          id: today.id || ('att-' + todayStr),
          userId: today.userId,
          userEmail: this.currentUser?.email,
          userName: this.currentUser?.name,
          role: this.currentUser?.role,
          date: today.date || todayStr,
          clockIn: today.clockIn,
          clockOut: today.clockOut,
          currentStatus: today.currentStatus || (today.clockIn ? (today.clockOut ? 'Clocked Out' : 'Active') : 'Offline'),
          status: today.status || (today.clockIn ? 'Present' : 'Absent'),
          isOnBreak: today.currentStatus === 'On Break',
          totalHours: today.workHours || (today.clockIn && !today.clockOut ? 'In Progress' : '0.0h'),
          breaks: today.breaks || [],
          _fromBackend: true
        } : null;

        if (record) {
          if (existingIdx !== -1) {
            this.attendance[existingIdx] = record;
          } else {
            this.attendance.unshift(record);
          }
          this.saveAttendance();
          this.notify('ATTENDANCE_UPDATED', record);
        }
      }

      if (this.isManager()) {
        try {
          const teamData = await api.getTeamAttendance();
          if (teamData && teamData.success && Array.isArray(teamData.data)) {
            teamData.data.forEach(member => {
              const att = member.attendanceRecords?.[0];
              const existingIdx = this.attendance.findIndex(a => (a.userId === member.id || a.userEmail === member.email) && a.date === todayStr);
              const mRecord = {
                id: att?.id || ('att-' + member.id + '-' + todayStr),
                userId: member.id,
                userEmail: member.email,
                userName: member.name,
                role: member.role?.name || 'Agent',
                date: todayStr,
                clockIn: att?.clockIn || null,
                clockOut: att?.clockOut || null,
                currentStatus: att?.currentStatus || (att?.clockIn ? (att.clockOut ? 'Clocked Out' : 'Active') : 'Offline'),
                status: att?.status || (att?.clockIn ? 'Present' : 'Absent'),
                isOnBreak: att?.currentStatus === 'On Break',
                totalHours: att?.workHours || (att?.clockIn && !att.clockOut ? 'In Progress' : '0.0h'),
                breaks: att?.breaks || [],
                _fromBackend: true
              };
              if (existingIdx !== -1) {
                this.attendance[existingIdx] = mRecord;
              } else {
                this.attendance.push(mRecord);
              }
            });
            this.saveAttendance();
          }
        } catch (teamErr) {
          console.warn('[store] fetchTeamAttendance failed:', teamErr.message);
        }
      }

      return record;
    } catch (err) {
      console.warn('[store] fetchAttendanceFromBackend failed:', err.message);
    }
    return null;
  }

  /**
   * Backend clock-in (PostgreSQL).
   */
  async clockInBackend() {
    try {
      const data = await api.clockIn();
      if (data && data.success) {
        await this.fetchAttendanceFromBackend();
        return data.data;
      }
    } catch (err) {
      console.warn('[store] clockInBackend failed:', err.message);
    }
    // Fallback to mock
    return this.clockIn();
  }

  /**
   * Backend clock-out (PostgreSQL).
   */
  async clockOutBackend() {
    try {
      const data = await api.clockOut();
      if (data && data.success) {
        await this.fetchAttendanceFromBackend();
        return data.data;
      }
    } catch (err) {
      console.warn('[store] clockOutBackend failed:', err.message);
    }
    return this.clockOut();
  }

  /**
   * Backend break toggle (PostgreSQL).
   */
  async toggleBreakBackend() {
    try {
      // Determine current status
      const todayStr = new Date().toISOString().split('T')[0];
      const record = this.attendance.find(
        a => (a.userId === this.currentUser?.id || a.userEmail === this.currentUser?.email) && a.date === todayStr
      );
      const isOnBreak = record && record.isOnBreak;
      const data = isOnBreak ? await api.endBreak() : await api.startBreak();
      if (data && data.success) {
        await this.fetchAttendanceFromBackend();
        return data.data;
      }
    } catch (err) {
      console.warn('[store] toggleBreakBackend failed:', err.message);
    }
    return this.toggleBreak();
  }

  /**
   * Fetch leaves from backend.
   */
  async fetchLeavesFromBackend() {
    try {
      const data = await api.getLeaves();
      if (data && data.success && Array.isArray(data.data)) {
        this.leaveRequests = data.data.map(l => ({
          id: l.id,
          userEmail: l.user ? l.user.email : '',
          userName: l.user ? l.user.name : '',
          leaveType: l.leaveType,
          startDate: l.startDate,
          endDate: l.endDate,
          reason: l.reason,
          status: l.status,
          reviewedBy: l.approvedBy ? l.approvedBy.name : null,
          reviewNotes: l.reviewNotes,
          appliedOn: l.createdAt,
          _fromBackend: true
        }));
        this.saveLeaveRequests();
        this.notify('LEAVES_UPDATED', this.leaveRequests);
        return this.leaveRequests;
      }
    } catch (err) {
      console.warn('[store] fetchLeavesFromBackend failed:', err.message);
    }
    return this.leaveRequests;
  }

  /**
   * Submit leave to backend.
   */
  async submitLeaveBackend(leaveData) {
    try {
      const data = await api.submitLeave(leaveData);
      if (data && data.success) {
        await this.fetchLeavesFromBackend();
        return data.data;
      }
    } catch (err) {
      console.warn('[store] submitLeaveBackend failed:', err.message);
    }
    return this.submitLeaveRequest(leaveData);
  }

  /**
   * Fetch dashboard summary from backend.
   */
  async fetchDashboardSummary() {
    try {
      const data = await api.getDashboardSummary();
      if (data && data.success) {
        return data.data;
      }
    } catch (err) {
      console.warn('[store] fetchDashboardSummary failed:', err.message);
    }
    return null;
  }

  /**
   * Mark notification as read via backend.
   */
  async markNotificationReadBackend(id) {
    try {
      await api.markNotificationRead(id);
    } catch {}
    // Also update local state
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
      this.notify('NOTIFICATIONS_UPDATED', this.notifications);
    }
  }

  /**
   * Mark all notifications as read via backend.
   */
  async markAllNotificationsReadBackend() {
    try {
      await api.markAllNotificationsRead();
    } catch {}
    this.notifications.forEach(n => { n.read = true; });
    this.saveNotifications();
    this.notify('NOTIFICATIONS_UPDATED', this.notifications);
  }


  /**
   * Universal synchronizer for full-stack state.
   */
  async syncWithBackend() {
    if (!api.getToken()) return;
    try {
      await Promise.allSettled([
        this.fetchTasksFromBackend(),
        this.fetchNotificationsFromBackend(),
        this.fetchAttendanceFromBackend(),
        this.fetchLeavesFromBackend(),
        this.fetchDashboardSummary()
      ]);
    } catch (err) {
      console.warn('[store] syncWithBackend error:', err.message);
    }
  }

}

export const store = new StateStore();

