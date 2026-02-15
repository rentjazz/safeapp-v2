import React, { useState, useEffect } from 'react';
import { 
  Rss, 
  ExternalLink, 
  Clock,
  RefreshCw,
  Newspaper
} from 'lucide-react';

const mockNews = [
  {
    id: 1,
    title: 'Nouvelle norme EN 1143-1 pour les coffres-forts',
    excerpt: 'La norme européenne a été mise à jour avec de nouvelles exigences de résistance aux effractions.',
    source: 'Fédération Serruriers',
    date: '2026-02-14T10:30:00',
    category: 'Réglementation',
    emoji: '📋'
  },
  {
    id: 2,
    title: 'Fichet Bauche lance sa nouvelle gamme connectée',
    excerpt: 'Coffres-forts équipés de serrures électroniques haute sécurité avec monitoring.',
    source: 'BatiActu',
    date: '2026-02-13T14:15:00',
    category: 'Produits',
    emoji: '🔐'
  },
  {
    id: 3,
    title: 'Hausse des cambriolages : demande en forte hausse',
    excerpt: 'Les demandes d\'installation de coffres-forts ont augmenté de 23% sur l\'année.',
    source: 'Le Figaro',
    date: '2026-02-12T09:00:00',
    category: 'Actualité',
    emoji: '📈'
  },
];

const categories = {
  'Réglementation': '#4facfe',
  'Produits': '#8b5cf6',
  'Actualité': '#22c55e',
  'Conseils': '#f97316',
  'Événement': '#ec4899',
  'Alerte': '#ef4444'
};

function News() {
  const [news, setNews] = useState(mockNews);
  const [filter, setFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.category === filter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="news-dashboard">
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(79, 172, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4facfe'
            }}>
              <Rss size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>
                Flux d'actualités
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Dernière mise à jour : {formatDate(lastUpdate.toISOString())}
              </div>
            </div>
          </div>
          <button
            onClick={() => setLastUpdate(new Date())}
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
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="site-tabs" style={{ marginBottom: '24px' }}>
        <button 
          className={`site-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tout
        </button>
        {Object.keys(categories).map(cat => (
          <button 
            key={cat}
            className={`site-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="news-grid">
        {filteredNews.map((item) => (
          <div key={item.id} className="news-card">
            <div 
              className="news-image" 
              style={{ 
                background: `linear-gradient(135deg, ${categories[item.category]}40 0%, ${categories[item.category]}20 100%)`,
                borderBottom: `3px solid ${categories[item.category]}`,
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '64px' }}>{item.emoji}</span>
            </div>
            <div className="news-content" style={{ padding: '20px' }}>
              <div style={{ color: categories[item.category], fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                {item.category} • {item.source}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                {item.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {formatDate(item.date)}
                </span>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px'
                }}>
                  Lire <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
          <Newspaper size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>Aucune actualité dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}

export default News;