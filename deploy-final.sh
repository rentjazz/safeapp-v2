#!/bin/bash
# Script de déploiement final SafeApp

set -e

echo "🚀 Déploiement SafeApp sur superprojetx.com"
echo "============================================"
echo ""

# Vérifier si on est sur le bon serveur
if [ "$(curl -s ifconfig.me)" != "31.97.155.126" ]; then
    echo "⚠️  ATTENTION: Tu n'es pas sur le VPS 31.97.155.126"
    echo "Connecte-toi d'abord: ssh root@31.97.155.126"
    exit 1
fi

cd /opt

# Cloner si pas déjà fait
if [ ! -d "safeapp" ]; then
    echo "📥 Clonage du repository..."
    git clone https://github.com/rentjazz/safeapp-v2.git safeapp
fi

cd safeapp

echo "📥 Mise à jour du code..."
git pull

echo ""
echo "⚙️  Configuration..."

# Vérifier si .env existe
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "📝 Création du fichier de configuration..."
    echo ""
    
    read -p "Colle ton GOOGLE_CLIENT_ID: " CLIENT_ID
    read -p "Colle ton GOOGLE_CLIENT_SECRET: " CLIENT_SECRET
    
    cat > backend/.env << EOF
# Google OAuth2
GOOGLE_CLIENT_ID=$CLIENT_ID
GOOGLE_CLIENT_SECRET=$CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://safeapi.superprojetx.com/auth/callback

# URLs
FRONTEND_URL=https://safe.superprojetx.com
API_URL=https://safeapi.superprojetx.com

# Session (clé aléatoire)
SESSION_SECRET=$(openssl rand -hex 32)

# Port
PORT=3000
EOF
    
    echo "✅ Fichier .env créé !"
else
    echo "✅ Fichier .env déjà présent"
fi

echo ""
echo "🔨 Build et démarrage des conteneurs..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage (10 secondes)..."
sleep 10

echo ""
echo "🧪 Vérification..."

# Test API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://safeapi.superprojetx.com/health || echo "000")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API accessible: https://safeapi.superprojetx.com"
else
    echo "⚠️  API non accessible (status: $API_STATUS)"
    echo "   Logs: docker-compose logs backend"
fi

# Test Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://safe.superprojetx.com || echo "000")
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "304" ]; then
    echo "✅ Frontend accessible: https://safe.superprojetx.com"
else
    echo "⚠️  Frontend non accessible (status: $FRONTEND_STATUS)"
fi

echo ""
echo "======================================"
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "======================================"
echo ""
echo "🌐 Accès:"
echo "  Dashboard: https://safe.superprojetx.com"
echo "  API:       https://safeapi.superprojetx.com"
echo ""
echo "📋 Commandes utiles:"
echo "  Logs:     docker-compose logs -f"
echo "  Restart:  docker-compose restart"
echo "  Stop:     docker-compose down"
echo ""
echo "🔐 Premier pas:"
echo "  1. Ouvrir https://safe.superprojetx.com"
echo "  2. Cliquer 'Se connecter avec Google'"
echo "  3. Autoriser l'accès"
echo ""
