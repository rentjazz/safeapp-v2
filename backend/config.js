// Configuration qui peut venir des variables d'environnement OU d'un fichier
const fs = require('fs');
const path = require('path');

// Charger .env manuellement si présent
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('✅ Fichier .env chargé');
}

// Configuration avec valeurs par défaut
const config = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'https://safeapi.superprojetx.com/auth/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://safe.superprojetx.com',
  API_URL: process.env.API_URL || 'https://safeapi.superprojetx.com',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret-change-me',
  PORT: parseInt(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'production'
};

// Fonction pour mettre à jour la config
function updateConfig(newConfig) {
  Object.assign(config, newConfig);
  // Mettre à jour aussi process.env pour compatibilité
  Object.keys(newConfig).forEach(key => {
    process.env[key] = newConfig[key];
  });
}

module.exports = { config, updateConfig };