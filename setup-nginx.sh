#!/bin/bash
# Script de configuration Nginx pour SafeApp sur superprojetx.com

set -e

echo "🌐 Configuration Nginx pour safe.superprojetx.com"
echo "=================================================="

# Variables
DOMAIN_FRONTEND="safe.superprojetx.com"
DOMAIN_API="safeapi.superprojetx.com"
EMAIL="contact@safehdf.com"

echo ""
echo "📋 Vérification des prérequis..."

# Vérifier que les DNS sont propagés
echo "🔍 Vérification DNS..."
FRONTEND_IP=$(dig +short $DOMAIN_FRONTEND 2>/dev/null || echo "")
API_IP=$(dig +short $DOMAIN_API 2>/dev/null || echo "")

if [ -z "$FRONTEND_IP" ] || [ -z "$API_IP" ]; then
    echo "⚠️  ATTENTION: Les DNS ne semblent pas encore propagés"
    echo "   $DOMAIN_FRONTEND -> $FRONTEND_IP"
    echo "   $DOMAIN_API -> $API_IP"
    echo ""
    read -p "Continuer quand même? (o/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        exit 1
    fi
fi

# Installer Nginx si pas déjà présent
echo "📦 Installation de Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

# Installer Certbot
echo "📦 Installation de Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

# Créer la config Nginx
echo "⚙️  Création de la configuration Nginx..."
cat > /etc/nginx/sites-available/safeapp << 'EOF'
# Frontend - HTTP redirect
server {
    listen 80;
    server_name safe.superprojetx.com;
    return 301 https://$server_name$request_uri;
}

# Frontend - HTTPS
server {
    listen 443 ssl http2;
    server_name safe.superprojetx.com;

    # SSL (Certbot)
    ssl_certificate /etc/letsencrypt/live/safe.superprojetx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/safe.superprojetx.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy vers le frontend React
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# API - HTTP redirect
server {
    listen 80;
    server_name safeapi.superprojetx.com;
    return 301 https://$server_name$request_uri;
}

# API - HTTPS
server {
    listen 443 ssl http2;
    server_name safeapi.superprojetx.com;

    # SSL (Certbot)
    ssl_certificate /etc/letsencrypt/live/safeapi.superprojetx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/safeapi.superprojetx.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # CORS headers pour l'API
    add_header 'Access-Control-Allow-Origin' 'https://safe.superprojetx.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://safe.superprojetx.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    # Proxy vers le backend Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Activer le site
echo "✅ Activation du site..."
ln -sf /etc/nginx/sites-available/safeapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
echo "🧪 Test de la configuration Nginx..."
nginx -t

# Redémarrer Nginx
echo "🔄 Redémarrage de Nginx..."
systemctl restart nginx
systemctl enable nginx

echo ""
echo "🔒 Obtention des certificats SSL..."
echo "Cette étape peut prendre quelques minutes..."

# Obtenir les certificats SSL
certbot --nginx -d safe.superprojetx.com -d safeapi.superprojetx.com --non-interactive --agree-tos -m $EMAIL || {
    echo ""
    echo "⚠️  Certbot a échoué. Tentative avec mode standalone..."
    certbot certonly --standalone -d safe.superprojetx.com -d safeapi.superprojetx.com --non-interactive --agree-tos -m $EMAIL
    systemctl restart nginx
}

echo ""
echo "======================================"
echo "✅ Nginx configuré avec succès !"
echo "======================================"
echo ""
echo "🌐 URLs configurées:"
echo "  - https://safe.superprojetx.com (Frontend)"
echo "  - https://safeapi.superprojetx.com (API)"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Déployer l'application: cd /opt/safeapp && docker-compose up -d"
echo "  2. Configurer Google Cloud Console"
echo "  3. Tester l'accès au dashboard"
echo ""
echo "🔧 Commandes utiles:"
echo "  - Voir les logs Nginx: tail -f /var/log/nginx/access.log"
echo "  - Voir les erreurs: tail -f /var/log/nginx/error.log"
echo "  - Redémarrer Nginx: systemctl restart nginx"
echo "  - Renouveler SSL: certbot renew"
echo ""

# Afficher le statut
systemctl status nginx --no-pager -l
