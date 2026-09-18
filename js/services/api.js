/**
 * GESF REST API Service Client
 * Day 6: Full backend adapter — View -> store.js -> api.js -> Express -> PostgreSQL
 * All operational data is now PostgreSQL-authoritative.
 */

const API_HOST = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
const API_BASE = `http://${API_HOST}:5000/api`;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('ops_jwt_token') || null;
    this.isOnline = false;
    this._healthCheckDone = false;
    this.checkHealth().then(online => {
      if (online) {
        console.log('[API] Backend connected: PostgreSQL 18 / Express');
      } else {
        console.warn('[API] Backend unreachable — UI running in offline/mock mode');
      }
    });
  }

  // ---------- Token Management ----------
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('ops_jwt_token') || null;
    }
    return this.token;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('ops_jwt_token', token);
    } else {
      localStorage.removeItem('ops_jwt_token');
    }
  }

  clearAuth() {
    this.token = null;
    localStorage.removeItem('ops_jwt_token');
  }

  // ---------- Health ----------
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(3000)
      });
      const data = await res.json();
      this.isOnline = res.ok && data.success;
      this._healthCheckDone = true;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      this._healthCheckDone = true;
      return false;
    }
  }

  // ---------- Core Request Wrapper ----------
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Fallback header: x-user-id (allows server to identify user without JWT during dev)
    const savedUser = localStorage.getItem('ops_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.id) headers['x-user-id'] = u.id;
      } catch {}
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message || data?.error || `HTTP ${res.status}`;
        const errCode = data?.error?.code || 'API_ERROR';
        const err = new Error(errMsg);
        err.code = errCode;
        err.status = res.status;
        throw err;
      }
      this.isOnline = true;
      return data;
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'TypeError') {
        this.isOnline = false;
      }
      throw err;
    }
  }

  // ---------- Authentication ----------
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuth();
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async sendResetOtp(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyResetOtp(email, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  }

  async resetPasswordWithOtp(email, otp, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword })
    });
  }

  // ---------- Users & Teams ----------
  async getUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async getTeams() {
    return this.request('/teams');
  }

  async getTeamById(id) {
    return this.request(`/teams/${id}`);
  }

  // ---------- Tasks ----------
  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.teamId) params.set('teamId', filters.teamId);
    if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    return this.request(`/tasks${qs ? '?' + qs : ''}`);
  }

  async getTaskById(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async updateTaskStatus(id, status) {
    return this.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async updateTaskProgress(id, progress) {
    return this.request(`/tasks/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress })
    });
  }

  async reassignTask(id, assigneeId) {
    return this.request(`/tasks/${id}/assignee`, {
      method: 'PATCH',
      body: JSON.stringify({ assigneeId })
    });
  }

  async getTaskComments(id) {
    return this.request(`/tasks/${id}/comments`);
  }

  async addTaskComment(id, comment) {
    return this.request(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  async getTaskActivity(id) {
    return this.request(`/tasks/${id}/activity`);
  }

  // ---------- Dashboard ----------
  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  // ---------- Attendance ----------
  async getMyAttendance() {
    return this.request('/attendance/me');
  }

  async getTodayAttendance() {
    return this.request('/attendance/today');
  }

  async getTeamAttendance() {
    return this.request('/attendance/team');
  }

  async clockIn() {
    return this.request('/attendance/clock-in', { method: 'POST' });
  }

  async clockOut() {
    return this.request('/attendance/clock-out', { method: 'POST' });
  }

  async startBreak() {
    return this.request('/attendance/break/start', { method: 'POST' });
  }

  async endBreak() {
    return this.request('/attendance/break/end', { method: 'POST' });
  }

  // ---------- Leaves ----------
  async getMyLeaves() {
    return this.request('/leaves/me');
  }

  async getLeaves() {
    return this.request('/leaves');
  }

  async getPendingLeaves() {
    return this.request('/leaves/pending');
  }

  async submitLeave(leaveData) {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  }

  async approveLeave(id, reviewNotes = '') {
    return this.request(`/leaves/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewNotes })
    });
  }

  async rejectLeave(id, reviewNotes = '') {
    return this.request(`/leaves/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewNotes })
    });
  }

  // ---------- Notifications ----------
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }
}

export const api = new ApiService();
export default api;
