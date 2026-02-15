#!/bin/bash
# Installation avec Nginx unifié (même domaine pour frontend et API)

echo "🚀 Installation SafeApp avec Nginx unifié"
echo "========================================="

# Configuration Nginx
echo "⚙️  Configuration de Nginx..."

cat > /etc/nginx/sites-available/safeapp << 'EOF'
server {
    listen 80;
    server_name safe.superprojetx.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name safe.superprojetx.com;

    ssl_certificate /etc/letsencrypt/live/safe.superprojetx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/safe.superprojetx.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /auth/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /admin/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
EOF

ln -sf /etc/nginx/sites-available/safeapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

echo "✅ Nginx configuré !"
echo ""
echo "URLs:"
echo "  Frontend: https://safe.superprojetx.com"
echo "  API:      https://safe.superprojetx.com/api/"
echo "  Auth:     https://safe.superprojetx.com/auth/"
