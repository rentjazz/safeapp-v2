import React, { useState, useEffect } from 'react';
import {
  Settings,
  CheckCircle,
  AlertCircle,
  Save,
  ExternalLink
} from 'lucide-react';
import ApiService from '../services/api';

// Debug: show API URL
const API_URL = window.APP_CONFIG?.API_URL || process.env.REACT_APP_API_URL || 'http://31.97.155.126:3000';

function Setup() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await ApiService.getConfigStatus();
      setStatus(data);
    } catch (e) {
      setStatus({ googleConfigured: false, error: true });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await ApiService.configureGoogle(clientId, clientSecret);
      if (result.googleConfigured) {
        setMessage('✅ Configuration enregistrée avec succès !');
        checkStatus();
      } else {
        setMessage('❌ Erreur: ' + (result.error || 'Configuration échouée'));
      }
    } catch (e) {
      setMessage('❌ Erreur de connexion: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <div className="card">
        {/* Debug info */}
        <div style={{ 
          padding: '12px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)'
        }}>
          API URL: {API_URL}
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'var(--gradient-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Settings size={32} color="white" />
          </div>
          <h2 style={{ marginBottom: '8px' }}>Configuration SafeApp</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configurez vos credentials Google pour connecter les APIs
          </p>
        </div>

        {/* Status */}
        <div style={{ 
          padding: '16px', 
          borderRadius: '12px',
          background: status?.googleConfigured ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {status?.googleConfigured ? (
            <>
              <CheckCircle size={24} color="#22c55e" />
              <div>
                <div style={{ fontWeight: 600, color: '#22c55e' }}>Google configuré</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Les APIs sont prêtes à être utilisées
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={24} color="#ef4444" />
              <div>
                <div style={{ fontWeight: 600, color: '#ef4444' }}>Configuration requise</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Entrez vos credentials Google ci-dessous
                </div>
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div style={{ 
          padding: '16px', 
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          <p style={{ marginBottom: '12px', fontWeight: 600 }}>
            Où trouver vos credentials ?
          </p>
          <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>Allez sur <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>Google Cloud Console <ExternalLink size={12} style={{ display: 'inline' }}/></a></li>
            <li>Sélectionnez votre projet "SafeApp"</li>
            <li>Cliquez sur "Credentials" dans le menu gauche</li>
            <li>Cliquez sur votre "OAuth 2.0 Client ID"</li>
            <li>Copiez le "Client ID" et "Client Secret"</li>
          </ol>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="123456789-xxx.apps.googleusercontent.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="GOCSPX-xxx"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              required
            />
          </div>

          {message && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '8px',
              background: message.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.includes('✅') ? '#22c55e' : '#ef4444',
              marginBottom: '16px'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '10px',
              border: 'none',
              background: loading ? 'var(--border-color)' : 'var(--accent-blue)',
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Save size={20} />
            {loading ? 'Enregistrement...' : 'Enregistrer la configuration'}
          </button>
        </form>

        {/* URLs configurées */}
        {status && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '12px' }}>URLs configurées :</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              <div>Frontend: {status.frontendUrl}</div>
              <div>Redirect: {status.redirectUri}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setup;