import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tutoriasService } from '../../services/dataServices';
import { Calendar as CalendarIcon, Clock, MapPin, Video, User } from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';
import { CalendarioTutor } from '../tutores/CalendarioTutor';

const CalendarioEstudiante = () => {
  const { user } = useAuth();
  const [proximasTutorias, setProximasTutorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorias = async () => {
      setLoading(true);
      try {
        const data = await tutoriasService.getAll({ id_estudiante: user?.id_estudiante });
        // Filtrar solo las confirmadas (próximas) y ordenarlas por fecha
        const proximas = (data || [])
          .filter(t => t.estado === 'confirmada' || t.estado === 'pendiente')
          .sort((a, b) => new Date(`${a.fecha}T${a.hora_inicio}`) - new Date(`${b.fecha}T${b.hora_inicio}`));
        
        setProximasTutorias(proximas);
      } catch (error) {
        console.error('Error cargando calendario', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id_estudiante) {
      fetchTutorias();
    }
  }, [user?.id_estudiante]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando calendario...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Calendario</h1>
          <p className="page-description">Tus próximas sesiones de tutoría académica agendadas.</p>
        </div>
      </div>

      {proximasTutorias.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CalendarIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No tienes tutorías próximas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Actualmente no tienes sesiones confirmadas o pendientes en tu calendario.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {proximasTutorias.map(tutoria => (
            <div key={tutoria.id_tutoria} className="card" style={{ padding: '1.5rem', borderLeft: `5px solid ${tutoria.estado === 'confirmada' ? 'var(--upds-blue)' : 'var(--upds-gold)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--upds-blue-dark)' }}>{tutoria.nombre_materia}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.95rem', color: 'var(--text-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon size={16} color="var(--upds-red)" />
                      <span>{tutoria.fecha}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color="var(--text-muted)" />
                      <span>{tutoria.hora_inicio.slice(0, 5)} - {tutoria.hora_fin.slice(0, 5)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={16} color="var(--upds-gold)" />
                      <span>Lic. {tutoria.tutor_nombre} {tutoria.tutor_apellido}</span>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#475569', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    {tutoria.modalidad === 'virtual' ? <Video size={16} color="var(--upds-blue)" /> : <MapPin size={16} color="var(--upds-red)" />}
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{tutoria.modalidad}</span>
                    <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>|</span>
                    <span>{tutoria.lugar_o_enlace || 'Pendiente de asignación'}</span>
                  </div>
                </div>
                
                <div>
                  <StatusBadge status={tutoria.estado} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MiCalendarioPage = () => {
  const { isDocente } = useAuth();
  
  if (isDocente) {
    return <CalendarioTutor />;
  }
  
  return <CalendarioEstudiante />;
};
