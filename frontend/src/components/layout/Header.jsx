import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import { Menu, LogOut, User, ChevronDown, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const Header = ({ onToggleSidebar }) => {
  const { user, role, logout, login } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        fotoUrl = uploadRes.data.data.foto_perfil;
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

  const handleQuickSwitch = async (targetUser) => {
    await login(targetUser, 'password');
    setRoleSwitchOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', padding: '6px' }}
          title="Menú de navegación"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo-upds-oficial.png"
            alt="Logo UPDS"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Universidad Privada Domingo Savio &bull; Sede Tarija
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--upds-blue-dark)', lineHeight: 1.2 }}>
              Sistema Institucional de Apoyo y Tutorías Académicas
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Selector discreto de depuración/evaluación */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Cambio de perfil para evaluación"
          >
            <span>Perfil: <strong>{user?.nombre_rol?.toUpperCase()}</strong></span>
            <ChevronDown size={14} />
          </button>

          {roleSwitchOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                padding: '6px',
                minWidth: '180px',
                zIndex: 60,
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '4px 8px', fontWeight: 600, textTransform: 'uppercase' }}>
                Simular Sesión:
              </div>
              <button
                type="button"
                onClick={() => handleQuickSwitch('admin')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: role === 'administrador' ? 'var(--upds-blue-subtle)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Administrador</span>
                {role === 'administrador' && <Check size={14} color="var(--upds-blue)" />}
              </button>
              <button
                type="button"
                onClick={() => handleQuickSwitch('tutor1')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: role === 'tutor' ? 'var(--upds-blue-subtle)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Docente Tutor</span>
                {role === 'tutor' && <Check size={14} color="var(--upds-blue)" />}
              </button>
              <button
                type="button"
                onClick={() => handleQuickSwitch('estudiante1')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: role === 'estudiante' ? 'var(--upds-blue-subtle)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Estudiante Regular</span>
                {role === 'estudiante' && <Check size={14} color="var(--upds-blue)" />}
              </button>
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
              backgroundImage: user?.foto_perfil ? `url(http://localhost:8000/uploads/perfiles/${user.foto_perfil})` : 'none', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              color: user?.foto_perfil ? 'transparent' : 'white'
            }}>
              {!user?.foto_perfil && (user?.nombre?.[0] || 'U')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.nombre} {user?.apellido}
              </span>
              <RoleBadge role={user?.nombre_rol} />
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
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
                background: fotoPreview || (user?.foto_perfil ? `url(http://localhost:8000/uploads/perfiles/${user.foto_perfil})` : 'linear-gradient(135deg, var(--upds-portal-blue) 0%, var(--upds-red) 100%)'),
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
