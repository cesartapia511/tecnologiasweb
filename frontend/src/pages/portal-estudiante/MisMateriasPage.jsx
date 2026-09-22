import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { materiasService } from '../../services/dataServices';
import { BookOpen, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MisMateriasPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaterias = async () => {
      if (!user?.id_carrera) return;
      setLoading(true);
      try {
        const data = await materiasService.getAll(user.id_carrera);
        setMaterias(data || []);
      } catch (error) {
        console.error('Error al cargar materias:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMaterias();
  }, [user?.id_carrera]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando asignaturas de tu carrera...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Materias</h1>
          <p className="page-description">
            Plan de estudios de la carrera <strong>{user?.nombre_carrera || 'tu programa actual'}</strong>.
          </p>
        </div>
      </div>

      {materias.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={48} color="var(--upds-blue)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No se encontraron asignaturas</h3>
          <p style={{ color: 'var(--text-muted)' }}>No hay materias registradas para tu carrera actual en este momento.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {materias.map((materia) => (
            <div key={materia.id_materia} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  background: 'var(--upds-blue-subtle)', 
                  padding: '12px', 
                  borderRadius: '12px',
                  color: 'var(--upds-blue-dark)'
                }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>
                    {materia.nombre_materia}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Asignatura Troncal
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '0.5rem', justifyContent: 'center' }}
                  onClick={() => navigate(`/materias/${materia.id_materia}/tutores`)}
                  title="Ver docentes tutores asignados a esta materia"
                >
                  <Users size={16} />
                  <span>Ver Tutores</span>
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 1rem' }}
                  onClick={() => navigate(`/tutorias?solicitar=${materia.id_materia}`)}
                  title="Ir directo a solicitar tutoría"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
