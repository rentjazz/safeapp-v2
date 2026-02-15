#!/bin/bash
# Script de diagnostic SSL

echo "🔍 Diagnostic SSL pour superprojetx.com"
echo "======================================="
echo ""

echo "1. Vérification DNS..."
echo "   safe.superprojetx.com:"
dig +short safe.superprojetx.com
echo ""
echo "   safeapi.superprojetx.com:"
dig +short safeapi.superprojetx.com
echo ""

echo "2. Vérification Nginx..."
echo "   Sites configurés:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "3. Vérification Certbot..."
echo "   Certificats présents:"
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "   Aucun certificat trouvé"
echo ""

echo "4. Test HTTP (port 80)..."
curl -I http://safeapi.superprojetx.com/health 2>&1 | head -5
echo ""

echo "5. Test HTTPS (port 443)..."
curl -I -k https://safeapi.superprojetx.com/health 2>&1 | head -5
echo ""

echo "6. Test direct sur le conteneur (bypass Nginx)..."
curl http://localhost:3000/health 2>&1
echo ""

echo "======================================="
