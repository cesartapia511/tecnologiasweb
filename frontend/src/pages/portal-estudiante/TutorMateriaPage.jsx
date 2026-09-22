import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tutoresService, materiasService } from '../../services/dataServices';
import { ArrowLeft, UserCheck, Star, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TutorMateriaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEstudiante } = useAuth();
  
  const [tutores, setTutores] = useState([]);
  const [materia, setMateria] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [materiaData, tutoresData] = await Promise.all([
          materiasService.getById(id),
          tutoresService.getAll()
        ]);
        
        setMateria(materiaData || null);
        
        // Filtrar solo los tutores que imparten esta materia
        const tutoresFiltrados = (tutoresData || []).filter(t => 
          t.materias && t.materias.some(m => String(m.id_materia) === String(id))
        );
        
        setTutores(tutoresFiltrados);
      } catch (error) {
        console.error('Error cargando tutores de la materia', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando tutores...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => navigate('/mis-materias')}
            style={{ marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Volver a Mis Materias
          </button>
          <h1 className="page-title">Tutores Disponibles</h1>
          <p className="page-description">
            Cuerpo docente tutor asignado a la asignatura <strong>{materia?.nombre_materia}</strong>
          </p>
        </div>
      </div>

      {tutores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <UserCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>Sin tutores asignados</h3>
          <p style={{ color: 'var(--text-muted)' }}>Actualmente no hay tutores disponibles para esta materia.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {tutores.map(tutor => (
            <div key={tutor.id_tutor} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '50px', height: '50px', 
                  borderRadius: '50%', background: 'var(--upds-blue)', 
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 'bold'
                }}>
                  {tutor.nombre.charAt(0)}{tutor.apellido.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Lic. {tutor.nombre} {tutor.apellido}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tutor.especialidad}</div>
                </div>
              </div>
              
              <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                  {tutor.biografia || 'Docente tutor de la UPDS Sede Tarija.'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--upds-gold-hover)' }}>
                  <Star size={16} fill="var(--upds-gold)" color="var(--upds-gold)" />
                  {tutor.calificacion_promedio} ({tutor.total_evaluaciones} evaluaciones)
                </div>
              </div>

              {isEstudiante && (
                <button 
                  className="btn btn-primary w-100" 
                  style={{ justifyContent: 'center' }}
                  onClick={() => navigate(`/tutorias?solicitar=${materia.id_materia}&tutor=${tutor.id_tutor}`)}
                >
                  <CalendarPlus size={18} />
                  <span>Agendar Tutoría</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
