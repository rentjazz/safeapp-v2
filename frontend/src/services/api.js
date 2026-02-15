// API Service - Utilise le même domaine
const API_URL = ''; // Vide = même domaine (les appels vont sur /api/, /auth/, etc.)

console.log('API URL: same domain (relative paths)');

class ApiService {
  static async getConfigStatus() {
    const res = await fetch('/admin/config/status');
    return res.json();
  }

  static async configureGoogle(clientId, clientSecret) {
    const res = await fetch('/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        GOOGLE_CLIENT_ID: clientId,
        GOOGLE_CLIENT_SECRET: clientSecret
      })
    });
    return res.json();
  }

  static async getAuthUrl() {
    const res = await fetch('/auth/url', { credentials: 'include' });
    return res.json();
  }

  static async getAuthStatus() {
    try {
      const res = await fetch('/auth/status', { credentials: 'include' });
      return res.json();
    } catch (e) {
      return { connected: false, googleConfigured: false };
    }
  }

  static async logout() {
    const res = await fetch('/auth/logout', { credentials: 'include' });
    return res.json();
  }

  // Tasks
  static async getTaskLists() {
    const res = await fetch('/api/tasks/lists', { credentials: 'include' });
    return res.json();
  }

  static async getTasks(listId) {
    const res = await fetch(`/api/tasks/${listId}`, { credentials: 'include' });
    return res.json();
  }

  static async createTask(listId, task) {
    const res = await fetch(`/api/tasks/${listId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(task)
    });
    return res.json();
  }

  static async updateTask(listId, taskId, task) {
    const res = await fetch(`/api/tasks/${listId}/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(task)
    });
    return res.json();
  }

  static async deleteTask(listId, taskId) {
    const res = await fetch(`/api/tasks/${listId}/${taskId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.json();
  }

  // Search Console
  static async getSearchConsoleSites() {
    const res = await fetch('/api/searchconsole/sites', { credentials: 'include' });
    return res.json();
  }

  static async getSearchConsoleData(siteUrl, startDate, endDate) {
    const params = new URLSearchParams({ siteUrl, startDate, endDate });
    const res = await fetch(`/api/searchconsole/data?${params}`, { credentials: 'include' });
    return res.json();
  }

  // Calendar
  static async getCalendarEvents(timeMin, timeMax) {
    const params = new URLSearchParams({ timeMin, timeMax });
    const res = await fetch(`/api/calendar/events?${params}`, { credentials: 'include' });
    return res.json();
  }

  // Stock
  static async getStock(spreadsheetId, range) {
    const params = new URLSearchParams({ spreadsheetId, range });
    const res = await fetch(`/api/stock?${params}`, { credentials: 'include' });
    return res.json();
  }

  static async updateStock(spreadsheetId, range, values) {
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ spreadsheetId, range, values })
    });
    return res.json();
  }
}

export default ApiService;