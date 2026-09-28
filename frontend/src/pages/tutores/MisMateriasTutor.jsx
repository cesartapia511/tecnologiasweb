import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tutoresService, tutoriasService, solicitudesMateriasService, materiasService } from '../../services/dataServices';
import { BookOpen, Users, CalendarDays, BarChart2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MisMateriasTutor = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [materiasData, setMateriasData] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [todasMaterias, setTodasMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedDia, setSelectedDia] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
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
        // 4. Fetch solicitudes
        const misSolicitudes = await solicitudesMateriasService.getAll();
        setSolicitudes(misSolicitudes);

        // 5. Fetch todas las materias para el select
        const allMaterias = await materiasService.getAll();
        
        // Filtramos las materias que ya tiene asignadas
        const materiasDisponibles = allMaterias.filter(
          m => !misMaterias.some(asignada => asignada.id_materia === m.id_materia)
        );
        setTodasMaterias(materiasDisponibles);

        setMateriasData(datosCruzados);
      } catch (error) {
        console.error('Error al cargar materias del tutor:', error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (user?.id_tutor) {
      loadData();
    }
  }, [user]);

  const handleRequestMateria = async (e) => {
    e.preventDefault();
    if (!selectedMateria || !selectedDia || !selectedTurno) {
      showError('Debe completar todos los campos');
      return;
    }
    
    setRequesting(true);
    try {
      await solicitudesMateriasService.create(selectedMateria, selectedDia, selectedTurno);
      showSuccess('Solicitud enviada correctamente');
      setSelectedMateria('');
      setSelectedDia('');
      setSelectedTurno('');
      loadData(); // recargar
    } catch (err) {
      showError(err.response?.data?.mensaje || err.message);
    } finally {
      setRequesting(false);
    }
  };

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
      </div>

      {materiasData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', marginBottom: '2rem' }}>
          <BookOpen size={48} color="var(--upds-blue)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No tienes materias asignadas</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Las materias son asignadas exclusivamente por la administración. Puedes enviar una solicitud en la parte inferior o contactar a tu coordinador.
          </p>
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

      {/* SECCIÓN DE SOLICITUDES DE MATERIAS */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-color)' }}>
          Solicitudes de Materias
        </h2>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Solicitar Nueva Materia</h3>
          <form onSubmit={handleRequestMateria} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Selecciona una materia</label>
              <select 
                className="form-control" 
                value={selectedMateria} 
                onChange={(e) => setSelectedMateria(e.target.value)}
                required
              >
                <option value="">-- Elige una materia --</option>
                {todasMaterias.map(m => (
                  <option key={m.id_materia} value={m.id_materia}>
                    {m.nombre_materia} ({m.nombre_carrera || 'General'})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Día</label>
              <select 
                className="form-control" 
                value={selectedDia} 
                onChange={(e) => setSelectedDia(e.target.value)}
                required
              >
                <option value="">-- Día --</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miercoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sabado">Sábado</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Turno</label>
              <select 
                className="form-control" 
                value={selectedTurno} 
                onChange={(e) => setSelectedTurno(e.target.value)}
                required
              >
                <option value="">-- Turno --</option>
                <option value="Mañana">Mañana (07:30 - 10:30)</option>
                <option value="Mediodía">Mediodía (11:00 - 14:00)</option>
                <option value="Tarde">Tarde (15:00 - 18:00)</option>
                <option value="Noche">Noche (19:00 - 22:00)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={requesting || !selectedMateria || !selectedDia || !selectedTurno}>
              {requesting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>
        </div>

        {solicitudes.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Día</th>
                  <th>Horario</th>
                  <th>Fecha de Solicitud</th>
                  <th>Estado</th>
                  <th>Fecha de Resolución</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map(sol => (
                  <tr key={sol.id_solicitud}>
                    <td style={{ fontWeight: 500 }}>{sol.nombre_materia}</td>
                    <td>{sol.dia_semana}</td>
                    <td>{sol.hora_inicio?.slice(0,5)} - {sol.hora_fin?.slice(0,5)}</td>
                    <td>{new Date(sol.fecha_solicitud).toLocaleDateString()}</td>
                    <td>
                      {sol.estado === 'pendiente' && <span style={{ color: 'var(--upds-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16}/> Pendiente</span>}
                      {sol.estado === 'aprobada' && <span style={{ color: 'var(--upds-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16}/> Aprobada</span>}
                      {sol.estado === 'rechazada' && <span style={{ color: 'var(--upds-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={16}/> Rechazada</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {sol.fecha_resolucion ? new Date(sol.fecha_resolucion).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
