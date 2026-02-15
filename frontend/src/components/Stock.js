import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  Search,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import ApiService from '../services/api';

function Stock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState({
    spreadsheetId: localStorage.getItem('stock_spreadsheet_id') || '',
    range: localStorage.getItem('stock_range') || 'Stock!A:F'
  });
  const [showConfig, setShowConfig] = useState(false);

  const loadStock = async () => {
    if (!config.spreadsheetId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await ApiService.getStock(config.spreadsheetId, config.range);
      if (data.values) {
        // Transformer les données Google Sheets
        const headers = data.values[0] || ['Référence', 'Nom', 'Quantité', 'Seuil min', 'Emplacement', 'Fournisseur'];
        const items = data.values.slice(1).map((row, index) => ({
          id: index,
          reference: row[0] || '',
          name: row[1] || '',
          quantity: parseInt(row[2]) || 0,
          minThreshold: parseInt(row[3]) || 0,
          location: row[4] || '',
          supplier: row[5] || ''
        }));
        setStock(items);
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du stock: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, [config]);

  const saveConfig = () => {
    localStorage.setItem('stock_spreadsheet_id', config.spreadsheetId);
    localStorage.setItem('stock_range', config.range);
    setShowConfig(false);
    loadStock();
  };

  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStock = stock.filter(item => item.quantity <= item.minThreshold && item.minThreshold > 0);

  const stats = {
    total: stock.length,
    totalValue: stock.reduce((sum, item) => sum + item.quantity, 0),
    lowStock: lowStock.length,
    outOfStock: stock.filter(item => item.quantity === 0).length
  };

  return (
    <div className="stock-dashboard">
      {/* Stats */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon blue">
            <Package size={24} />
          </div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">Articles en stock</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon green">
            <Package size={24} />
          </div>
          <div className="kpi-value">{stats.totalValue}</div>
          <div className="kpi-label">Quantité totale</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon orange">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-value">{stats.lowStock}</div>
          <div className="kpi-label">Stock faible</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon purple">
            <Package size={24} />
          </div>
          <div className="kpi-value">{stats.outOfStock}</div>
          <div className="kpi-label">Rupture de stock</div>
        </div>
      </div>

      {/* Configuration */}
      {showConfig && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <span className="card-title">Configuration Google Sheets</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="ID du Spreadsheet Google Sheets"
              value={config.spreadsheetId}
              onChange={(e) => setConfig({...config, spreadsheetId: e.target.value})}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="Plage (ex: Stock!A:F)"
              value={config.range}
              onChange={(e) => setConfig({...config, range: e.target.value})}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                width: '150px'
              }}
            />
            <button
              onClick={saveConfig}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent-blue)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Enregistrer
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Format attendu dans Google Sheets : Référence | Nom | Quantité | Seuil min | Emplacement | Fournisseur
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>
        <button
          onClick={loadStock}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Settings size={18} />
          Config
        </button>
      </div>

      {/* Stock List */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            Chargement...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#ef4444' }}>
            {error}
          </div>
        ) : !config.spreadsheetId ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Configurez d'abord votre Google Sheets</p>
            <button
              onClick={() => setShowConfig(true)}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent-blue)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Configurer
            </button>
          </div>
        ) : filteredStock.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            Aucun article trouvé
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Référence</th>
                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Nom</th>
                <th style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Quantité</th>
                <th style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Seuil</th>
                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Emplacement</th>
                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Fournisseur</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>{item.reference}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: item.quantity === 0 ? 'rgba(239, 68, 68, 0.15)' : 
                                  item.quantity <= item.minThreshold ? 'rgba(249, 115, 22, 0.15)' : 
                                  'rgba(34, 197, 94, 0.15)',
                      color: item.quantity === 0 ? '#ef4444' : 
                             item.quantity <= item.minThreshold ? '#f97316' : 
                             '#22c55e'
                    }}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>{item.minThreshold}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.location}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Stock;