import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tutoriasService } from '../../services/dataServices';
import { Users, GraduationCap, Calendar, Mail, Info } from 'lucide-react';

export const MisEstudiantesTutorPage = () => {
  const { user } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEstudiantes = async () => {
      setLoading(true);
      try {
        // Obtener todas las tutorías del tutor actual
        const tutorias = await tutoriasService.getAll();
        
        // Agrupar tutorías por estudiante
        const mapEstudiantes = new Map();

        tutorias.forEach(tutoria => {
          const id = tutoria.id_estudiante;
          if (!mapEstudiantes.has(id)) {
            mapEstudiantes.set(id, {
              id_estudiante: id,
              nombre: tutoria.estudiante_nombre,
              apellido: tutoria.estudiante_apellido,
              correo: tutoria.estudiante_correo,
              registro_universitario: tutoria.registro_universitario,
              tutoriasTotales: 0,
              tutoriasRealizadas: 0,
              ultimaTutoria: null,
            });
          }
          
          const est = mapEstudiantes.get(id);
          est.tutoriasTotales += 1;
          
          if (tutoria.estado === 'realizada') {
            est.tutoriasRealizadas += 1;
          }

          // Determinar la última tutoría
          const tutDate = new Date(`${tutoria.fecha}T${tutoria.hora_inicio}`);
          if (!est.ultimaTutoria || tutDate > est.ultimaTutoria.dateObj) {
            est.ultimaTutoria = {
              fecha: tutoria.fecha,
              materia: tutoria.nombre_materia,
              dateObj: tutDate
            };
          }
        });

        // Convertir Map a Array y ordenar por cantidad de tutorías
        const listaEstudiantes = Array.from(mapEstudiantes.values()).sort((a, b) => b.tutoriasTotales - a.tutoriasTotales);
        setEstudiantes(listaEstudiantes);

      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id_tutor) {
      loadEstudiantes();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando lista de estudiantes...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Estudiantes</h1>
          <p className="page-description">
            Directorio de estudiantes que han agendado sesiones de tutoría contigo. Esta vista es únicamente de consulta.
          </p>
        </div>
      </div>

      {estudiantes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Users size={48} color="var(--upds-blue)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No tienes estudiantes todavía</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Los estudiantes aparecerán aquí una vez que soliciten sesiones de tutoría contigo.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header-clean">
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Estudiantes Atendidos ({estudiantes.length})</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Info size={16} />
              <span>Ordenados por cantidad de tutorías</span>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>RU / Contacto</th>
                  <th style={{ textAlign: 'center' }}>Total Tutorías</th>
                  <th>Última Sesión Registrada</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est) => (
                  <tr key={est.id_estudiante}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--upds-blue-subtle)',
                          color: 'var(--upds-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {est.nombre.charAt(0)}{est.apellido.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                            {est.nombre} {est.apellido}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID Estudiante: #{est.id_estudiante}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <GraduationCap size={14} color="var(--upds-red)" />
                          <span>RU: <strong>{est.registro_universitario || 'No disponible'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Mail size={14} />
                          <span>{est.correo || 'Sin correo'}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ 
                          background: 'var(--upds-gold)', 
                          color: '#fff', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {est.tutoriasTotales}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ({est.tutoriasRealizadas} completadas)
                        </span>
                      </div>
                    </td>
                    
                    <td>
                      {est.ultimaTutoria ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Calendar size={16} style={{ color: 'var(--upds-blue)', marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {est.ultimaTutoria.fecha}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Materia: {est.ultimaTutoria.materia}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin fecha</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
