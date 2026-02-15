require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('=== SafeApp Backend Starting ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configuré' : '❌ MANQUANT');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Configuré' : '❌ MANQUANT');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Vérifier les variables requises
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ ERREUR: GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont requis!');
  console.error('Créez un fichier .env avec ces variables.');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://safe.superprojetx.com',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'safeapp-secret-change-me',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Mettre à true en HTTPS avec certificat valide
    maxAge: 24 * 60 * 60 * 1000 // 24h
  }
}));

// OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'https://safeapi.superprojetx.com/auth/callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.readonly'
];

// ===== ROUTES AUTH =====

app.get('/auth/url', (req, res) => {
  console.log('Generating auth URL...');
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true
  });
  console.log('Auth URL generated');
  res.json({ url });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  console.log('Auth callback received, code:', code ? 'present' : 'missing');
  
  if (!code) {
    return res.status(400).json({ error: 'Code manquant' });
  }
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    console.log('Tokens obtained successfully');
    res.redirect(process.env.FRONTEND_URL || 'https://safe.superprojetx.com');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
});

app.get('/auth/status', (req, res) => {
  res.json({ connected: !!req.session.tokens });
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Déconnecté' });
});

// ===== ROUTES TASKS =====

app.get('/api/tasks/lists', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await tasks.tasklists.list();
    res.json(response.data);
  } catch (error) {
    console.error('Tasks lists error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:listId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await tasks.tasks.list({
      tasklist: req.params.listId,
      showCompleted: true,
      maxResults: 100
    });
    res.json(response.data);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:listId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await tasks.tasks.insert({
      tasklist: req.params.listId,
      requestBody: req.body
    });
    res.json(response.data);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:listId/:taskId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await tasks.tasks.update({
      tasklist: req.params.listId,
      task: req.params.taskId,
      requestBody: req.body
    });
    res.json(response.data);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:listId/:taskId', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  
  try {
    await tasks.tasks.delete({
      tasklist: req.params.listId,
      task: req.params.taskId
    });
    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES SEARCH CONSOLE =====

app.get('/api/searchconsole/sites', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });
  
  try {
    const response = await webmasters.sites.list();
    res.json(response.data);
  } catch (error) {
    console.error('Search console sites error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/searchconsole/data', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { siteUrl, startDate, endDate } = req.query;
  if (!siteUrl) return res.status(400).json({ error: 'siteUrl requis' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });
  
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
    console.error('Search console data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES CALENDAR =====

app.get('/api/calendar/events', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { timeMin, timeMax } = req.query;
  
  oauth2Client.setCredentials(req.session.tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
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
    console.error('Calendar error:', error);
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
  
  oauth2Client.setCredentials(req.session.tokens);
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  
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
    console.error('Sheets error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stock', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { spreadsheetId, range, values } = req.body;
  
  oauth2Client.setCredentials(req.session.tokens);
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Sheets update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    googleConfigured: !!process.env.GOOGLE_CLIENT_ID
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
});