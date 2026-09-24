import React, { useState, useEffect } from 'react';
import { Mail, Phone, BookOpen, Shield, Save, Briefcase, FileText, Camera } from 'lucide-react';
import { tutoresService, materiasService, usuariosService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const PerfilTutor = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [todasMaterias, setTodasMaterias] = useState([]);

  const [perfil, setPerfil] = useState({
    id_tutor: '',
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    usuario: '',
    especialidad: '',
    biografia: '',
    materias_ids: [],
    foto_perfil: '',
  });

  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const materias = await materiasService.getAll();
      setTodasMaterias(materias);

      const tutores = await tutoresService.getAll();
      const miPerfil = tutores.find(
        t => String(t.id_tutor) === String(user?.id_tutor)
      );

      if (miPerfil) {
        setPerfil({
          id_tutor: miPerfil.id_tutor,
          nombre: miPerfil.nombre || '',
          apellido: miPerfil.apellido || '',
          correo: miPerfil.correo || '',
          telefono: miPerfil.telefono || '',
          usuario: miPerfil.usuario || '',
          especialidad: miPerfil.especialidad || '',
          biografia: miPerfil.biografia || '',
          materias_ids: miPerfil.materias?.map(m => Number(m.id_materia)) || [],
          foto_perfil: miPerfil.foto_perfil || user?.foto_perfil || ''
        });
      }
    } catch (error) {
      showError(
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        'Error al cargar tu perfil profesional'
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

  const handleMateriaChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      option => parseInt(option.value, 10)
    );

    setPerfil(prev => ({
      ...prev,
      materias_ids: value
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

    if (!claveActual) {
      showError(
        'Debes ingresar tu contraseña actual para confirmar los cambios'
      );
      return;
    }

    setSaving(true);

    try {
      let fotoUrl = perfil.foto_perfil;

      if (fotoFile) {
        const uploadRes = await usuariosService.uploadFoto(fotoFile);

        fotoUrl = uploadRes.data.data.foto_perfil;

        setPerfil(prev => ({
          ...prev,
          foto_perfil: fotoUrl
        }));
      }

      await tutoresService.update({
        id_tutor: perfil.id_tutor,
        especialidad: perfil.especialidad,
        biografia: perfil.biografia
      });

      await usuariosService.update(user.id_usuario, {
        telefono: perfil.telefono,
        correo: perfil.correo,
        clave: claveNueva || undefined,
        contrasena_actual: claveActual || undefined
      });

      showSuccess('Tu perfil ha sido actualizado correctamente');

      setClaveActual('');
      setClaveNueva('');
      setConfirmarClave('');
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
        Cargando perfil profesional...
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil Profesional</h1>

          <p className="page-description">
            Gestiona tu carta de presentación, especialidad y las materias que impartes como tutor.
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
                color: 'var(--upds-gold)',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            >
              Docente Tutor UPDS
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
              Datos de Contacto e Institucionales
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ color: 'var(--text-muted)' }}>
                  <Shield size={20} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Usuario del Sistema
                  </div>

                  <div style={{ fontWeight: 500 }}>
                    {perfil.usuario}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255,184,28,0.1)',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-color)'
                }}
              >
                <strong>Nota:</strong> Los datos académicos son administrados
                por la Universidad. Utiliza el panel derecho para actualizar
                tus datos de contacto y contraseña.
              </div>

            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="card">

          <div
            className="card-header-clean"
            style={{ marginBottom: '1.5rem' }}
          >
            <div>
              <h2
                className="card-title"
                style={{ fontSize: '1.15rem' }}
              >
                Información Profesional
              </h2>

              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}
              >
                Datos públicos para los estudiantes
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-container">

            <h3
              style={{
                fontSize: '1rem',
                marginBottom: '1rem',
                color: 'var(--text-color)'
              }}
            >
              Datos de Contacto
            </h3>

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
                    top: '10px',
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
            </div>

            <div className="form-group">

              <label className="form-label">
                Teléfono o WhatsApp
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
                    top: '10px',
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
            </div>

            <div
              style={{
                marginTop: '2rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.5rem'
              }}
            />

            <h3
              style={{
                fontSize: '1rem',
                marginBottom: '1rem',
                color: 'var(--text-color)'
              }}
            >
              Información Profesional
            </h3>

            <div className="form-group">

              <label className="form-label">
                Especialidad Académica
                <span style={{ color: 'var(--upds-red)' }}> *</span>
              </label>

              <div
                className="input-icon-wrapper"
                style={{ position: 'relative' }}
              >

                <Briefcase
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '10px',
                    color: 'var(--text-muted)'
                  }}
                />

                <input
                  type="text"
                  name="especialidad"
                  className="form-control"
                  style={{ paddingLeft: '35px', backgroundColor: 'var(--bg-card)' }}
                  value={perfil.especialidad}
                  onChange={handleChange}
                  placeholder="Ej: Ingeniero de Software, Magíster en Educación..."
                  readOnly={true}
                />

              </div>
            </div>

            <div className="form-group">

              <label className="form-label">
                Biografía Profesional (Opcional)
              </label>

              <div
                className="input-icon-wrapper"
                style={{ position: 'relative' }}
              >

                <FileText
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '10px',
                    color: 'var(--text-muted)'
                  }}
                />

                <textarea
                  name="biografia"
                  className="form-control"
                  style={{
                    paddingLeft: '35px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  value={perfil.biografia}
                  onChange={handleChange}
                  placeholder="Una breve descripción sobre tu trayectoria, métodos de enseñanza o filosofía como tutor..."
                  maxLength="1000"
                />

              </div>

              <small className="form-help">
                Máximo 1000 caracteres. Esta biografía será visible para los
                estudiantes que busquen tutorías.
              </small>

            </div>

            <div className="form-group">

              <label className="form-label">
                Materias Asignadas para Tutorías
              </label>

              <div
                className="input-icon-wrapper"
                style={{ position: 'relative' }}
              >

                <BookOpen
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '12px',
                    color: 'var(--text-muted)'
                  }}
                />

                <div
                  className="form-control"
                  style={{
                    paddingLeft: '35px',
                    minHeight: '42px',
                    height: 'auto',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    paddingTop: '10px',
                    paddingBottom: '10px'
                  }}
                >
                  {perfil.materias_ids.length > 0 && todasMaterias.filter(m => perfil.materias_ids.includes(m.id_materia) && m.nombre_carrera === perfil.especialidad).length > 0 ? (
                    todasMaterias
                      .filter(m => perfil.materias_ids.includes(m.id_materia) && m.nombre_carrera === perfil.especialidad)
                      .map(materia => (
                        <div 
                          key={materia.id_materia}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)'
                          }}
                        >
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--upds-blue)' }} />
                          {materia.nombre_materia} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({materia.nombre_carrera || 'Sin carrera'})</span>
                        </div>
                      ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No tienes materias asignadas de tu carrera aún.</span>
                  )}
                </div>

              </div>

              <small className="form-help">
                Las materias son asignadas exclusivamente por la administración de la universidad.
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
                Seguridad
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
                      top: '10px',
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
                    <span>Guardar Perfil Profesional</span>
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