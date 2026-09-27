import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import { Menu, LogOut, User, ChevronDown, Check, Bell } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export const Header = ({ onToggleSidebar }) => {
  const { user, role, logout, login } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Profile Edit State
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funcionalidad de notificaciones
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notificaciones/index.php?limite=5');
      if (res.success) {
        setNotifications(res.data.notificaciones);
        setUnreadCount(res.data.no_leidas);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Polling cada 30 segundos para revisar nuevas notificaciones
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await api.put('/notificaciones/index.php', { marcar_todas: true });
      setNotifications(notifications.map(n => ({ ...n, leida: 1 })));
      setUnreadCount(0);
      showSuccess('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      showError('Error al marcar notificaciones');
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.put('/notificaciones/index.php', { id_notificacion: id });
      setNotifications(notifications.map(n => n.id_notificacion === id ? { ...n, leida: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída', error);
    }
  };

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false);
    navigate('/notificaciones');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (claveNueva && claveNueva !== confirmarClave) {
      showError('Las contraseñas no coinciden');
      return;
    }
    if (claveNueva && !claveActual) {
      showError('Debes ingresar tu contraseña actual para realizar el cambio');
      return;
    }

    setSavingProfile(true);
    try {
      let fotoUrl = user.foto_perfil;
      
      if (fotoFile) {
        const uploadRes = await api.post('/usuarios/foto.php', (() => {
          const fd = new FormData();
          fd.append('foto', fotoFile);
          return fd;
        })(), { headers: { 'Content-Type': 'multipart/form-data' } });
        fotoUrl = uploadRes.data.foto_perfil;
      }

      await api.put(`/usuarios/detalle.php?id=${user.id_usuario}`, {
        id_rol: user.id_rol,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        usuario: user.usuario,
        estado: user.estado,
        telefono: telefono,
        clave: claveNueva || undefined,
        contrasena_actual: claveActual || undefined
      });
      
      showSuccess('Perfil actualizado correctamente. Los cambios en la foto pueden requerir reiniciar sesión para reflejarse globalmente.');
      setProfileModalOpen(false);
      setClaveActual('');
      setClaveNueva('');
      setConfirmarClave('');
      setFotoFile(null);
      setFotoPreview(null);
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Error al actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError('La fotografía no puede superar los 2MB');
        return;
      }
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };


  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="header-left">
        <button
          onClick={onToggleSidebar}
          className="btn btn-outline btn-sm header-menu-btn"
          title="Menú de navegación"
        >
          <Menu size={20} />
        </button>

        <div className="header-brand">
          <img
            src="/logo-upds-oficial.png"
            alt="Logo UPDS"
            className="header-logo"
          />
          <div className="header-text-container">
            <div className="header-subtitle">
              Universidad Privada Domingo Savio &bull; Sede Tarija
            </div>
            <div className="header-title">
              Sistema Institucional de Apoyo y Tutorías Académicas
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notificaciones */}
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="btn btn-outline"
            style={{ 
              padding: '6px', 
              borderRadius: '50%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: 'none',
              background: notificationsOpen ? 'var(--upds-blue-subtle)' : 'transparent',
              color: notificationsOpen ? 'var(--upds-blue-dark)' : 'var(--text-muted)'
            }}
            title="Notificaciones"
          >
            <div style={{ position: 'relative' }}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'var(--upds-red)',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  border: '2px solid white'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </button>

          {notificationsOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                background: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                width: '320px',
                zIndex: 60,
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Notificaciones</span>
                <span 
                  onClick={handleMarkAllAsRead}
                  style={{ fontSize: '0.75rem', color: 'var(--upds-blue)', cursor: 'pointer' }}
                >
                  Marcar todas leídas
                </span>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id_notificacion} 
                      onClick={() => handleMarkAsRead(notif.id_notificacion, notif.leida)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: notif.leida ? 'transparent' : 'var(--upds-blue-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = notif.leida ? 'transparent' : 'var(--upds-blue-subtle)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--upds-blue-dark)' }}>{notif.titulo}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(notif.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                        {notif.mensaje}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <Link 
                to="/notificaciones"
                onClick={() => setNotificationsOpen(false)}
                style={{ 
                  display: 'block',
                  padding: '10px', 
                  textAlign: 'center', 
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--upds-blue)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Ver centro de notificaciones
              </Link>
            </div>
          )}
        </div>

        {/* Menú de Usuario con Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            className="user-profile-badge"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar" style={{ 
              backgroundImage: user?.foto_perfil ? `url(/uploads/perfiles/${user.foto_perfil})` : 'none', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              color: user?.foto_perfil ? 'transparent' : 'white'
            }}>
              {!user?.foto_perfil && (user?.nombre?.[0] || 'U')}
            </div>
            <div className="user-profile-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.nombre} {user?.apellido}
              </span>
              <RoleBadge role={user?.nombre_rol} />
            </div>
            <ChevronDown className="user-profile-icon" size={14} color="var(--text-muted)" />
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                width: '230px',
                zIndex: 60,
                padding: '0.5rem',
              }}
            >
              <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--upds-blue-dark)' }}>
                  {user?.nombre} {user?.apellido}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user?.correo}
                </div>
                {user?.registro_universitario && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--upds-blue)', fontWeight: 600, marginTop: '2px' }}>
                    R.U.: {user?.registro_universitario}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setProfileModalOpen(true);
                  setDropdownOpen(false);
                }}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.8rem', fontSize: '0.84rem' }}
              >
                <User size={15} />
                <span>Mi Perfil Universitario</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.8rem', fontSize: '0.84rem', color: 'var(--upds-red)' }}
              >
                <LogOut size={15} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Mi Perfil */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Perfil de Usuario Institucional"
      >
        <form onSubmit={handleSaveProfile}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: fotoPreview || (user?.foto_perfil ? `url(/uploads/perfiles/${user.foto_perfil})` : 'linear-gradient(135deg, var(--upds-portal-blue) 0%, var(--upds-red) 100%)'),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: (fotoPreview || user?.foto_perfil) ? 'transparent' : 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!(fotoPreview || user?.foto_perfil) && user?.nombre?.[0]}
              <label style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white',
                fontSize: '0.65rem', padding: '2px 0', cursor: 'pointer', textAlign: 'center'
              }}>
                Editar
                <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleFotoChange} />
              </label>
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>
              {user?.nombre} {user?.apellido}
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Cuenta: <strong>@{user?.usuario}</strong> &bull; Rol: <strong>{user?.nombre_rol}</strong>
            </div>
            {user?.nombre_carrera && (
              <div style={{ color: 'var(--upds-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
                {user?.nombre_carrera} {user?.semestre ? `(${user?.semestre}° Semestre)` : ''}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Correo Institucional Registrado</label>
            <input type="text" className="form-control" value={user?.correo || ''} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono o WhatsApp de Contacto</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: 70000000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Seguridad</h4>
            <div className="form-group">
              <label className="form-label">Contraseña Actual</label>
              <input
                type="password"
                className="form-control"
                placeholder="Requerida si deseas cambiar la contraseña"
                value={claveActual}
                onChange={(e) => setClaveActual(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={claveNueva}
                onChange={(e) => setClaveNueva(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="Repite la nueva contraseña"
                value={confirmarClave}
                onChange={(e) => setConfirmarClave(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setProfileModalOpen(false)}
              disabled={savingProfile}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
