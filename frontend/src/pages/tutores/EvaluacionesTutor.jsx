import React, { useState, useEffect, useCallback } from 'react';
import { evaluacionesService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageSquare } from 'lucide-react';

export const EvaluacionesTutor = () => {
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvaluaciones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.getAll(user?.id_tutor);
      setEvaluaciones(data || []);
    } catch (error) {
      console.error('Error cargando evaluaciones del tutor', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id_tutor]);

  useEffect(() => {
    if (user?.id_tutor) {
      fetchEvaluaciones();
    }
  }, [fetchEvaluaciones, user?.id_tutor]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando evaluaciones...</div>;
  }

  // Calculate average rating
  const totalStars = evaluaciones.reduce((acc, curr) => acc + curr.calificacion, 0);
  const averageRating = evaluaciones.length > 0 ? (totalStars / evaluaciones.length).toFixed(1) : 0;

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Mis Evaluaciones</h1>
          <p className="page-description">Feedback y calificaciones recibidas por tus estudiantes.</p>
        </div>
        {evaluaciones.length > 0 && (
          <div style={{ background: 'var(--upds-gold-subtle)', border: '1px solid var(--upds-gold)', padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, textTransform: 'uppercase' }}>Promedio Global</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e', lineHeight: 1 }}>{averageRating} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>/ 5.0</span></span>
            </div>
            <Star size={32} fill="#92400e" color="#92400e" />
          </div>
        )}
      </div>

      {evaluaciones.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,184,28,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Star size={40} color="var(--upds-gold)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--upds-blue-dark)', marginBottom: '0.5rem' }}>Aún no tienes evaluaciones</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            A medida que finalices tutorías, los estudiantes podrán calificar tu desempeño y dejarte comentarios constructivos.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {evaluaciones.map((ev) => (
            <div key={ev.id_evaluacion} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--upds-blue-dark)', fontSize: '1.1rem' }}>{ev.nombre_materia}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Estudiante: <strong>{ev.estudiante_nombre} {ev.estudiante_apellido}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    Fecha de tutoría: {ev.fecha}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--upds-gold)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                  <Star size={14} fill="#fff" />
                  {ev.calificacion}
                </div>
              </div>

              <div style={{ 
                flexGrow: 1, 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                padding: '1rem', 
                borderRadius: '8px',
                position: 'relative',
                marginTop: '0.5rem'
              }}>
                <MessageSquare size={16} color="#cbd5e1" style={{ position: 'absolute', top: '10px', right: '10px' }} />
                {ev.comentario ? (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5, paddingRight: '20px' }}>
                    "{ev.comentario}"
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', paddingRight: '20px' }}>
                    Sin comentario adicional.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
