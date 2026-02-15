import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import ApiService from '../services/api';

function Auth({ onAuthChange }) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await ApiService.getAuthStatus();
      setIsConnected(status.connected);
      onAuthChange(status.connected);
    } catch (error) {
      console.error('Erreur auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const { url } = await ApiService.getAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Erreur connexion:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await ApiService.logout();
      setIsConnected(false);
      onAuthChange(false);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          Vérification de l'authentification...
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="card" style={{ marginBottom: '24px', background: 'rgba(34, 197, 94, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e'
          }}>
            <Unlock size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Connecté à Google</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Vos données Google Tasks, Calendar, Search Console et Sheets sont accessibles
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '24px', background: 'rgba(239, 68, 68, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444'
        }}>
          <Lock size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Authentification requise</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Connectez-vous avec Google pour accéder à Tasks, Calendar, Search Console et Sheets
          </div>
        </div>
        <button
          onClick={handleConnect}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--accent-blue)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ExternalLink size={18} />
          Se connecter
        </button>
      </div>
      
      <div style={{ 
        margin: '0 16px 16px 16px', 
        padding: '12px 16px', 
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'var(--text-secondary)'
      }}>
        <AlertCircle size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        Vous devez autoriser l'accès à Google Tasks, Calendar, Search Console et Sheets pour utiliser toutes les fonctionnalités.
      </div>
    </div>
  );
}

export default Auth;