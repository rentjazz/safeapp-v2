import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Flag,
  Check,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ApiService from '../services/api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [taskLists, setTaskLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTaskLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      loadTasks();
    }
  }, [selectedList]);

  const loadTaskLists = async () => {
    try {
      const data = await ApiService.getTaskLists();
      if (data.items) {
        setTaskLists(data.items);
        // Sélectionner la première liste par défaut
        if (data.items.length > 0 && !selectedList) {
          setSelectedList(data.items[0].id);
        }
      }
    } catch (err) {
      setError('Erreur lors du chargement des listes: ' + err.message);
    }
  };

  const loadTasks = async () => {
    if (!selectedList) return;
    
    try {
      setLoading(true);
      const data = await ApiService.getTasks(selectedList);
      if (data.items) {
        // Trier: non complétées d'abord, puis par date
        const sorted = data.items.sort((a, b) => {
          if (a.status === b.status) {
            return new Date(b.updated) - new Date(a.updated);
          }
          return a.status === 'completed' ? 1 : -1;
        });
        setTasks(sorted);
      } else {
        setTasks([]);
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des tâches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      const updatedTask = {
        ...task,
        status: task.status === 'completed' ? 'needsAction' : 'completed'
      };
      await ApiService.updateTask(selectedList, task.id, updatedTask);
      loadTasks();
    } catch (err) {
      console.error('Erreur update:', err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await ApiService.deleteTask(selectedList, taskId);
      loadTasks();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const addTask = async () => {
    if (newTask.trim() && selectedList) {
      try {
        const task = {
          title: newTask,
          status: 'needsAction'
        };
        await ApiService.createTask(selectedList, task);
        setNewTask('');
        setShowAddForm(false);
        loadTasks();
      } catch (err) {
        console.error('Erreur création:', err);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'pending') return task.status !== 'completed';
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button onClick={loadTasks} style={{
          padding: '12px 24px',
          borderRadius: '10px',
          border: 'none',
          background: 'var(--accent-blue)',
          color: 'white',
          cursor: 'pointer'
        }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="tasks-dashboard">
      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card blue">
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">Total tâches</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-value">{stats.completed}</div>
          <div className="kpi-label">Terminées</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-value">{stats.pending}</div>
          <div className="kpi-label">En attente</div>
        </div>
      </div>

      {/* List Selector */}
      <div className="card" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Liste :</span>
          <select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          >
            {taskLists.map(list => (
              <option key={list.id} value={list.id}>{list.title}</option>
            ))}
          </select>
          <button
            onClick={loadTasks}
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
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="site-tabs" style={{ marginBottom: '24px' }}>
        <button 
          className={`site-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes ({stats.total})
        </button>
        <button 
          className={`site-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          En attente ({stats.pending})
        </button>
        <button 
          className={`site-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Terminées ({stats.completed})
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm ? (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nouvelle tâche..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <button
              onClick={addTask}
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
              Ajouter
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button className="add-task-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={20} />
          Ajouter une tâche
        </button>
      )}

      {/* Tasks List */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            Chargement des tâches...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            <Check size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Aucune tâche {filter === 'completed' ? 'terminée' : filter === 'pending' ? 'en attente' : ''}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-item">
              <div 
                className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                onClick={() => toggleTask(task)}
              >
                {task.status === 'completed' && <Check size={14} color="white" />}
              </div>
              <div className="task-content">
                <div className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                  {task.title}
                </div>
                {task.due && (
                  <div className="task-date">
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Échéance: {formatDate(task.due)}
                  </div>
                )}
                {task.notes && (
                  <div className="task-date" style={{ marginTop: '4px' }}>
                    {task.notes}
                  </div>
                )}
              </div>
              <button 
                className="list-action"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Sync Info */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Synchronisation Google Tasks</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Connecté à Google Tasks • Données en temps réel
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Connecté
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;