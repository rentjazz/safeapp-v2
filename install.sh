#!/bin/bash
# Script d'installation complète avec SSL

set -e

echo "🚀 Installation SafeApp avec SSL"
echo "================================="

# Variables
DOMAIN_FRONTEND="${1:-dashboard.safehdf.com}"
DOMAIN_API="${2:-api.safehdf.com}"
EMAIL="${3:-contact@safehdf.com}"

echo ""
echo "📋 Configuration:"
echo "  - Frontend: https://$DOMAIN_FRONTEND"
echo "  - API: https://$DOMAIN_API"
echo "  - Email: $EMAIL"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "Installation..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    echo "Installation..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Installer Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Créer les répertoires
echo "📁 Création des répertoires..."
mkdir -p /opt/safeapp
mkdir -p /opt/safeapp/nginx

# Copier les fichiers
echo "📂 Copie des fichiers..."
cp -r backend /opt/safeapp/
cp -r frontend /opt/safeapp/
cp docker-compose.yml /opt/safeapp/
cp nginx/safeapp.conf /opt/safeapp/nginx/

# Mettre à jour les URLs dans le fichier .env
echo "⚙️ Configuration..."
cd /opt/safeapp

cat > backend/.env << EOF
# Google OAuth2
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://$DOMAIN_API/auth/callback

# URLs
FRONTEND_URL=https://$DOMAIN_FRONTEND
API_URL=https://$DOMAIN_API

# Session
SESSION_SECRET=$(openssl rand -hex 32)

# Port
PORT=3000
EOF

echo ""
echo "✅ Fichiers copiés !"
echo ""

# Configurer Nginx
echo "🌐 Configuration Nginx..."
cp nginx/safeapp.conf /etc/nginx/sites-available/safeapp
ln -sf /etc/nginx/sites-available/safeapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

# Obtenir les certificats SSL
echo ""
echo "🔒 Obtention des certificats SSL..."
echo "Assurez-vous que les DNS pointent vers ce serveur:"
echo "  - $DOMAIN_FRONTEND -> $(curl -s ifconfig.me)"
echo "  - $DOMAIN_API -> $(curl -s ifconfig.me)"
echo ""
read -p "Appuyez sur Entrée quand les DNS sont configurés..."

certbot --nginx -d $DOMAIN_FRONTEND -d $DOMAIN_API --non-interactive --agree-tos -m $EMAIL

# Lancer l'application
echo ""
echo "🚀 Démarrage de SafeApp..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Afficher le résumé
echo ""
echo "======================================"
echo "✅ SafeApp installé avec succès !"
echo "======================================"
echo ""
echo "🌐 URLs d'accès:"
echo "  Dashboard: https://$DOMAIN_FRONTEND"
echo "  API: https://$DOMAIN_API"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Créer un projet sur https://console.cloud.google.com/"
echo "  2. Activer les APIs: Tasks, Search Console, Sheets, Calendar"
echo "  3. Créer des credentials OAuth2"
echo "  4. Ajouter les URLs autorisées:"
echo "     - https://$DOMAIN_API/auth/callback"
echo "  5. Copier le Client ID et Secret dans /opt/safeapp/backend/.env"
echo "  6. Redémarrer: cd /opt/safeapp && docker-compose restart"
echo ""
echo "📁 Fichier de config: /opt/safeapp/backend/.env"
echo ""

# Afficher le contenu du .env
echo "Contenu actuel de .env:"
cat backend/.env