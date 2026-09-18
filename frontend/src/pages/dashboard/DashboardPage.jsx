import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dataServices';
import { StatusBadge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Clock,
  CheckCircle,
  Star,
  PlusCircle,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, role, isAdmin, isDocente, isEstudiante } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="stats-grid">
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
            <div className="stat-card primary">
              <div>
                <div className="stat-value">{stats?.tutorias?.total || 0}</div>
                <div className="stat-label">Total Mis Sesiones</div>
              </div>
              <div className="stat-icon-wrapper primary">
                <CalendarCheck size={24} />
              </div>
            </div>

            <div className="stat-card warning">
              <div>
                <div className="stat-value">{stats?.tutorias?.pendientes || 0}</div>
                <div className="stat-label">Por Confirmar</div>
              </div>
              <div className="stat-icon-wrapper warning">
                <Clock size={24} />
              </div>
            </div>

            <div className="stat-card success">
              <div>
                <div className="stat-value">{stats?.tutorias?.realizadas || 0}</div>
                <div className="stat-label">Sesiones Completadas</div>
              </div>
              <div className="stat-icon-wrapper success">
                <CheckCircle size={24} />
              </div>
            </div>

            <div className="stat-card danger">
              <div>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={24} fill="var(--upds-gold)" color="var(--upds-gold)" />
                  <span>{stats?.promedio_satisfaccion || '5.0'}</span>
                </div>
                <div className="stat-label">Calificación de Calidad</div>
              </div>
              <div className="stat-icon-wrapper danger">
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

      {/* Tabla de Actividad Reciente */}
      <div className="card">
        <div className="card-header-clean">
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>
              {isDocente ? 'Mis Próximas Tutorías Agendadas' : isEstudiante ? 'Mis Solicitudes de Tutoría' : 'Últimas Tutorías Registradas'}
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
