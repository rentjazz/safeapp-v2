const API_URL = process.env.REACT_APP_API_URL || 'https://safeapi.superprojetx.com';

console.log('API URL:', API_URL); // Debug

class ApiService {
  static async getAuthUrl() {
    console.log('Fetching auth URL from:', `${API_URL}/auth/url`);
    const res = await fetch(`${API_URL}/auth/url`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!res.ok) throw new Error('Erreur réseau');
    return res.json();
  }

  static async getAuthStatus() {
    try {
      const res = await fetch(`${API_URL}/auth/status`, { 
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return { connected: false };
      return res.json();
    } catch (e) {
      console.error('Auth status error:', e);
      return { connected: false };
    }
  }

  static async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return res.json();
  }

  static async getTaskLists() {
    const res = await fetch(`${API_URL}/api/tasks/lists`, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Erreur tâches');
    return res.json();
  }

  static async getTasks(listId) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}`, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Erreur tâches');
    return res.json();
  }

  static async createTask(listId, task) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(task)
    });
    return res.json();
  }

  static async updateTask(listId, taskId, task) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}/${taskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(task)
    });
    return res.json();
  }

  static async deleteTask(listId, taskId) {
    const res = await fetch(`${API_URL}/api/tasks/${listId}/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return res.json();
  }

  static async getSearchConsoleSites() {
    const res = await fetch(`${API_URL}/api/searchconsole/sites`, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return res.json();
  }

  static async getSearchConsoleData(siteUrl, startDate, endDate) {
    const params = new URLSearchParams({ siteUrl, startDate, endDate });
    const res = await fetch(`${API_URL}/api/searchconsole/data?${params}`, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return res.json();
  }

  static async getCalendarEvents(timeMin, timeMax) {
    const params = new URLSearchParams({ timeMin, timeMax });
    const res = await fetch(`${API_URL}/api/calendar/events?${params}`, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return res.json();
  }

  static async getStock(spreadsheetId, range) {
    const params = new URLSearchParams({ spreadsheetId, range });
    const res = await fetch(`${API_URL}/api/stock?${params}`, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return res.json();
  }

  static async updateStock(spreadsheetId, range, values) {
    const res = await fetch(`${API_URL}/api/stock`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ spreadsheetId, range, values })
    });
    return res.json();
  }
}

export default ApiService;