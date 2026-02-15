# SafeApp V2 - Installation avec SSL

## 🌐 Prérequis DNS

Avant de commencer, configure ces DNS sur ton domaine :

```
dashboard.safehdf.com  A  → IP_DE_TON_VPS
api.safehdf.com        A  → IP_DE_TON_VPS
```

Ou utilise des sous-domaines de ton choix.

## 🚀 Installation automatique

```bash
# Sur ton VPS
sudo su
cd /opt
git clone https://github.com/rentjazz/safeapp-v2.git
cd safeapp-v2

# Lancer l'installation avec SSL
./install.sh dashboard.safehdf.com api.safehdf.com contact@safehdf.com
```

## 🔧 Installation manuelle

### 1. DNS
Assure-toi que tes DNS pointent vers ton VPS.

### 2. Installer les dépendances
```bash
# Docker
apt-get update
apt-get install -y docker.io docker-compose

# Certbot (Let's Encrypt)
apt-get install -y certbot python3-certbot-nginx nginx
```

### 3. Configurer Nginx
```bash
cp nginx/safeapp.conf /etc/nginx/sites-available/safeapp
ln -s /etc/nginx/sites-available/safeapp /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 4. SSL (Let's Encrypt)
```bash
certbot --nginx -d dashboard.safehdf.com -d api.safehdf.com
```

### 5. Configurer l'application
```bash
cd /opt/safeapp

# Créer le fichier .env
nano backend/.env
```

Contenu de `backend/.env` :
```env
# Google OAuth2
GOOGLE_CLIENT_ID=votre_id_client.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_secret_client
GOOGLE_REDIRECT_URI=https://api.safehdf.com/auth/callback

# URLs
FRONTEND_URL=https://dashboard.safehdf.com
API_URL=https://api.safehdf.com

# Session (générer une clé aléatoire)
SESSION_SECRET=changez_moi_par_une_cle_longue_et_aleatoire

# Port
PORT=3000
```

### 6. Lancer l'application
```bash
docker-compose up -d --build
```

## 🔑 Configuration Google Cloud Console

1. Aller sur https://console.cloud.google.com/
2. Créer un nouveau projet "SafeApp Dashboard"
3. Activer ces APIs :
   - ✅ Google Tasks API
   - ✅ Google Search Console API
   - ✅ Google Sheets API
   - ✅ Google Calendar API

4. Créer des credentials OAuth2 :
   - Type : Application web
   - Nom : SafeApp Dashboard
   - URIs de redirection autorisés :
     - `https://api.safehdf.com/auth/callback`
   - Origines JavaScript autorisées :
     - `https://dashboard.safehdf.com`
     - `https://api.safehdf.com`

5. Copier le Client ID et Client Secret dans `/opt/safeapp/backend/.env`

6. Redémarrer l'application :
```bash
cd /opt/safeapp
docker-compose restart
```

## 📦 Structure après installation

```
/opt/safeapp/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env          # À configurer
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile
├── nginx/
│   └── safeapp.conf  # Config Nginx
├── docker-compose.yml
└── install.sh
```

## 🌐 URLs après installation

| Service | URL |
|---------|-----|
| Dashboard | https://dashboard.safehdf.com |
| API | https://api.safehdf.com |
| Auth callback | https://api.safehdf.com/auth/callback |

## 🔄 Mise à jour

```bash
cd /opt/safeapp
git pull
docker-compose down
docker-compose up -d --build
```

## 📋 Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Renouveler SSL
certbot renew
```

## ⚠️ URLs à ajouter dans Google Cloud Console

Dans la console Google Cloud, section "Credentials" > OAuth 2.0 Client IDs :

**URIs de redirection autorisés :**
- `https://api.safehdf.com/auth/callback`

**Origines JavaScript autorisées :**
- `https://dashboard.safehdf.com`
- `https://api.safehdf.com`
