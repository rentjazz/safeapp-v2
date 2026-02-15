const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const session = require('express-session');
const { config, updateConfig } = require('./config');

const app = express();
const PORT = config.PORT;

console.log('=== SafeApp Backend Starting ===');
console.log('NODE_ENV:', config.NODE_ENV);
console.log('PORT:', config.PORT);
console.log('GOOGLE_CLIENT_ID:', config.GOOGLE_CLIENT_ID ? '✅ Configuré (' + config.GOOGLE_CLIENT_ID.substring(0, 20) + '...)' : '❌ MANQUANT');
console.log('GOOGLE_CLIENT_SECRET:', config.GOOGLE_CLIENT_SECRET ? '✅ Configuré' : '❌ MANQUANT');
console.log('FRONTEND_URL:', config.FRONTEND_URL);
console.log('');

// Middleware
app.use(cors({
  origin: [config.FRONTEND_URL, 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://31.97.155.126:3001'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// OAuth2 Client
let oauth2Client = null;

function getOAuthClient() {
  if (!oauth2Client && config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_REDIRECT_URI
    );
  }
  return oauth2Client;
}

const SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.readonly'
];

// ===== ROUTE DE CONFIGURATION =====
// Permet de configurer les credentials via API (pour l'interface Hostinger)
app.post('/admin/config', express.json(), (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET } = req.body;
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ error: 'CLIENT_ID et CLIENT_SECRET requis' });
  }
  
  updateConfig({
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    SESSION_SECRET: SESSION_SECRET || config.SESSION_SECRET
  });
  
  // Recréer le client OAuth
  oauth2Client = new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
  );
  
  console.log('✅ Configuration mise à jour via API');
  res.json({ 
    message: 'Configuration mise à jour',
    googleConfigured: true 
  });
});

// Vérifier la config actuelle (sans exposer les secrets)
app.get('/admin/config/status', (req, res) => {
  res.json({
    googleConfigured: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
    frontendUrl: config.FRONTEND_URL,
    redirectUri: config.GOOGLE_REDIRECT_URI
  });
});

// ===== ROUTES AUTH =====

app.get('/auth/url', (req, res) => {
  const client = getOAuthClient();
  if (!client) {
    return res.status(500).json({ 
      error: 'OAuth non configuré',
      message: 'GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET manquants. Configurez via /admin/config'
    });
  }
  
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true
  });
  res.json({ url });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const client = getOAuthClient();
  
  if (!client) {
    return res.status(500).send('OAuth non configuré');
  }
  
  if (!code) {
    return res.status(400).send('Code manquant');
  }
  
  try {
    const { tokens } = await client.getToken(code);
    req.session.tokens = tokens;
    console.log('✅ Tokens obtenus');
    res.redirect(config.FRONTEND_URL);
  } catch (error) {
    console.error('❌ Auth callback error:', error.message);
    res.status(500).send('Authentication failed: ' + error.message);
  }
});

app.get('/auth/status', (req, res) => {
  res.json({ 
    connected: !!req.session.tokens,
    googleConfigured: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET)
  });
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Déconnecté' });
});

// ===== ROUTES TASKS =====

app.get('/api/tasks/lists', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: client });
  
  try {
    const response = await tasks.tasklists.list();
    res.json(response.data);
  } catch (error) {
    console.error('Tasks lists error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:listId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: client });
  
  try {
    const response = await tasks.tasks.list({
      tasklist: req.params.listId,
      showCompleted: true,
      maxResults: 100
    });
    res.json(response.data);
  } catch (error) {
    console.error('Tasks error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:listId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: client });
  
  try {
    const response = await tasks.tasks.insert({
      tasklist: req.params.listId,
      requestBody: req.body
    });
    res.json(response.data);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:listId/:taskId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: client });
  
  try {
    const response = await tasks.tasks.update({
      tasklist: req.params.listId,
      task: req.params.taskId,
      requestBody: req.body
    });
    res.json(response.data);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:listId/:taskId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: client });
  
  try {
    await tasks.tasks.delete({
      tasklist: req.params.listId,
      task: req.params.taskId
    });
    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES SEARCH CONSOLE =====

app.get('/api/searchconsole/sites', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const webmasters = google.webmasters({ version: 'v3', auth: client });
  
  try {
    const response = await webmasters.sites.list();
    res.json(response.data);
  } catch (error) {
    console.error('Search console sites error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/searchconsole/data', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { siteUrl, startDate, endDate } = req.query;
  if (!siteUrl) return res.status(400).json({ error: 'siteUrl requis' });
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const webmasters = google.webmasters({ version: 'v3', auth: client });
  
  try {
    const response = await webmasters.searchanalytics.query({
      siteUrl: decodeURIComponent(siteUrl),
      requestBody: {
        startDate: startDate || '2024-01-01',
        endDate: endDate || '2024-12-31',
        dimensions: ['date'],
        rowLimit: 1000
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Search console data error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES CALENDAR =====

app.get('/api/calendar/events', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { timeMin, timeMax } = req.query;
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const calendar = google.calendar({ version: 'v3', auth: client });
  
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });
    res.json(response.data);
  } catch (error) {
    console.error('Calendar error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES STOCK (SHEETS) =====

app.get('/api/stock', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { spreadsheetId, range } = req.query;
  
  if (!spreadsheetId) {
    return res.json({ values: [], message: 'Aucun spreadsheet configuré' });
  }
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const sheets = google.sheets({ version: 'v4', auth: client });
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range || 'Stock!A:F'
    });
    res.json({ 
      values: response.data.values,
      range: response.data.range
    });
  } catch (error) {
    console.error('Sheets error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stock', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { spreadsheetId, range, values } = req.body;
  
  const client = getOAuthClient();
  if (!client) return res.status(500).json({ error: 'OAuth non configuré' });
  
  client.setCredentials(req.session.tokens);
  const sheets = google.sheets({ version: 'v4', auth: client });
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Sheets update error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    googleConfigured: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
    frontendUrl: config.FRONTEND_URL
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️  Config status: http://localhost:${PORT}/admin/config/status`);
  
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    console.log('');
    console.log('⚠️  ATTENTION: Configuration Google manquante!');
    console.log('   Configurez via:');
    console.log('   - Variables d\'environnement, ou');
    console.log('   - POST /admin/config { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET }');
  }
});