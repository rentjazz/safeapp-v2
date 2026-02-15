# Configuration pour superprojetx.com

## 🌐 DNS à configurer

Ajoute ces enregistrements A dans ta zone DNS de superprojetx.com :

```
safe.superprojetx.com     A     31.97.155.126
safeapi.superprojetx.com  A     31.97.155.126
```

## 🚀 Installation rapide

```bash
# Se connecter au VPS
ssh root@31.97.155.126

# Installer SafeApp
cd /opt
git clone https://github.com/rentjazz/safeapp-v2.git
cd safeapp-v2

# Lancer l'installation
./install.sh safe.superprojetx.com safeapi.superprojetx.com contact@safehdf.com
```

## 🔧 Configuration Google Cloud Console

Une fois l'installation terminée, configure ces URLs dans https://console.cloud.google.com/apis/credentials :

### OAuth 2.0 Client IDs

**Type:** Application web

**Nom:** SafeApp Dashboard

**Origines JavaScript autorisées:**
- `https://safe.superprojetx.com`
- `https://safeapi.superprojetx.com`

**URIs de redirection autorisés:**
- `https://safeapi.superprojetx.com/auth/callback`

## 📋 Récapitulatif URLs

| Service | URL |
|---------|-----|
| Dashboard | https://safe.superprojetx.com |
| API Backend | https://safeapi.superprojetx.com |
| Callback OAuth | https://safeapi.superprojetx.com/auth/callback |

## 📝 Fichier .env à configurer

Après installation, édite `/opt/safeapp/backend/.env` :

```env
# Google OAuth2
GOOGLE_CLIENT_ID=votre_id_client.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_secret_client
GOOGLE_REDIRECT_URI=https://safeapi.superprojetx.com/auth/callback

# URLs
FRONTEND_URL=https://safe.superprojetx.com
API_URL=https://safeapi.superprojetx.com

# Session
SESSION_SECRET=cle_aleatoire_longue_32_caracteres_min

# Port
PORT=3000
```

## 🔄 Redémarrer après config

```bash
cd /opt/safeapp
docker-compose restart
```

## ✅ Vérifier l'installation

1. Ouvrir https://safe.superprojetx.com
2. Cliquer "Se connecter avec Google"
3. Autoriser l'accès
4. Vérifier que les tâches Google s'affichent
