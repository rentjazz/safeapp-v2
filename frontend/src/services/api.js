// Get API URL from multiple sources
const getApiUrl = () => {
  // 1. From window.APP_CONFIG (runtime config)
  if (window.APP_CONFIG && window.APP_CONFIG.API_URL && !window.APP_CONFIG.API_URL.includes('%')) {
    return window.APP_CONFIG.API_URL;
  }
  // 2. From environment variable (build time)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // 3. Default
  return 'http://31.97.155.126:3000';
};

const API_URL = getApiUrl();

console.log('API URL configured:', API_URL);

class ApiService {
  // Admin config
  static async getConfigStatus() {
    try {
      const res = await fetch(`${API_URL}/admin/config/status`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    } catch (e) {
      console.error('getConfigStatus error:', e);
      return { googleConfigured: false, error: e.message };
    }
  }

  static async configureGoogle(clientId, clientSecret) {
    try {
      const res = await fetch(`${API_URL}/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          GOOGLE_CLIENT_ID: clientId,
          GOOGLE_CLIENT_SECRET: clientSecret
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    } catch (e) {
      console.error('configureGoogle error:', e);
      throw e;
    }
  }

  // Authentification
  static async getAuthUrl() {
    const res = await fetch(`${API_URL}/auth/url`, { credentials: 'include' });
    return res.json();
  }

  static async getAuthStatus() {
    try {
      const res = await fetch(`${API_URL}/auth/status`, { credentials: 'include' });
      return res.json();
    } catch (e) {
      return { connected: false, googleConfigured: false };
    }
  }

  static async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, { credentials: 'include' });
    return res.json();
  }

  // Google Tasks
  static async getTaskLists() {
    const res = await fetch(`${API_URL}/api/tasks/lists`, { credentials: 'include' });
    return res.json();
  }

  static async getTasks(listId) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}`, { credentials: 'include' });
    return res.json();
  }

  static async createTask(listId, task) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(task)
    });
    return res.json();
  }

  static async updateTask(listId, taskId, task) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(task)
    });
    return res.json();
  }

  static async deleteTask(listId, taskId) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}/${taskId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.json();
  }

  // Search Console
  static async getSearchConsoleSites() {
    const res = await fetch(`${API_URL}/api/searchconsole/sites`, { credentials: 'include' });
    return res.json();
  }

  static async getSearchConsoleData(siteUrl, startDate, endDate) {
    const params = new URLSearchParams({ siteUrl, startDate, endDate });
    const res = await fetch(`${API_URL}/api/searchconsole/data?${params}`, { credentials: 'include' });
    return res.json();
  }

  // Calendar
  static async getCalendarEvents(timeMin, timeMax) {
    const params = new URLSearchParams({ timeMin, timeMax });
    const res = await fetch(`${API_URL}/api/calendar/events?${params}`, { credentials: 'include' });
    return res.json();
  }

  // Stock (Google Sheets)
  static async getStock(spreadsheetId, range) {
    const params = new URLSearchParams({ spreadsheetId, range });
    const res = await fetch(`${API_URL}/api/stock?${params}`, { credentials: 'include' });
    return res.json();
  }

  static async updateStock(spreadsheetId, range, values) {
    const res = await fetch(`${API_URL}/api/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ spreadsheetId, range, values })
    });
    return res.json();
  }
}

export default ApiService;