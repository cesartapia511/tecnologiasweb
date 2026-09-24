import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { carrerasService } from '../../services/dataServices';
import {
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  Mail,
  KeyRound,
  ArrowLeft
} from 'lucide-react';

const UPDS_CARRERAS_DEFAULT = [
  { id_carrera: 1, nombre_carrera: 'Ingeniería de Sistemas' },
  { id_carrera: 2, nombre_carrera: 'Ingeniería Comercial' },
  { id_carrera: 3, nombre_carrera: 'Ingeniería Industrial' },
  { id_carrera: 4, nombre_carrera: 'Administración de Empresas' },
  { id_carrera: 5, nombre_carrera: 'Contaduría Pública' },
  { id_carrera: 6, nombre_carrera: 'Derecho' },
  { id_carrera: 7, nombre_carrera: 'Psicología' },
  { id_carrera: 8, nombre_carrera: 'Comunicación Social' },
  { id_carrera: 9, nombre_carrera: 'Arquitectura' },
  { id_carrera: 10, nombre_carrera: 'Ingeniería Financiera' },
];

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [carreras, setCarreras] = useState(UPDS_CARRERAS_DEFAULT);

  // Login
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recuperacionCorreo, setRecuperacionCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryUrl, setRecoveryUrl] = useState('');

  // Registro
  const [regData, setRegData] = useState({
    id_rol: 3,
    nombre: '',
    apellido: '',
    correo: '',
    usuario: '',
    clave: '',
    telefono: '',
    id_carrera: 1,
    semestre: 1,
    especialidad: '',
  });

  const { login, register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    carrerasService
      .getAll()
      .then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setCarreras(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const setTestCredentials = (user, pass) => {
    setUsuario(user);
    setContrasena(pass);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usuario.trim() || !contrasena) {
      showError(
        'Por favor ingresa tu usuario o correo institucional y contraseña'
      );
      return;
    }

    setLoading(true);

    const res = await login(usuario.trim(), contrasena);

    setLoading(false);

    if (res.success) {
      showSuccess(`¡Bienvenido(a), ${res.user.nombre}!`);
      navigate('/dashboard');
    } else {
      showError(res.message || 'Credenciales inválidas');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !regData.nombre ||
      !regData.apellido ||
      !regData.correo ||
      !regData.usuario ||
      !regData.clave
    ) {
      showError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (regData.clave.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    let submitData = { ...regData };
    if (submitData.id_rol === 2) {
      const selectedCarrera = carreras.find(c => c.id_carrera === submitData.id_carrera);
      if (selectedCarrera) {
        submitData.especialidad = selectedCarrera.nombre_carrera;
      }
    }

    const res = await register(submitData);

    setLoading(false);

    if (res.success) {
      showSuccess(
        '¡Cuenta creada exitosamente en la base de datos! Iniciando sesión...'
      );

      const loginRes = await login(
        regData.usuario || regData.correo,
        regData.clave
      );

      if (loginRes.success) {
        navigate('/dashboard');
      } else {
        setActiveTab('login');
      }
    } else {
      showError(res.message || 'Error al procesar el registro');
    }
  };

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================
  const handleRecuperacion = async (e) => {
    e.preventDefault();

    if (!recuperacionCorreo.trim()) {
      showError('Ingresa tu correo institucional.');
      return;
    }

    setLoading(true);
    setRecoveryUrl('');

    try {
      const { default: api } = await import('../../services/api');

      const response = await api.post('/auth/recuperar.php', {
        correo: recuperacionCorreo.trim(),
      });

      console.log('Respuesta recuperación:', response);

      const mensaje =
        response?.message ||
        response?.data?.message ||
        response?.data?.data?.message ||
        'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.';

      showSuccess(mensaje);

      // Buscar recovery_url en las posibles estructuras de respuesta
      const recoveryLink =
        response?.recovery_url ||
        response?.data?.recovery_url ||
        response?.data?.data?.recovery_url ||
        response?.data?.data?.data?.recovery_url ||
        '';

      console.log('Enlace de recuperación:', recoveryLink);

      if (recoveryLink) {
        setRecoveryUrl(recoveryLink);
      } else {
        console.warn(
          'El backend respondió correctamente, pero no se encontró recovery_url.'
        );
      }

      setRecuperacionCorreo('');
    } catch (error) {
      console.error('Error recuperación:', error);

      showError(
        error?.message || 'Error al intentar recuperar la contraseña'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="portal-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
      }}
    >
      {/* Encabezado Institucional */}
      <header className="portal-header">
        <div className="portal-brand">
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          >
            <img
              src="/logo-upds-oficial.png"
              alt="UPDS Logo Oficial"
              style={{
                height: '44px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                color: '#fff',
                textTransform: 'uppercase',
              }}
            >
              Universidad Privada
            </div>

            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.5px',
              }}
            >
              Domingo Savio
            </div>
          </div>
        </div>

        <div className="portal-online-badge">
          <div className="portal-online-text">
            UPDS<span>online</span>
          </div>

          <div className="portal-online-sub">
            Sistema de Tutorías y Apoyo Académico &bull; Sede Tarija
          </div>
        </div>
      </header>

      {/* Contenido Central */}
      <main
        style={{
          maxWidth: '1240px',
          margin: '1.5rem auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {/* Banner Informativo */}
        <div style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '1rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ color: 'var(--upds-cyan)' }}>
              ● Sede Tarija
            </span>
            <span>&bull;</span>
            <span>Gestión Académica Universitaria</span>
          </div>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              lineHeight: 1.18,
              color: '#ffffff',
              marginBottom: '1rem',
              letterSpacing: '-0.5px',
            }}
          >
            SISTEMA WEB DE{' '}
            <span style={{ color: 'var(--upds-cyan)' }}>
              TUTORÍAS UNIVERSITARIAS
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              maxWidth: '520px',
            }}
          >
            Plataforma oficial de acompañamiento pedagógico y reforzamiento
            académico. Acceso seguro mediante tu correo electrónico
            institucional de la UPDS Sede Tarija.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                10 Carreras
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                Sede Tarija Oficial
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--upds-gold)',
                }}
              >
                Turnos Oficiales
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                Presencial y Semipresencial
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Acceso */}
        <div
          className="card"
          style={{
            maxWidth: '460px',
            width: '100%',
            margin: '0 auto',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: '#ffffff',
          }}
        >
          {/* Pestañas */}
          {activeTab !== 'recovery' && (
            <div className="portal-tabs">
              <button
                type="button"
                className={`portal-tab-btn ${
                  activeTab === 'login' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('login')}
              >
                <LogIn
                  size={16}
                  style={{
                    display: 'inline',
                    marginRight: '6px',
                    verticalAlign: '-2px',
                  }}
                />
                Iniciar Sesión
              </button>

              <button
                type="button"
                className={`portal-tab-btn ${
                  activeTab === 'register' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('register')}
              >
                <UserPlus
                  size={16}
                  style={{
                    display: 'inline',
                    marginRight: '6px',
                    verticalAlign: '-2px',
                  }}
                />
                Registrarse
              </button>
            </div>
          )}

          {/* LOGIN */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.35rem',
                    color: 'var(--upds-blue-dark)',
                    marginBottom: '0.2rem',
                  }}
                >
                  Acceso al Sistema
                </h3>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                  }}
                >
                  Ingresa tu usuario o correo institucional registrado
                </p>
              </div>

              <div className="form-group">
                <label
                  className="form-label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Mail size={15} color="var(--upds-blue)" />
                  <span>Usuario o Correo Institucional</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="admin, tutor1, estudiante1 o correo..."
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div
                className="form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label
                  className="form-label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Lock size={15} color="var(--upds-blue)" />
                  <span>Contraseña</span>
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>

              {/* Credenciales de prueba */}
              <div
                style={{
                  marginBottom: '1.25rem',
                  background: '#f8fafc',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.4rem',
                    fontWeight: 600,
                  }}
                >
                  Usuarios de prueba oficiales (clic para autocompletar):
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.35rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 7px',
                    }}
                    onClick={() =>
                      setTestCredentials('admin', 'password')
                    }
                  >
                    👑 Admin (admin)
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 7px',
                    }}
                    onClick={() =>
                      setTestCredentials('tutor1', 'password')
                    }
                  >
                    👨‍🏫 Tutor (tutor1)
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 7px',
                    }}
                    onClick={() =>
                      setTestCredentials(
                        'estudiante1',
                        'password'
                      )
                    }
                  >
                    🎓 Alumno (estudiante1)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.98rem',
                }}
                disabled={loading}
              >
                {loading ? (
                  'Ingresando...'
                ) : (
                  <>
                    <span>Ingresar al Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div
                style={{
                  marginTop: '1.25rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setRecoveryUrl('');
                    setActiveTab('recovery');
                  }}
                  style={{
                    color: 'var(--upds-blue)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </a>

                <small
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                  }}
                >
                  ¿Aún no tienes cuenta? Pulsa en la pestaña{' '}
                  <strong>Registrarse</strong>.
                </small>
              </div>
            </form>
          ) : activeTab === 'recovery' ? (
            /* RECUPERACIÓN */
            <form onSubmit={handleRecuperacion}>
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '12px',
                    background: 'var(--upds-blue-subtle)',
                    borderRadius: '50%',
                    color: 'var(--upds-blue)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <KeyRound size={28} />
                </div>

                <h3
                  style={{
                    fontSize: '1.35rem',
                    color: 'var(--upds-blue-dark)',
                    marginBottom: '0.2rem',
                  }}
                >
                  Recuperar Contraseña
                </h3>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                  }}
                >
                  Ingresa tu correo institucional registrado
                </p>
              </div>

              <div
                className="form-group"
                style={{ marginBottom: '1.5rem' }}
              >
                <label
                  className="form-label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Mail size={15} color="var(--upds-blue)" />
                  <span>Correo Institucional</span>
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="usuario@upds.net.bo"
                  value={recuperacionCorreo}
                  onChange={(e) =>
                    setRecuperacionCorreo(e.target.value)
                  }
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.98rem',
                  marginBottom: '1rem',
                }}
                disabled={loading}
              >
                {loading
                  ? 'Procesando...'
                  : 'Restablecer mi Contraseña'}
              </button>

              {/* ENLACE DE RECUPERACIÓN PARA DESARROLLO */}
              {recoveryUrl && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    background:
                      'var(--upds-cyan-subtle, #e0f2fe)',
                    border:
                      '1px solid var(--upds-cyan, #0ea5e9)',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color:
                        'var(--upds-cyan, #0ea5e9)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    [ENTORNO DE DESARROLLO]
                  </div>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      marginBottom: '0.8rem',
                    }}
                  >
                    Como no hay servidor SMTP configurado,
                    utiliza el siguiente enlace temporal para
                    continuar con la recuperación:
                  </p>

                  <a
                    href={recoveryUrl}
                    className="btn btn-sm btn-outline"
                    style={{
                      fontSize: '0.85rem',
                      width: '100%',
                      display: 'inline-block',
                      padding: '0.6rem',
                    }}
                    onClick={(e) => {
                      e.preventDefault();

                      try {
                        const urlObj = new URL(recoveryUrl);

                        navigate(
                          urlObj.pathname + urlObj.search
                        );
                      } catch (error) {
                        console.error(
                          'URL de recuperación inválida:',
                          error
                        );

                        showError(
                          'El enlace de recuperación no es válido.'
                        );
                      }
                    }}
                  >
                    Abrir enlace de recuperación
                  </a>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('login');
                    setRecoveryUrl('');
                  }}
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </a>
              </div>
            </form>
          ) : (
            /* REGISTRO */
            <form onSubmit={handleRegister}>
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.3rem',
                    color: 'var(--upds-blue-dark)',
                    marginBottom: '0.2rem',
                  }}
                >
                  Registro de Nuevo Usuario
                </h3>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                  }}
                >
                  Crea tu cuenta institucional en la UPDS Tarija
                </p>
              </div>

              {/* Tipo de Cuenta */}
              <div
                className="form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="form-label">
                  Tipo de Usuario:
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  <label
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      border: `2px solid ${
                        regData.id_rol === 3
                          ? 'var(--upds-blue)'
                          : 'var(--border-color)'
                      }`,
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background:
                        regData.id_rol === 3
                          ? 'var(--upds-blue-subtle)'
                          : 'transparent',
                      color:
                        regData.id_rol === 3
                          ? 'var(--upds-blue)'
                          : 'var(--text-main)',
                    }}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value="3"
                      checked={regData.id_rol === 3}
                      onChange={() =>
                        setRegData({
                          ...regData,
                          id_rol: 3,
                        })
                      }
                      style={{ display: 'none' }}
                    />
                    🎓 Estudiante
                  </label>

                  <label
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      border: `2px solid ${
                        regData.id_rol === 2
                          ? 'var(--upds-blue)'
                          : 'var(--border-color)'
                      }`,
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background:
                        regData.id_rol === 2
                          ? 'var(--upds-blue-subtle)'
                          : 'transparent',
                      color:
                        regData.id_rol === 2
                          ? 'var(--upds-blue)'
                          : 'var(--text-main)',
                    }}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value="2"
                      checked={regData.id_rol === 2}
                      onChange={() =>
                        setRegData({
                          ...regData,
                          id_rol: 2,
                        })
                      }
                      style={{ display: 'none' }}
                    />
                    👨‍🏫 Docente Tutor
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    Nombre *
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Ej: Carlos"
                    value={regData.nombre}
                    onChange={(e) =>
                      setRegData({
                        ...regData,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Apellido *
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Ej: Mendoza"
                    value={regData.apellido}
                    onChange={(e) =>
                      setRegData({
                        ...regData,
                        apellido: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    Correo Electrónico *
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    required
                    placeholder="usuario@upds.net.bo"
                    value={regData.correo}
                    onChange={(e) =>
                      setRegData({
                        ...regData,
                        correo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nombre de Usuario *
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="cmendoza"
                    value={regData.usuario}
                    onChange={(e) =>
                      setRegData({
                        ...regData,
                        usuario: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    Contraseña (Mín. 6) *
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="••••••••"
                    value={regData.clave}
                    onChange={(e) =>
                      setRegData({
                        ...regData,
                        clave: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Teléfono / WhatsApp
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="70000000"
                    value={regData.telefono}
                    onChange={(e) =>
                      setRegData({
                        ...regData,
                        telefono: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Carrera */}
              {regData.id_rol === 3 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '0.75rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">
                      Carrera Universitaria *
                    </label>

                    <select
                      className="form-control"
                      value={regData.id_carrera}
                      onChange={(e) =>
                        setRegData({
                          ...regData,
                          id_carrera: Number(
                            e.target.value
                          ),
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {carreras.map((c) => (
                        <option
                          key={c.id_carrera}
                          value={c.id_carrera}
                        >
                          {c.nombre_carrera}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Semestre
                    </label>

                    <select
                      className="form-control"
                      value={regData.semestre}
                      onChange={(e) =>
                        setRegData({
                          ...regData,
                          semestre: Number(
                            e.target.value
                          ),
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}° Semestre
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">
                    Carrera Universitaria *
                  </label>

                  <select
                    className="form-control"
                    value={regData.id_carrera}
                    onChange={(e) =>
                      setRegData({
                        ...regData,
                        id_carrera: Number(e.target.value),
                      })
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {carreras.map((c) => (
                      <option
                        key={c.id_carrera}
                        value={c.id_carrera}
                      >
                        {c.nombre_carrera}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  marginTop: '0.5rem',
                }}
                disabled={loading}
              >
                {loading
                  ? 'Registrando en MySQL...'
                  : 'Crear Mi Cuenta UPDS'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Pie de página */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1rem 0',
          borderTop:
            '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.85rem',
        }}
      >
        Universidad Privada Domingo Savio &bull; Sede Tarija
        &bull; Sistema Web de Tutorías Universitarias
      </footer>
    </div>
  );
};