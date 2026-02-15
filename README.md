# SafeApp V2 - Dashboard Safe HDF

Dashboard complet avec connexions réelles aux API Google (pas de données mock).

## 🚀 Fonctionnalités

### 📊 Vue d'ensemble
- KPIs réels depuis Google Search Console
- Graphiques de performance SEO
- Prochains rendez-vous (Google Calendar)
- Tâches prioritaires (Google Tasks)

### 📦 Gestion de Stock
- Connexion Google Sheets
- Suivi des articles en temps réel
- Alertes stock faible
- Filtres et recherche

### 🔍 SEO (Google Search Console)
- Performance des 3 sites (safehdf.com, coffrefort.safehdf.com, safehdf.be)
- Clics, impressions, CTR, positions
- Pages et requêtes les plus performantes

### ✅ Tâches (Google Tasks)
- Synchronisation bidirectionnelle
- Gestion des listes
- Création/édition/suppression
- Filtres par statut

### 📰 Actualités (RSS via n8n)
- Flux RSS agrégés
- Webhook n8n
- Filtrage par catégorie

## 🛠️ Architecture

```
safeapp-v2/
├── backend/          # API Node.js (port 3000)
│   ├── server.js     # Routes API Google
│   ├── package.json
│   └── Dockerfile
├── frontend/         # React App (port 3001)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## 📦 Installation

### 1. Cloner le repo
```bash
git clone https://github.com/rentjazz/safeapp-v2.git
cd safeapp-v2
```

### 2. Configurer les variables d'environnement
```bash
cp backend/.env.example backend/.env
```

Éditer `backend/.env` :
```env
GOOGLE_CLIENT_ID=votre_id_client.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_secret_client
GOOGLE_REDIRECT_URI=http://votre-domaine:3000/auth/callback
FRONTEND_URL=http://votre-domaine:3001
SESSION_SECRET=votre_cle_secrete_longue
```

### 3. Créer les credentials Google
1. Aller sur https://console.cloud.google.com/
2. Créer un projet
3. Activer les APIs :
   - Google Tasks API
   - Google Search Console API
   - Google Sheets API
   - Google Calendar API
4. Créer des credentials OAuth2
5. Ajouter l'URL de redirection autorisée

### 4. Lancer l'application
```bash
docker-compose up -d --build
```

### 5. Premier accès
1. Ouvrir http://votre-domaine:3001
2. Cliquer "Se connecter" pour authentifier Google
3. Configurer le stock avec l'ID de votre Google Sheets

## 🔧 Configuration Google Sheets (Stock)

1. Créer un Google Sheets avec les colonnes :
   - A: Référence
   - B: Nom
   - C: Quantité
   - D: Seuil minimum
   - E: Emplacement
   - F: Fournisseur

2. Partager le Sheets avec l'email de service ou rendre public

3. Récupérer l'ID du spreadsheet (dans l'URL)

4. Le configurer dans l'onglet Stock du Dashboard

## 🌐 Déploiement sur VPS

### Prérequis
- Docker et Docker Compose installés
- Ports 3000 et 3001 ouverts

### Commandes
```bash
# Sur le VPS
git clone https://github.com/rentjazz/safeapp-v2.git /opt/safeapp
cd /opt/safeapp

# Configurer le .env
nano backend/.env

# Lancer
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f
```

### Avec Nginx (reverse proxy)
```nginx
server {
    listen 80;
    server_name dashboard.safehdf.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.safehdf.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📋 TODO

- [ ] Tests avec vraies API Google
- [ ] Mise en place SSL (HTTPS)
- [ ] Configuration n8n pour actualités
- [ ] Sauvegarde automatique des données
- [ ] Notifications email/slack

## 📝 Notes

- Les données sont réelles (pas de mock)
- Authentification OAuth2 requise
- Stock géré via Google Sheets
- Données SEO depuis Search Console

---
Safe HDF - https://safehdf.com
