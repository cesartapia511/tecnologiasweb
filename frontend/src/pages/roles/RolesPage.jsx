import React, { useState, useEffect, useCallback } from 'react';
import { rolesService } from '../../services/dataServices';
import { RoleBadge } from '../../components/common/Badge';
import { Shield, Check, RefreshCw, KeyRound, Users, GraduationCap } from 'lucide-react';

export const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await rolesService.getAll();
      setRoles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const ROLES_INFO = {
    administrador: {
      titulo: 'Administrador del Sistema',
      descripcion: 'Acceso total y control de seguridad, gestión de usuarios, roles, carreras, asignaturas y bitácora de auditoría.',
      icon: Shield,
      color: 'var(--upds-red)',
      permisos: [
        'Gestión integral de usuarios y asignación de roles',
        'Administración de carreras y planes de estudio',
        'Gestión del catálogo de asignaturas/materias',
        'Supervisión y control de todas las tutorías agendadas',
        'Consulta de bitácora de accesos y auditoría de seguridad',
        'Descarga de reportes institucionales en CSV',
      ],
    },
    tutor: {
      titulo: 'Docente Tutor Académico',
      descripcion: 'Acompañamiento pedagógico a estudiantes, definición de disponibilidad y confirmación de sesiones de reforzamiento.',
      icon: GraduationCap,
      color: 'var(--upds-blue)',
      permisos: [
        'Registro y administración de franjas horarias semanales',
        'Recepción y confirmación de solicitudes de tutoría',
        'Gestión del lugar de atención física o enlace de reunión virtual',
        'Consulta de opiniones y calificaciones de los estudiantes',
        'Asignación y visualización de materias impartidas',
      ],
    },
    estudiante: {
      titulo: 'Estudiante Tutorado',
      descripcion: 'Acceso al catálogo de tutores, agendamiento de sesiones de tutoría y evaluación de calidad pedagógica.',
      icon: Users,
      color: 'var(--upds-green)',
      permisos: [
        'Consulta del directorio docente tutor por especialidad',
        'Agendamiento de sesiones presenciales o virtuales',
        'Seguimiento del estado de sus solicitudes (pendiente, confirmada)',
        'Calificación y retroalimentación de tutorías realizadas',
        'Generación de actas y constancias de tutoría',
      ],
    },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Roles y Permisos del Sistema</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Matriz de perfiles de usuario y privilegios de acceso en UPDS Tarija
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando roles...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {roles.map((r) => {
            const info = ROLES_INFO[r.nombre_rol] || {
              titulo: r.nombre_rol,
              descripcion: 'Rol registrado en la base de datos.',
              permisos: ['Acceso estándar'],
            };
            const Icon = info.icon || KeyRound;

            return (
              <div key={r.id_rol} className="card" style={{ display: 'flex', flexDirection: 'column', borderTop: `4px solid ${info.color || 'var(--upds-blue)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'var(--bg-app)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: info.color || 'var(--upds-blue)',
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{info.titulo}</h3>
                      <RoleBadge role={r.nombre_rol} />
                    </div>
                    <small style={{ color: 'var(--text-muted)' }}>Identificador de Rol: ID #{r.id_rol}</small>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  {info.descripcion}
                </p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem', letterSpacing: '0.05em' }}>
                    Privilegios Concedidos:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {info.permisos.map((p, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: '#334155' }}>
                        <Check size={14} color="var(--upds-green)" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
