const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  // Authentification
  static async getAuthUrl() {
    const res = await fetch(`${API_URL}/auth/url`);
    return res.json();
  }

  static async getAuthStatus() {
    const res = await fetch(`${API_URL}/auth/status`, { credentials: 'include' });
    return res.json();
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