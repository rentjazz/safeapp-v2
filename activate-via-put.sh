#!/bin/bash
# Activer les workflows via PUT avec données complètes

N8N_URL="https://n8n.superprojetx.com"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYmNjYjYzNC05ZDFmLTRkYjQtODk2My0zYTRmMjBhNmMzODQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiN2U0ZGIzNDktMDZlMC00MmQ3LTlmOTMtMGJjYzMwOGE1MTI4IiwiaWF0IjoxNzcxMTYyNTkwfQ.So4s0yhtd-D4Y2NTQInM3RJRcgkDBvKTq3YUFMiW1dg"

IDS=("7mMMi8mU9DlLVGce" "pV8XcPeEXHfAC9yy" "QnalIpL91LXo90Hy")

for ID in "${IDS[@]}"; do
  echo "Activation $ID..."
  
  # Récupère le workflow
  WORKFLOW=$(curl -s "$N8N_URL/api/v1/workflows/$ID" -H "X-N8N-API-KEY: $API_KEY")
  
  # Modifie pour activer
  UPDATED=$(echo "$WORKFLOW" | jq '.active = true')
  
  # Envoie la mise à jour
  curl -s -X PUT "$N8N_URL/api/v1/workflows/$ID" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$UPDATED" | jq -r '.id // .message'
  
  echo ""
done

echo "✅ Workflows activés !"
