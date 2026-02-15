#!/bin/bash
# Génère un docker-compose.yml avec les credentials hardcodés
# Usage: ./generate-compose.sh "CLIENT_ID" "CLIENT_SECRET"

CLIENT_ID="${1:-YOUR_CLIENT_ID}"
CLIENT_SECRET="${2:-YOUR_CLIENT_SECRET}"
SESSION_SECRET="$(openssl rand -hex 32)"

cat > docker-compose.yml << EOF
# SafeApp - Docker Compose
# Généré automatiquement avec les credentials

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: safeapp-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GOOGLE_CLIENT_ID=${CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}
      - GOOGLE_REDIRECT_URI=https://safeapi.superprojetx.com/auth/callback
      - FRONTEND_URL=https://safe.superprojetx.com
      - API_URL=https://safeapi.superprojetx.com
      - SESSION_SECRET=${SESSION_SECRET}
    restart: unless-stopped
    networks:
      - safeapp-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - REACT_APP_API_URL=https://safeapi.superprojetx.com
    container_name: safeapp-frontend
    ports:
      - "3001:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - safeapp-network

networks:
  safeapp-network:
    driver: bridge
EOF

echo "✅ docker-compose.yml généré avec succès!"
echo ""
echo "Variables configurées:"
echo "  GOOGLE_CLIENT_ID: ${CLIENT_ID:0:20}..."
echo "  GOOGLE_CLIENT_SECRET: ${CLIENT_SECRET:0:10}..."
echo "  SESSION_SECRET: ${SESSION_SECRET:0:20}..."
echo ""
echo "Pour déployer: docker-compose up -d --build"