# SafeApp avec n8n - Configuration

## 🔄 Architecture

```
Dashboard (React) → n8n (webhooks) → Google APIs
```

Au lieu d'utiliser le backend Node.js, on utilise **n8n** qui est déjà configuré avec les credentials Google.

## 📝 Workflows n8n à créer

### 1. Google Tasks - Get Lists
- **Webhook URL**: `https://n8n.superprojetx.com/webhook/tasks/lists`
- **Méthode**: GET
- **Action**: Récupérer les listes de tâches Google

### 2. Google Tasks - Get Tasks
- **Webhook URL**: `https://n8n.superprojetx.com/webhook/tasks/get`
- **Méthode**: POST
- **Body**: `{ "listId": "xxx" }`

### 3. Google Tasks - Create Task
- **Webhook URL**: `https://n8n.superprojetx.com/webhook/tasks/create`
- **Méthode**: POST
- **Body**: `{ "listId": "xxx", "title": "xxx" }`

### 4. Google Calendar - Get Events
- **Webhook URL**: `https://n8n.superprojetx.com/webhook/calendar/events`
- **Méthode**: GET

### 5. Google Sheets - Get Stock
- **Webhook URL**: `https://n8n.superprojetx.com/webhook/stock/get`
- **Méthode**: POST
- **Body**: `{ "spreadsheetId": "xxx", "range": "Stock!A:F" }`

## 🚀 Configuration

### Variables d'environnement du frontend

Dans Hostinger Docker, configure le service **frontend** avec :

```
REACT_APP_USE_N8N=true
REACT_APP_N8N_URL=https://n8n.superprojetx.com
REACT_APP_N8N_API_KEY=votre_cle_api_n8n
```

### Workflows n8n

1. Crée un workflow "SafeApp - Google Tasks"
2. Trigger: Webhook
3. Node Google Tasks: Get Many
4. Return data

Exemple de workflow simple pour Tasks:
```json
{
  "name": "SafeApp - Get Tasks",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "tasks/get",
        "responseMode": "lastNode"
      }
    },
    {
      "type": "n8n-nodes-base.googleTasks",
      "parameters": {
        "operation": "getAll",
        "taskList": "={{ $body.listId }}"
      }
    }
  ]
}
```

## ✅ Avantages

- ✅ Utilise tes credentials Google déjà configurés dans n8n
- ✅ Pas besoin de gérer l'authentification OAuth2 dans le Dashboard
- ✅ n8n gère déjà les tokens et le refresh
- ✅ Plus simple à maintenir

## 📝 TODO

Tu veux que je :
1. Modifie le frontend pour appeler n8n ?
2. Crée les workflows n8n prêts à importer ?

Donne-moi l'URL de ton n8n et je prépare tout !
