#!/bin/bash
# Trouver et activer les workflows SafeApp

N8N_URL="https://n8n.superprojetx.com"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYmNjYjYzNC05ZDFmLTRkYjQtODk2My0zYTRmMjBhNmMzODQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiN2U0ZGIzNDktMDZlMC00MmQ3LTlmOTMtMGJjYzMwOGE1MTI4IiwiaWF0IjoxNzcxMTYyNTkwfQ.So4s0yhtd-D4Y2NTQInM3RJRcgkDBvKTq3YUFMiW1dg"

echo "🔍 Recherche des workflows 'SafeApp'..."

# Récupère tous les workflows et filtre
WORKFLOWS=$(curl -s "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" | \
  jq -r '.data[] | select(.name | contains("SafeApp")) | "\(.id)"')

if [ -z "$WORKFLOWS" ]; then
  echo "❌ Aucun workflow SafeApp trouvé"
  echo "Liste de tous les workflows:"
  curl -s "$N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $API_KEY" | \
    jq -r '.data[] | "\(.id): \(.name)"'
else
  echo "✅ Workflows SafeApp trouvés:"
  echo "$WORKFLOWS"
  
  # Active chaque workflow
  for ID in $WORKFLOWS; do
    echo ""
    echo "▶️  Activation du workflow $ID..."
    curl -s -X PATCH "$N8N_URL/api/v1/workflows/$ID" \
      -H "X-N8N-API-KEY: $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"active": true}'
    echo ""
  done
  
  echo ""
  echo "✅ Workflows activés !"
fi

echo ""
echo "🧪 Test des webhooks:"
echo "  Tasks Lists: curl $N8N_URL/webhook/safeapp-tasks-lists"
echo "  Tasks Get:   curl -X POST $N8N_URL/webhook/safeapp-tasks-get -d '{\"listId\": \"@default\"}'"
echo "  Calendar:    curl $N8N_URL/webhook/safeapp-calendar-events"
