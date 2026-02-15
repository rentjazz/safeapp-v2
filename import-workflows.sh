#!/bin/bash
# Créer les workflows via l'API avec JSON complet

N8N_URL="https://n8n.superprojetx.com"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYmNjYjYzNC05ZDFmLTRkYjQtODk2My0zYTRmMjBhNmMzODQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiN2U0ZGIzNDktMDZlMC00MmQ3LTlmOTMtMGJjYzMwOGE1MTI4IiwiaWF0IjoxNzcxMTYyNTkwfQ.So4s0yhtd-D4Y2NTQInM3RJRcgkDBvKTq3YUFMiW1dg"

cd /data/.openclaw/workspace/safeapp-v2/n8n-import

echo "Création du workflow Tasks Lists..."
curl -s -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @safeapp-tasks-lists.json | jq -r '.id // .message'

echo ""
echo "Création du workflow Tasks Get..."
curl -s -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @safeapp-tasks-get.json | jq -r '.id // .message'

echo ""
echo "Création du workflow Calendar..."
curl -s -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @safeapp-calendar-events.json | jq -r '.id // .message'

echo ""
echo "✅ Workflows créés !"
