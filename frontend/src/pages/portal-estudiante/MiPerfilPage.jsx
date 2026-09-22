import React, { useState, useEffect } from 'react';
import { Mail, Phone, Book, Hash, Calendar, Shield, Save, Camera } from 'lucide-react';
import { estudiantesService, usuariosService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PerfilTutor } from '../tutores/PerfilTutor';

const PerfilEstudiante = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    usuario: '',
    semestre: '',
    registro_universitario: '',
    nombre_carrera: '',
    foto_perfil: '',
  });

  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    loadPerfil();
  }, []);

  const loadPerfil = async () => {
    setLoading(true);

    try {
      const data = await estudiantesService.getPerfil();

      setPerfil({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        usuario: data.usuario || '',
        semestre: data.semestre || '',
        registro_universitario: data.registro_universitario || '',
        nombre_carrera: data.nombre_carrera || user?.nombre_carrera || '',
        foto_perfil: data.foto_perfil || '',
      });
    } catch (error) {
      showError(
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        'Error al cargar tu perfil académico'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('La fotografía no puede superar los 2MB');
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (claveNueva && claveNueva !== confirmarClave) {
      showError('Las contraseñas no coinciden');
      return;
    }

    if (claveNueva && !claveActual) {
      showError(
        'Debes ingresar tu contraseña actual para realizar el cambio'
      );
      return;
    }

    setSaving(true);

    try {
      let fotoUrl = perfil.foto_perfil;

      // Subir fotografía si el usuario seleccionó una nueva
      if (fotoFile) {
        const uploadRes = await usuariosService.uploadFoto(fotoFile);

        fotoUrl = uploadRes.data.data.foto_perfil;

        setPerfil(prev => ({
          ...prev,
          foto_perfil: fotoUrl
        }));
      }

      // Actualizar información del usuario
      await usuariosService.update(user.id_usuario, {
        telefono: perfil.telefono,
        correo: perfil.correo,
        clave: claveNueva || undefined,
        contrasena_actual: claveActual || undefined
      });

      // Mostrar éxito solamente después de que la API confirme el guardado
      showSuccess('Tu perfil ha sido actualizado correctamente');

      // Limpiar campos de seguridad
      setClaveActual('');
      setClaveNueva('');
      setConfirmarClave('');

      // Limpiar selección de fotografía
      setFotoFile(null);
      setFotoPreview(null);

    } catch (error) {
      showError(
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        'Error al actualizar tu perfil'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="card"
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}
      >
        Cargando información del perfil...
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil Académico</h1>

          <p className="page-description">
            Consulta tus datos institucionales y actualiza tu información de contacto.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}
      >

        {/* PANEL IZQUIERDO */}
        <div className="card">

          <div
            style={{
              textAlign: 'center',
              padding: '1rem 0 2rem 0'
            }}
          >

            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background:
                  fotoPreview ||
                  (
                    perfil.foto_perfil
                      ? `url(http://localhost:8000/uploads/perfiles/${perfil.foto_perfil})`
                      : 'var(--upds-blue)'
                  ),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color:
                  (fotoPreview || perfil.foto_perfil)
                    ? 'transparent'
                    : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem auto',
                position: 'relative',
                overflow: 'hidden'
              }}
            >

              {!(fotoPreview || perfil.foto_perfil) &&
                `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`}

              <label
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '4px 0',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Camera size={14} />
                Cambiar

                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFotoChange}
                />
              </label>

            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '1.3rem',
                color: 'var(--text-color)'
              }}
            >
              {perfil.nombre} {perfil.apellido}
            </h2>

            <p
              style={{
                margin: '0.2rem 0 0 0',
                color: 'var(--text-muted)',
                fontSize: '0.95rem'
              }}
            >
              Estudiante UPDS
            </p>

          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.5rem'
            }}
          >

            <h3
              style={{
                fontSize: '1rem',
                marginBottom: '1rem',
                color: 'var(--text-color)'
              }}
            >
              Datos Institucionales
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-red)' }}>
                  <Hash size={20} />
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Registro Universitario (RU)
                  </div>

                  <div style={{ fontWeight: 500 }}>
                    {perfil.registro_universitario}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-blue)' }}>
                  <Book size={20} />
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Carrera
                  </div>

                  <div style={{ fontWeight: 500 }}>
                    {perfil.nombre_carrera}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-gold)' }}>
                  <Calendar size={20} />
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Semestre Actual
                  </div>

                  <div style={{ fontWeight: 500 }}>
                    Semestre {perfil.semestre}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  <Shield size={20} />
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Usuario Institucional
                  </div>

                  <div style={{ fontWeight: 500 }}>
                    {perfil.usuario}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="card">

          <div className="card-header">
            <h2 className="card-title">
              Información de Contacto
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="form-container">

            <div className="form-group">

              <label className="form-label">
                Correo Electrónico Institucional / Personal
              </label>

              <div
                className="input-icon-wrapper"
                style={{ position: 'relative' }}
              >
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />

                <input
                  type="email"
                  name="correo"
                  className="form-control"
                  style={{ paddingLeft: '35px' }}
                  value={perfil.correo}
                  onChange={handleChange}
                  required
                />
              </div>

              <small className="form-help">
                Donde recibirás notificaciones sobre tus tutorías.
              </small>

            </div>

            <div className="form-group">

              <label className="form-label">
                Número de Teléfono / WhatsApp
              </label>

              <div
                className="input-icon-wrapper"
                style={{ position: 'relative' }}
              >
                <Phone
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />

                <input
                  type="text"
                  name="telefono"
                  className="form-control"
                  style={{ paddingLeft: '35px' }}
                  value={perfil.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 70000000"
                />
              </div>

              <small className="form-help">
                Para contacto rápido por parte de tus docentes tutores.
              </small>

            </div>

            {/* SEGURIDAD */}
            <div
              style={{
                marginTop: '2rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.5rem'
              }}
            >

              <h3
                style={{
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  color: 'var(--text-color)'
                }}
              >
                Seguridad de la Cuenta
              </h3>

              <div className="form-group">

                <label className="form-label">
                  Contraseña Actual
                </label>

                <div
                  className="input-icon-wrapper"
                  style={{ position: 'relative' }}
                >
                  <Shield
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />

                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '35px' }}
                    placeholder="Requerida para cambiar tu contraseña"
                    value={claveActual}
                    onChange={(e) => setClaveActual(e.target.value)}
                  />

                </div>
              </div>

              <div className="form-group">

                <label className="form-label">
                  Nueva Contraseña
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={claveNueva}
                  onChange={(e) => setClaveNueva(e.target.value)}
                />

              </div>

              <div className="form-group">

                <label className="form-label">
                  Confirmar Nueva Contraseña
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Repite la nueva contraseña"
                  value={confirmarClave}
                  onChange={(e) => setConfirmarClave(e.target.value)}
                />

              </div>

            </div>

            <div
              style={{
                marginTop: '2rem',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save size={18} />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>

            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export const MiPerfilPage = () => {
  const { isDocente } = useAuth();

  if (isDocente) {
    return <PerfilTutor />;
  }

  return <PerfilEstudiante />;
};