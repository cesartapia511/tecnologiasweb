import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService, tutoriasService } from '../../services/dataServices';
import { StatusBadge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  PlusCircle,
  CalendarDays,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAdmin, isDocente, isEstudiante } = useAuth();
  const [stats, setStats] = useState(null);
  const [tutoriasTutor, setTutoriasTutor] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (isDocente && user?.id_tutor) {
        params.id_tutor = user.id_tutor;
      } else if (isEstudiante && user?.id_estudiante) {
        params.id_estudiante = user.id_estudiante;
      }
      
      const data = await dashboardService.getStats(params);
      setStats(data);

      if (isDocente) {
        const allTutorias = await tutoriasService.getAll();
        setTutoriasTutor(allTutorias);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isDocente, isEstudiante, user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Cálculos específicos para el Tutor
  const estudiantesAtendidos = isDocente 
    ? new Set(tutoriasTutor.map(t => t.id_estudiante)).size 
    : 0;

  const proximasTutorias = isDocente 
    ? tutoriasTutor.filter(t => t.estado === 'confirmada').slice(0, 5) 
    : [];

  return (
    <div>
      {/* Banner Institucional con identidad UPDS Tarija */}
      <div className="upds-banner">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--upds-gold)', fontWeight: 700 }}>● UPDS Sede Tarija</span>
            <span>&bull;</span>
            <span>Gestión Académica de Tutorías</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            Bienvenido(a), {user?.nombre} {user?.apellido}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.88)', maxWidth: '680px', fontSize: '0.95rem' }}>
            {isAdmin && 'Supervisión integral de asignaturas, cuerpo docente tutor y sesiones de reforzamiento académico.'}
            {isDocente && 'Panel de Acompañamiento Pedagógico. Gestiona tus horarios de atención y el avance de los estudiantes tutorados.'}
            {isEstudiante && `Estudiante de ${user?.nombre_carrera || 'Ingeniería de Sistemas'}. Consulta tutores disponibles y agenda sesiones de reforzamiento.`}
          </p>
        </div>
      </div>

      {/* Grid de Tarjetas / Estadísticas */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: isDocente ? 'repeat(auto-fit, minmax(220px, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        {isAdmin && (
          <>
            <div className="stat-card primary">
              <div>
                <div className="stat-value">{stats?.total_usuarios || 0}</div>
                <div className="stat-label">Usuarios Registrados</div>
              </div>
              <div className="stat-icon-wrapper primary">
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card danger">
              <div>
                <div className="stat-value">{stats?.total_materias || 0}</div>
                <div className="stat-label">Materias Ofertadas</div>
              </div>
              <div className="stat-icon-wrapper danger">
                <BookOpen size={24} />
              </div>
            </div>

            <div className="stat-card warning">
              <div>
                <div className="stat-value">{stats?.tutorias?.pendientes || 0}</div>
                <div className="stat-label">Tutorías Pendientes</div>
              </div>
              <div className="stat-icon-wrapper warning">
                <Clock size={24} />
              </div>
            </div>

            <div className="stat-card success">
              <div>
                <div className="stat-value">{stats?.tutorias?.realizadas || 0}</div>
                <div className="stat-label">Tutorías Realizadas</div>
              </div>
              <div className="stat-icon-wrapper success">
                <CheckCircle size={24} />
              </div>
            </div>
          </>
        )}

        {isDocente && (
          <>
            <div className="stat-card warning">
              <div>
                <div className="stat-value">{stats?.tutorias?.pendientes || 0}</div>
                <div className="stat-label">Tutorías Pendientes</div>
              </div>
              <div className="stat-icon-wrapper warning">
                <Clock size={24} />
              </div>
            </div>

            <div className="stat-card primary">
              <div>
                <div className="stat-value">{stats?.tutorias?.confirmadas || 0}</div>
                <div className="stat-label">Tutorías Próximas</div>
              </div>
              <div className="stat-icon-wrapper primary">
                <CalendarCheck size={24} />
              </div>
            </div>

            <div className="stat-card success">
              <div>
                <div className="stat-value">{stats?.tutorias?.realizadas || 0}</div>
                <div className="stat-label">Tutorías Realizadas</div>
              </div>
              <div className="stat-icon-wrapper success">
                <CheckCircle size={24} />
              </div>
            </div>

            <div className="stat-card danger">
              <div>
                <div className="stat-value">{stats?.tutorias?.canceladas || 0}</div>
                <div className="stat-label">Tutorías Canceladas</div>
              </div>
              <div className="stat-icon-wrapper danger">
                <XCircle size={24} />
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--upds-blue)', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-value" style={{ fontSize: '1.8rem', fontWeight: '700' }}>{estudiantesAtendidos}</div>
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estudiantes Atendidos</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(0,51,160,0.1)', color: 'var(--upds-blue)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--upds-gold)', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.8rem', fontWeight: '700' }}>
                  <span>{stats?.promedio_satisfaccion ? Number(stats.promedio_satisfaccion).toFixed(1) : '0.0'}</span>
                  <Star size={20} fill="var(--upds-gold)" color="var(--upds-gold)" style={{marginTop: '-2px'}}/>
                </div>
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Promedio de Evaluación</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(255,184,28,0.1)', color: 'var(--upds-gold)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Star size={24} />
              </div>
            </div>
          </>
        )}

        {isEstudiante && (
          <>
            <div className="stat-card primary">
              <div>
                <div className="stat-value">{stats?.tutorias?.total || 0}</div>
                <div className="stat-label">Mis Solicitudes Totales</div>
              </div>
              <div className="stat-icon-wrapper primary">
                <CalendarDays size={24} />
              </div>
            </div>

            <div className="stat-card warning">
              <div>
                <div className="stat-value">{stats?.tutorias?.pendientes || 0}</div>
                <div className="stat-label">Esperando Confirmación</div>
              </div>
              <div className="stat-icon-wrapper warning">
                <Clock size={24} />
              </div>
            </div>

            <div className="stat-card success">
              <div>
                <div className="stat-value">{stats?.tutorias?.realizadas || 0}</div>
                <div className="stat-label">Tutorías Recibidas</div>
              </div>
              <div className="stat-icon-wrapper success">
                <CheckCircle size={24} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Gráficos y Estadísticas Avanzadas para Tutor */}
      {isDocente && stats?.tutorias && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Gráfico 1: Tutorías por Estado */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--upds-blue-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--upds-gold)" />
              Tutorías por Estado
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Realizadas', count: stats.tutorias.realizadas, color: 'var(--upds-green)', bg: 'rgba(34, 197, 94, 0.2)' },
                { label: 'Confirmadas', count: stats.tutorias.confirmadas, color: 'var(--upds-blue)', bg: 'rgba(0, 51, 160, 0.2)' },
                { label: 'Pendientes', count: stats.tutorias.pendientes, color: 'var(--upds-gold)', bg: 'rgba(255, 184, 28, 0.2)' },
                { label: 'Canceladas', count: stats.tutorias.canceladas, color: 'var(--upds-red)', bg: 'rgba(239, 68, 68, 0.2)' },
              ].map(item => {
                const percentage = stats.tutorias.total > 0 ? (item.count / stats.tutorias.total) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>
                      <span>{item.label}</span>
                      <span>{item.count}</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: item.color, borderRadius: '6px', transition: 'width 1s ease-in-out' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico 2: Tutorías por Mes (Calculado en base a tutoriasTutor) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--upds-blue-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={20} color="var(--upds-gold)" />
              Actividad Mensual (Últimos 6 Meses)
            </h3>
            
            {(() => {
              // Calcular los últimos 6 meses
              const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
              const currentMonth = new Date().getMonth();
              
              const last6Months = [];
              const dataPoints = [];
              
              for (let i = 5; i >= 0; i--) {
                let m = currentMonth - i;
                if (m < 0) m += 12;
                last6Months.push({ index: m, label: months[m] });
                dataPoints.push(0);
              }

              // Contar tutorias en esos meses
              tutoriasTutor.forEach(t => {
                if (t.fecha) {
                  const tMonth = parseInt(t.fecha.split('-')[1], 10) - 1;
                  const foundIndex = last6Months.findIndex(m => m.index === tMonth);
                  if (foundIndex !== -1) {
                    dataPoints[foundIndex]++;
                  }
                }
              });

              const maxCount = Math.max(...dataPoints, 1); // Evitar dividir por cero

              return (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingBottom: '1rem', paddingTop: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  {last6Months.map((m, idx) => {
                    const count = dataPoints[idx];
                    const heightPercent = (count / maxCount) * 100;
                    
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--upds-blue-dark)' }}>{count}</span>
                        <div style={{ width: '24px', height: '120px', background: '#e2e8f0', borderRadius: '4px', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${heightPercent}%`, background: 'var(--upds-blue)', borderRadius: '4px', transition: 'height 1s ease-in-out' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Acciones Rápidas para Estudiante */}
      {isEstudiante && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--upds-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>¿Necesitas ayuda con alguna materia?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Encuentra al docente tutor ideal para tu asignatura y agenda una sesión en sus horarios disponibles.
              </p>
            </div>
            <Link to="/tutorias" className="btn btn-danger">
              <PlusCircle size={18} />
              <span>Solicitar Nueva Tutoría</span>
            </Link>
          </div>
        </div>
      )}

      {/* Sección exclusiva para el Docente: Próximas Tutorías */}
      {isDocente && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header-clean">
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Próximas Tutorías</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tus próximas sesiones confirmadas
              </span>
            </div>
            <Link to="/tutorias" className="btn btn-outline btn-sm">
              Ver todas mis tutorías
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Cargando datos...
            </div>
          ) : proximasTutorias.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Materia</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Modalidad</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proximasTutorias.map((tut) => (
                    <tr key={tut.id_tutoria}>
                      <td>
                        {tut.estudiante_nombre} {tut.estudiante_apellido}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--upds-blue)' }}>
                        {tut.nombre_materia}
                      </td>
                      <td>{tut.fecha}</td>
                      <td>{tut.hora_inicio.slice(0, 5)}</td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>{tut.modalidad}</span>
                      </td>
                      <td>
                        <StatusBadge status={tut.estado} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to="/tutorias" className="btn btn-primary btn-sm">
                          Ver tutoría
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <CalendarCheck size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
              <p>No tienes tutorías próximas confirmadas.</p>
            </div>
          )}
        </div>
      )}

      {/* Tabla de Actividad Reciente para Administrador, Estudiante y Tutor */}
      <div className="card">
        <div className="card-header-clean">
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>
              {isEstudiante ? 'Mis Solicitudes de Tutoría' : 'Últimas Tutorías Registradas'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Actualizado en tiempo real desde la base de datos
            </span>
          </div>
          <Link to="/tutorias" className="btn btn-outline btn-sm">
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Cargando datos...
          </div>
        ) : stats?.tutorias_recientes?.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>{isDocente ? 'Estudiante' : 'Docente Tutor'}</th>
                  <th>Fecha y Hora</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.tutorias_recientes.map((tut) => (
                  <tr key={tut.id_tutoria}>
                    <td style={{ fontWeight: 600, color: 'var(--upds-blue)' }}>
                      {tut.nombre_materia}
                    </td>
                    <td>
                      {isDocente
                        ? `${tut.estudiante_nombre} ${tut.estudiante_apellido}`
                        : `${tut.tutor_nombre} ${tut.tutor_apellido}`}
                    </td>
                    <td>
                      {tut.fecha} a las {tut.hora_inicio.slice(0, 5)}
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{tut.modalidad}</span>
                    </td>
                    <td>
                      <StatusBadge status={tut.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No hay registros de tutorías recientes en este momento.
          </div>
        )}
      </div>
    </div>
  );
};

