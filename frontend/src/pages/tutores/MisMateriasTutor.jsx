import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tutoresService, tutoriasService } from '../../services/dataServices';
import { BookOpen, Users, CalendarDays, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MisMateriasTutor = () => {
  const { user } = useAuth();
  const [materiasData, setMateriasData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMateriasYEstadisticas = async () => {
      setLoading(true);
      try {
        // 1. Obtener el perfil del tutor (que contiene sus materias asignadas)
        const tutores = await tutoresService.getAll();
        const miPerfil = tutores.find(t => t.id_tutor === user?.id_tutor);
        const misMaterias = miPerfil?.materias || [];

        // 2. Obtener todas las tutorías para calcular estadísticas
        const misTutorias = await tutoriasService.getAll();

        // 3. Cruzar datos
        const datosCruzados = misMaterias.map(materia => {
          const tutoriasDeMateria = misTutorias.filter(t => t.id_materia === materia.id_materia);
          const tutoriasRealizadas = tutoriasDeMateria.filter(t => t.estado === 'realizada');
          
          // Estudiantes únicos atendidos en esta materia
          const estudiantesUnicos = new Set(tutoriasDeMateria.map(t => t.id_estudiante));
          
          return {
            ...materia,
            total_tutorias: tutoriasDeMateria.length,
            tutorias_realizadas: tutoriasRealizadas.length,
            estudiantes_atendidos: estudiantesUnicos.size
          };
        });

        setMateriasData(datosCruzados);
      } catch (error) {
        console.error('Error al cargar materias del tutor:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id_tutor) {
      loadMateriasYEstadisticas();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando tus materias y estadísticas...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Materias</h1>
          <p className="page-description">
            Resumen de las asignaturas que impartes y tus estadísticas de atención por materia.
          </p>
        </div>
        <Link to="/mi-perfil" className="btn btn-outline">
          Editar Materias Asignadas
        </Link>
      </div>

      {materiasData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <BookOpen size={48} color="var(--upds-blue)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No tienes materias asignadas</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Aún no has registrado las asignaturas en las que brindas tutorías.
          </p>
          <Link to="/mi-perfil" className="btn btn-primary">
            Asignar Materias Ahora
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {materiasData.map((materia) => (
            <div key={materia.id_materia} className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--upds-blue)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-color)', lineHeight: 1.3 }}>
                    {materia.nombre_materia}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {materia.nombre_carrera || 'Asignatura General'}
                  </div>
                </div>
                <div style={{ 
                  background: 'var(--upds-blue-subtle)', 
                  padding: '10px', 
                  borderRadius: '10px',
                  color: 'var(--upds-blue-dark)'
                }}>
                  <BookOpen size={20} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <CalendarDays size={20} color="var(--upds-red)" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>
                    {materia.total_tutorias}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tutorías Totales
                  </div>
                </div>
                
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <Users size={20} color="var(--upds-gold)" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>
                    {materia.estudiantes_atendidos}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Estudiantes
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart2 size={16} />
                  <span>{materia.tutorias_realizadas} finalizadas</span>
                </div>
                <Link 
                  to={`/tutorias?materia=${materia.id_materia}`} 
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Ver Tutorías
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
