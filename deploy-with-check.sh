#!/bin/bash
# Script de déploiement avec vérification des credentials

set -e

echo "🚀 Déploiement SafeApp avec vérification"
echo "========================================="
echo ""

cd /opt/safeapp

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Supprimer les anciennes images
echo "🗑️  Suppression des anciennes images..."
docker-compose rm -f 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Vérifier/créer le fichier .env
echo ""
echo "⚙️  Vérification du fichier .env..."

if [ ! -f "backend/.env" ]; then
    echo "❌ ERREUR: Le fichier backend/.env n'existe pas!"
    echo ""
    echo "Créez-le avec:"
    echo "  nano backend/.env"
    echo ""
    echo "Contenu requis:"
    echo "  GOOGLE_CLIENT_ID=votre_id.apps.googleusercontent.com"
    echo "  GOOGLE_CLIENT_SECRET=votre_secret"
    echo "  GOOGLE_REDIRECT_URI=https://safeapi.superprojetx.com/auth/callback"
    echo "  FRONTEND_URL=https://safe.superprojetx.com"
    echo "  SESSION_SECRET=une_cle_longue_et_aleatoire"
    echo "  PORT=3000"
    exit 1
fi

# Vérifier que les variables sont présentes
if ! grep -q "GOOGLE_CLIENT_ID" backend/.env || ! grep -q "GOOGLE_CLIENT_SECRET" backend/.env; then
    echo "❌ ERREUR: GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET manquant dans .env"
    exit 1
fi

echo "✅ Fichier .env présent"
echo ""

# Build et lancer
echo "🔨 Build des conteneurs..."
docker-compose build --no-cache

echo ""
echo "🚀 Démarrage..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage (15s)..."
sleep 15

echo ""
echo "🧪 Vérification..."

# Test API
API_RESPONSE=$(curl -s https://safeapi.superprojetx.com/health 2>/dev/null || echo "")
if echo "$API_RESPONSE" | grep -q "googleConfigured.*true"; then
    echo "✅ API accessible et Google configuré"
elif echo "$API_RESPONSE" | grep -q "googleConfigured.*false"; then
    echo "❌ API accessible mais Google PAS configuré!"
    echo "   Vérifiez les logs: docker-compose logs backend"
    exit 1
else
    echo "❌ API non accessible"
    echo "   Logs: docker-compose logs backend"
    exit 1
fi

# Test Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://safe.superprojetx.com 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "304" ]; then
    echo "✅ Frontend accessible"
else
    echo "⚠️  Frontend status: $FRONTEND_STATUS"
fi

echo ""
echo "======================================"
echo "🎉 DÉPLOIEMENT RÉUSSI !"
echo "======================================"
echo ""
echo "🌐 URLs:"
echo "  Dashboard: https://safe.superprojetx.com"
echo "  API:       https://safeapi.superprojetx.com"
echo ""
echo "📋 Commandes:"
echo "  Logs:     docker-compose logs -f"
echo "  Restart:  docker-compose restart"
echo "  Stop:     docker-compose down"
echo ""
echo "🔐 Prochaine étape:"
echo "  1. Ouvrir https://safe.superprojetx.com"
echo "  2. Cliquer 'Se connecter avec Google'"
echo "  3. Autoriser l'accès"
echo ""
