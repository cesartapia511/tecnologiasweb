import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Bell, Check, CheckCircle, Clock, Info, AlertTriangle, XCircle } from 'lucide-react';

export const NotificacionesPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'no_leidas'

  const fetchNotificaciones = async () => {
    setLoading(true);
    try {
      // Limite 100 para la página completa
      const res = await api.get('/notificaciones/index.php?limite=100');
      if (res.success) {
        setNotificaciones(res.data.notificaciones);
      }
    } catch (error) {
      console.error("NOTIF PAGE ERROR:", error);
      showError('Error al cargar el historial de notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notificaciones/index.php', { marcar_todas: true });
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: 1 })));
      showSuccess('Todas las notificaciones han sido marcadas como leídas');
    } catch (error) {
      showError('Error al procesar la solicitud');
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.put('/notificaciones/index.php', { id_notificacion: id });
      setNotificaciones(notificaciones.map(n => n.id_notificacion === id ? { ...n, leida: 1 } : n));
    } catch (error) {
      showError('Error al marcar como leída');
    }
  };

  const getIconForType = (tipo) => {
    switch (tipo) {
      case 'success': return <CheckCircle size={24} color="var(--upds-green)" />;
      case 'warning': return <AlertTriangle size={24} color="var(--upds-gold)" />;
      case 'danger': return <XCircle size={24} color="var(--upds-red)" />;
      default: return <Info size={24} color="var(--upds-blue)" />;
    }
  };

  const filteredNotificaciones = notificaciones.filter(n => filtro === 'todas' ? true : !n.leida);

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header-clean">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell color="var(--upds-blue)" /> Centro de Notificaciones
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Historial completo de alertas, mensajes y recordatorios del sistema.
            </p>
          </div>
          <button className="btn btn-outline" onClick={handleMarkAllAsRead}>
            <Check size={18} /> Marcar todas como leídas
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setFiltro('todas')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: filtro === 'todas' ? '3px solid var(--upds-blue)' : '3px solid transparent',
              color: filtro === 'todas' ? 'var(--upds-blue)' : 'var(--text-muted)',
              fontWeight: filtro === 'todas' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Todas las notificaciones
          </button>
          <button 
            onClick={() => setFiltro('no_leidas')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: filtro === 'no_leidas' ? '3px solid var(--upds-blue)' : '3px solid transparent',
              color: filtro === 'no_leidas' ? 'var(--upds-blue)' : 'var(--text-muted)',
              fontWeight: filtro === 'no_leidas' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            No leídas
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando notificaciones...</div>
        ) : filteredNotificaciones.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
            <Bell size={48} color="var(--border-color)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--text-muted)' }}>No tienes notificaciones {filtro === 'no_leidas' ? 'pendientes' : ''}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Te avisaremos cuando haya novedades en tus tutorías o cuenta.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredNotificaciones.map(notif => (
              <div 
                key={notif.id_notificacion}
                onClick={() => handleMarkAsRead(notif.id_notificacion, notif.leida)}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: notif.leida ? 'white' : 'var(--upds-blue-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: notif.leida ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: notif.leida ? 'none' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '50%', 
                  background: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  flexShrink: 0
                }}>
                  {getIconForType(notif.tipo)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--upds-blue-dark)' }}>{notif.titulo}</h4>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <Clock size={12} />
                      {new Date(notif.fecha_creacion).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {notif.mensaje}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
