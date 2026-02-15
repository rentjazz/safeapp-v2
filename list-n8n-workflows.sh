#!/bin/bash
# Activer les workflows n8n

N8N_URL="https://n8n.superprojetx.com"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYmNjYjYzNC05ZDFmLTRkYjQtODk2My0zYTRmMjBhNmMzODQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiN2U0ZGIzNDktMDZlMC00MmQ3LTlmOTMtMGJjYzMwOGE1MTI4IiwiaWF0IjoxNzcxMTYyNTkwfQ.So4s0yhtd-D4Y2NTQInM3RJRcgkDBvKTq3YUFMiW1dg"

# Liste les workflows
echo "📋 Workflows existants:"
curl -s "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" | jq -r '.data[] | "\(.id): \(.name) (Active: \(.active))"'

echo ""
echo "✅ Pour activer un workflow, récupère son ID ci-dessus et exécute:"
echo "curl -X PATCH \"$N8N_URL/api/v1/workflows/ID\" \\"
echo "  -H \"X-N8N-API-KEY: \$API_KEY\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"active\": true}'"
