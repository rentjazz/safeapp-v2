# Instructions pour Hostinger Docker

Si vous utilisez l'interface Docker de Hostinger, vous devez configurer les variables d'environnement dans l'interface.

## Méthode 1: Variables d'environnement dans l'interface Hostinger

Dans l'interface Docker de Hostinger, ajoutez ces variables d'environnement pour le service `backend`:

```
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=https://safeapi.superprojetx.com/auth/callback
FRONTEND_URL=https://safe.superprojetx.com
API_URL=https://safeapi.superprojetx.com
SESSION_SECRET=cle_aleatoire_de_32_caracteres_min
PORT=3000
NODE_ENV=production
```

## Méthode 2: Générer le docker-compose avec les valeurs

Sur votre VPS, exécutez:

```bash
cd /opt/safeapp
./generate-compose.sh "VOTRE_CLIENT_ID" "VOTRE_CLIENT_SECRET"
docker-compose up -d --build
```

Remplacez:
- `VOTRE_CLIENT_ID` par votre vrai Client ID (ex: 123456789-abc123.apps.googleusercontent.com)
- `VOTRE_CLIENT_SECRET` par votre vrai Client Secret (ex: GOCSPX-xxxxxxxxxxxx)

## Méthode 3: Fichier .env

Créez un fichier `backend/.env`:

```bash
cd /opt/safeapp/backend
cat > .env << 'EOF'
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=https://safeapi.superprojetx.com/auth/callback
FRONTEND_URL=https://safe.superprojetx.com
API_URL=https://safeapi.superprojetx.com
SESSION_SECRET=cle_aleatoire_longue_ici
PORT=3000
EOF
```

Puis modifiez le docker-compose.yml pour monter ce fichier:

```yaml
backend:
  volumes:
    - ./backend/.env:/app/.env:ro
```

## Vérification

Après déploiement, vérifiez que les variables sont bien chargées:

```bash
docker-compose logs backend | head -20
```

Vous devriez voir:
```
GOOGLE_CLIENT_ID: ✅ Configuré
GOOGLE_CLIENT_SECRET: ✅ Configuré
```

Et non:
```
GOOGLE_CLIENT_ID: ❌ MANQUANT
```
