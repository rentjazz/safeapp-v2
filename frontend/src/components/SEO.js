import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  MousePointer, 
  Eye, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
import ApiService from '../services/api';

const sites = [
  { id: 'safehdf', name: 'safehdf.com', url: 'sc-domain:safehdf.com', flag: '🇫🇷' },
  { id: 'coffrefort', name: 'coffrefort.safehdf.com', url: 'sc-domain:coffrefort.safehdf.com', flag: '🇫🇷' },
  { id: 'safehdfbe', name: 'safehdf.be', url: 'sc-domain:safehdf.be', flag: '🇧🇪' },
];

function SEO() {
  const [activeSite, setActiveSite] = useState(sites[0]);
  const [sitesList, setSitesList] = useState([]);
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (activeSite) {
      loadSearchData();
    }
  }, [activeSite]);

  const loadSites = async () => {
    try {
      const data = await ApiService.getSearchConsoleSites();
      if (data.siteEntry) {
        setSitesList(data.siteEntry);
      }
    } catch (err) {
      console.error('Erreur sites:', err);
    }
  };

  const loadSearchData = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await ApiService.getSearchConsoleData(
        activeSite.url,
        startDate,
        endDate
      );
      setSearchData(data);
    } catch (err) {
      setError('Erreur chargement données SEO: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!searchData || !searchData.rows) return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    
    const totalClicks = searchData.rows.reduce((sum, row) => sum + row.clicks, 0);
    const totalImpressions = searchData.rows.reduce((sum, row) => sum + row.impressions, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    const avgPosition = searchData.rows.length > 0 
      ? (searchData.rows.reduce((sum, row) => sum + row.position, 0) / searchData.rows.length).toFixed(1)
      : 0;

    return { clicks: totalClicks, impressions: totalImpressions, ctr: avgCtr, position: avgPosition };
  };

  const stats = calculateStats();

  return (
    <div className="seo-dashboard">
      {/* Site Selector */}
      <div className="site-tabs">
        {sites.map((site) => (
          <button
            key={site.id}
            className={`site-tab ${activeSite.id === site.id ? 'active' : ''}`}
            onClick={() => setActiveSite(site)}
          >
            <span style={{ marginRight: '8px' }}>{site.flag}</span>
            {site.name}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon blue">
            <MousePointer size={24} />
          </div>
          <div className="kpi-value">{stats.clicks.toLocaleString()}</div>
          <div className="kpi-label">Clics (28j)</div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon purple">
            <Eye size={24} />
          </div>
          <div className="kpi-value">{stats.impressions.toLocaleString()}</div>
          <div className="kpi-label">Impressions (28j)</div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon orange">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-value">{stats.ctr}%</div>
          <div className="kpi-label">CTR moyen</div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon green">
            <Search size={24} />
          </div>
          <div className="kpi-value">{stats.position}</div>
          <div className="kpi-label">Position moyenne</div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          Chargement des données SEO...
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Charts placeholder */}
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Données Search Console</h3>
              </div>
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <TrendingUp size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Données chargées depuis Google Search Console</p>
                <p style={{ marginTop: '8px', fontSize: '13px' }}>
                  {searchData?.rows?.length || 0} lignes de données
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">État des sites</span>
                <Globe size={18} color="var(--text-secondary)" />
              </div>
              {sites.map((site) => (
                <div key={site.id} className="list-item">
                  <div className="list-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div className="list-content">
                    <div className="list-title">{site.name}</div>
                    <div className="list-meta">Configuration Search Console</div>
                  </div>
                  <span style={{ 
                    background: 'rgba(34, 197, 94, 0.15)', 
                    color: '#22c55e',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    Configuré
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SEO;