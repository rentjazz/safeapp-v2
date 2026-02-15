import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  MousePointer,
  Eye,
  Calendar,
  Clock,
  Briefcase,
  Phone,
  FileText,
  Euro,
  AlertCircle
} from 'lucide-react';
import ApiService from '../services/api';

function Overview({ isAuthenticated }) {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      // Charger les listes de tâches
      const listsData = await ApiService.getTaskLists();
      if (listsData.items && listsData.items.length > 0) {
        const firstList = listsData.items[0];
        const tasksData = await ApiService.getTasks(firstList.id);
        if (tasksData.items) {
          // Trier et prendre les 5 plus récentes non complétées
          const pending = tasksData.items
            .filter(t => t.status !== 'completed')
            .slice(0, 5);
          setTasks(pending);
        }
      }

      // Charger les événements du calendrier
      const now = new Date().toISOString();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const calendarData = await ApiService.getCalendarEvents(now, nextWeek);
      if (calendarData.items) {
        setEvents(calendarData.items.slice(0, 5));
      }
    } catch (err) {
      setError('Erreur de chargement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="overview">
      {!isAuthenticated && (
        <div className="card" style={{ marginBottom: '24px', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
            <AlertCircle size={24} color="#ef4444" />
            <div>
              <div style={{ fontWeight: 600 }}>Authentification requise</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Connectez-vous avec Google pour voir vos données réelles
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon blue">
            <Eye size={24} />
          </div>
          <div className="kpi-value">--</div>
          <div className="kpi-label">Visites (SEO)</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon green">
            <MousePointer size={24} />
          </div>
          <div className="kpi-value">--</div>
          <div className="kpi-label">Clics organiques</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon purple">
            <Users size={24} />
          </div>
          <div className="kpi-value">--</div>
          <div className="kpi-label">Nouveaux leads</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon orange">
            <Euro size={24} />
          </div>
          <div className="kpi-value">--</div>
          <div className="kpi-label">Devis envoyés</div>
        </div>
      </div>

      {/* Tasks & Events */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tâches prioritaires</span>
            <Clock size={18} color="var(--text-secondary)" />
          </div>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>Chargement...</div>
          ) : !isAuthenticated ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Connectez-vous pour voir vos tâches
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Aucune tâche en attente
            </div>
          ) : (
            tasks.map((task, index) => (
              <div key={index} className="list-item">
                <div className="list-icon" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
                  <FileText size={20} />
                </div>
                <div className="list-content">
                  <div className="list-title">{task.title}</div>
                  {task.due && (
                    <div className="list-meta">Échéance: {formatDate(task.due)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Prochains RDV</span>
            <Calendar size={18} color="var(--text-secondary)" />
          </div>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>Chargement...</div>
          ) : !isAuthenticated ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Connectez-vous pour voir vos rendez-vous
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Aucun rendez-vous prévu
            </div>
          ) : (
            events.map((event, index) => (
              <div key={index} className="list-item">
                <div className="list-icon" style={{ background: 'var(--gradient-blue)', color: 'white' }}>
                  <Calendar size={20} />
                </div>
                <div className="list-content">
                  <div className="list-title">{event.summary}</div>
                  <div className="list-meta">
                    {event.start.dateTime 
                      ? formatDate(event.start.dateTime)
                      : formatDate(event.start.date)
                    }
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Overview;