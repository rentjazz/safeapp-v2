#!/bin/bash
# Script pour créer les workflows n8n via API

N8N_URL="https://n8n.superprojetx.com"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYmNjYjYzNC05ZDFmLTRkYjQtODk2My0zYTRmMjBhNmMzODQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiN2U0ZGIzNDktMDZlMC00MmQ3LTlmOTMtMGJjYzMwOGE1MTI4IiwiaWF0IjoxNzcxMTYyNTkwfQ.So4s0yhtd-D4Y2NTQInM3RJRcgkDBvKTq3YUFMiW1dg"

# Workflow 1: Get Task Lists
curl -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SafeApp - Tasks Get Lists",
    "nodes": [
      {
        "id": "uuid-webhook-1",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300],
        "parameters": {
          "httpMethod": "GET",
          "path": "safeapp-tasks-lists",
          "responseMode": "lastNode"
        },
        "webhookId": "safeapp-tasks-lists"
      },
      {
        "id": "uuid-tasks-1",
        "name": "Google Tasks",
        "type": "n8n-nodes-base.googleTasks",
        "typeVersion": 1,
        "position": [450, 300],
        "parameters": {
          "operation": "getAll"
        },
        "credentials": {
          "googleTasksOAuth2Api": {
            "id": null,
            "name": "Google Tasks account"
          }
        }
      }
    ],
    "connections": {
      "Webhook": {
        "main": [
          [
            {
              "node": "Google Tasks",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "settings": {
      "executionOrder": "v1"
    },
    "staticData": null,
    "tags": []
  }'

echo "Workflow 1 créé"

# Workflow 2: Get Tasks
curl -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SafeApp - Tasks Get Items",
    "nodes": [
      {
        "id": "uuid-webhook-2",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300],
        "parameters": {
          "httpMethod": "POST",
          "path": "safeapp-tasks-get",
          "responseMode": "lastNode"
        },
        "webhookId": "safeapp-tasks-get"
      },
      {
        "id": "uuid-tasks-2",
        "name": "Google Tasks",
        "type": "n8n-nodes-base.googleTasks",
        "typeVersion": 1,
        "position": [450, 300],
        "parameters": {
          "operation": "getAll",
          "taskList": "={{ $body.listId }}",
          "returnAll": false,
          "limit": 100
        }
      }
    ],
    "connections": {
      "Webhook": {
        "main": [
          [
            {
              "node": "Google Tasks",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "settings": {
      "executionOrder": "v1"
    },
    "staticData": null,
    "tags": []
  }'

echo "Workflow 2 créé"

# Workflow 3: Get Calendar Events
curl -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SafeApp - Calendar Get Events",
    "nodes": [
      {
        "id": "uuid-webhook-3",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300],
        "parameters": {
          "httpMethod": "GET",
          "path": "safeapp-calendar-events",
          "responseMode": "lastNode"
        },
        "webhookId": "safeapp-calendar-events"
      },
      {
        "id": "uuid-calendar-1",
        "name": "Google Calendar",
        "type": "n8n-nodes-base.googleCalendar",
        "typeVersion": 1,
        "position": [450, 300],
        "parameters": {
          "operation": "getAll",
          "calendar": "primary",
          "timeMin": "={{ $now }}",
          "timeMax": "={{ $now.plus({ days: 7 }) }}",
          "options": {}
        }
      }
    ],
    "connections": {
      "Webhook": {
        "main": [
          [
            {
              "node": "Google Calendar",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "settings": {
      "executionOrder": "v1"
    },
    "staticData": null,
    "tags": []
  }'

echo "Workflow 3 créé"

echo ""
echo "✅ Tous les workflows ont été créés !"
echo "Va sur https://n8n.superprojetx.com/workflows pour les voir"
