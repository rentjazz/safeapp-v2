const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'safeapp-secret-key',
  resave: false,
  saveUninitialized: true
}));

// OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
);

// Scopes pour toutes les APIs Google nécessaires
const SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.readonly'
];

// ===== ROUTES AUTHENTIFICATION =====

// URL d'authentification Google
app.get('/auth/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true
  });
  res.json({ url });
});

// Callback OAuth2
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    oauth2Client.setCredentials(tokens);
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001');
  } catch (error) {
    console.error('Erreur auth:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Vérifier statut connexion
app.get('/auth/status', (req, res) => {
  if (req.session.tokens) {
    oauth2Client.setCredentials(req.session.tokens);
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
});

// Déconnexion
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Déconnecté' });
});

// ===== ROUTES GOOGLE TASKS =====

// Récupérer les listes de tâches
app.get('/api/tasks/lists', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await tasks.tasklists.list();
    res.json(response.data);
  } catch (error) {
    console.error('Erreur Tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les tâches d'une liste
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
    console.error('Erreur Tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Créer une tâche
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
    console.error('Erreur création tâche:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une tâche
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
    console.error('Erreur update tâche:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une tâche
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
    console.error('Erreur suppression tâche:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES GOOGLE SEARCH CONSOLE =====

// Récupérer les sites
app.get('/api/searchconsole/sites', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  oauth2Client.setCredentials(req.session.tokens);
  const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });
  
  try {
    const response = await webmasters.sites.list();
    res.json(response.data);
  } catch (error) {
    console.error('Erreur Search Console:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les données de performance
app.get('/api/searchconsole/data', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { siteUrl, startDate, endDate } = req.query;
  
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
    console.error('Erreur Search Console data:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES STOCK (Google Sheets) =====

// Récupérer les données de stock
app.get('/api/stock', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Non authentifié' });
  
  const { spreadsheetId, range } = req.query;
  
  if (!spreadsheetId) {
    return res.json({ 
      message: 'Aucun spreadsheet configuré',
      items: []
    });
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
    console.error('Erreur Sheets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour le stock
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
    console.error('Erreur Sheets update:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTES CALENDAR =====

// Récupérer les événements
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
    console.error('Erreur Calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROUTE SANTÉ =====
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 API SafeApp démarrée sur http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;