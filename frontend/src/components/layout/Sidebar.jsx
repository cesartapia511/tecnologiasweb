import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  CalendarClock,
  CalendarDays,
  Star,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, canAccess, logout } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header con Logo Oficial UPDS */}
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            flexShrink: 0,
          }}
        >
          <img
            src="/logo-upds-oficial.png"
            alt="Logo UPDS"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div>
          <div className="sidebar-brand-title" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            UPDS Tarija
          </div>
          <div className="sidebar-brand-subtitle" style={{ fontSize: '0.7rem', color: 'var(--upds-cyan)', letterSpacing: '0.4px' }}>
            Portal de Tutorías
          </div>
        </div>
      </div>

      {/* Navegación por Módulos */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navegación General</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard size={18} />
          <span>Panel de Control</span>
        </NavLink>

        {/* Tutorías y Asesoría Académica */}
        <div className="nav-section-title">Acompañamiento Académico</div>
        {canAccess('tutorias') && (
          <NavLink
            to="/tutorias"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <CalendarDays size={18} />
            <span>
              {role === 'estudiante'
                ? 'Mis Tutorías'
                : role === 'tutor'
                ? 'Sesiones Asignadas'
                : 'Control de Tutorías'}
            </span>
          </NavLink>
        )}

        {canAccess('disponibilidad') && (
          <NavLink
            to="/disponibilidad"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <CalendarClock size={18} />
            <span>Horarios de Atención</span>
          </NavLink>
        )}

        {canAccess('tutores') && (
          <NavLink
            to="/tutores"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <UserCheck size={18} />
            <span>Cuerpo Docente Tutor</span>
          </NavLink>
        )}

        {canAccess('evaluaciones') && (
          <NavLink
            to="/evaluaciones"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Star size={18} />
            <span>Evaluaciones de Calidad</span>
          </NavLink>
        )}

        {/* Programas y Asignaturas */}
        {(canAccess('materias') || canAccess('carreras')) && (
          <>
            <div className="nav-section-title">Planes de Estudio</div>
            {canAccess('carreras') && (
              <NavLink
                to="/carreras"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <GraduationCap size={18} />
                <span>Carreras Universitarias</span>
              </NavLink>
            )}

            {canAccess('materias') && (
              <NavLink
                to="/materias"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <BookOpen size={18} />
                <span>Asignaturas / Materias</span>
              </NavLink>
            )}
          </>
        )}

        {/* Seguridad y Gestión del Sistema (Admin) */}
        {(canAccess('usuarios') || canAccess('auditoria')) && (
          <>
            <div className="nav-section-title">Administración del Sistema</div>
            {canAccess('usuarios') && (
              <NavLink
                to="/usuarios"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Users size={18} />
                <span>Cuentas de Usuario</span>
              </NavLink>
            )}

            {canAccess('auditoria') && (
              <NavLink
                to="/auditoria"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <ShieldCheck size={18} />
                <span>Bitácora de Accesos (IP)</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

      {/* Pie del Menú Lateral */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.nombre} {user?.apellido}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
              Rol: {user?.nombre_rol}
            </div>
          </div>
          <button
            onClick={logout}
            title="Cerrar Sesión Institucional"
            className="btn btn-outline btn-sm"
            style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)', padding: '4px 8px' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
