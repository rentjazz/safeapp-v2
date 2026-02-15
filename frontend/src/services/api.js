// Configuration
const USE_N8N = process.env.REACT_APP_USE_N8N === 'true';
const N8N_URL = process.env.REACT_APP_N8N_URL || 'https://n8n.superprojetx.com';
const API_URL = process.env.REACT_APP_API_URL || 'http://31.97.155.126:3000';

const BASE_URL = USE_N8N ? N8N_URL : API_URL;

console.log('API Mode:', USE_N8N ? 'n8n' : 'backend');
console.log('Base URL:', BASE_URL);

class ApiService {
  // Helper pour construire les URLs
  static getUrl(endpoint) {
    if (USE_N8N) {
      // URLs n8n (webhooks)
      const n8nEndpoints = {
        '/auth/status': '/webhook/safeapp/auth/status',
        '/api/tasks/lists': '/webhook/safeapp/tasks/lists',
        '/api/tasks/get': '/webhook/safeapp/tasks/get',
        '/api/tasks/create': '/webhook/safeapp/tasks/create',
        '/api/calendar/events': '/webhook/safeapp/calendar/events',
        '/api/searchconsole/sites': '/webhook/safeapp/seo/sites',
        '/api/searchconsole/data': '/webhook/safeapp/seo/data',
        '/api/stock/get': '/webhook/safeapp/stock/get',
        '/admin/config/status': '/webhook/safeapp/config/status',
      };
      return N8N_URL + (n8nEndpoints[endpoint] || endpoint);
    }
    return API_URL + endpoint;
  }

  // Admin
  static async getConfigStatus() {
    try {
      const res = await fetch(this.getUrl('/admin/config/status'));
      return res.json();
    } catch (e) {
      // Si n8n n'est pas encore configuré, considérer comme configuré
      // car n8n gère déjà les credentials
      if (USE_N8N) {
        return { googleConfigured: true, mode: 'n8n' };
      }
      return { googleConfigured: false };
    }
  }

  // Auth
  static async getAuthStatus() {
    if (USE_N8N) {
      // Avec n8n, on considère toujours comme authentifié
      // car n8n gère les tokens
      return { connected: true, googleConfigured: true, mode: 'n8n' };
    }
    const res = await fetch(this.getUrl('/auth/status'), { credentials: 'include' });
    return res.json();
  }

  static async getAuthUrl() {
    if (USE_N8N) {
      // Pas besoin d'URL d'auth avec n8n
      return { url: null, mode: 'n8n' };
    }
    const res = await fetch(this.getUrl('/auth/url'), { credentials: 'include' });
    return res.json();
  }

  // Tasks
  static async getTaskLists() {
    if (USE_N8N) {
      const res = await fetch(this.getUrl('/api/tasks/lists'));
      return res.json();
    }
    const res = await fetch(this.getUrl('/api/tasks/lists'), { credentials: 'include' });
    return res.json();
  }

  static async getTasks(listId) {
    if (USE_N8N) {
      const res = await fetch(this.getUrl('/api/tasks/get'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId })
      });
      return res.json();
    }
    const res = await fetch(this.getUrl(`/api/tasks/${listId}`), { credentials: 'include' });
    return res.json();
  }

  static async createTask(listId, task) {
    if (USE_N8N) {
      const res = await fetch(this.getUrl('/api/tasks/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, ...task })
      });
      return res.json();
    }
    const res = await fetch(this.getUrl(`/api/tasks/${listId}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(task)
    });
    return res.json();
  }

  // Calendar
  static async getCalendarEvents(timeMin, timeMax) {
    if (USE_N8N) {
      const res = await fetch(this.getUrl('/api/calendar/events'));
      return res.json();
    }
    const params = new URLSearchParams({ timeMin, timeMax });
    const res = await fetch(this.getUrl(`/api/calendar/events?${params}`), { credentials: 'include' });
    return res.json();
  }

  // Search Console
  static async getSearchConsoleSites() {
    if (USE_N8N) {
      const res = await fetch(this.getUrl('/api/searchconsole/sites'));
      return res.json();
    }
    const res = await fetch(this.getUrl('/api/searchconsole/sites'), { credentials: 'include' });
    return res.json();
  }

  static async getSearchConsoleData(siteUrl, startDate, endDate) {
    if (USE_N8N) {
      const res = await fetch(this.getUrl('/api/searchconsole/data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, startDate, endDate })
      });
      return res.json();
    }
    const params = new URLSearchParams({ siteUrl, startDate, endDate });
    const res = await fetch(this.getUrl(`/api/searchconsole/data?${params}`), { credentials: 'include' });
    return res.json();
  }

  // Stock
  static async getStock(spreadsheetId, range) {
    if (USE_N8N) {
      const res = await fetch(this.getUrl('/api/stock/get'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId, range })
      });
      return res.json();
    }
    const params = new URLSearchParams({ spreadsheetId, range });
    const res = await fetch(this.getUrl(`/api/stock?${params}`), { credentials: 'include' });
    return res.json();
  }
}

export default ApiService;