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
  const [activeTab, setActiveTab] = useState('menu');
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        .login-overlay, .login-overlay * {
          font-family: 'Inter', sans-serif !important;
        }

        .login-bg-layer {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(15, 30, 65, 0.45), rgba(15, 30, 65, 0.45)), url('/img/Fondo-upds.jpg') no-repeat center center !important;
          background-size: cover !important;
          z-index: -1;
        }
        
        .login-overlay {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 20px;
          overflow-y: auto;
        }

        /* HEADER / LOGO */
        .header-top-left {
          position: absolute;
          top: 30px;
          left: 40px;
          display: flex;
          align-items: center;
          gap: 25px !important;
          z-index: 10;
        }
        
        .header-logo-container {
          background: white;
          border-radius: 16px;
          padding: 10px;
          width: 85px;
          height: 85px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .header-logo-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .header-titles h1, .header-titles h2 {
          color: white !important;
          margin: 0;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
        }
        
        .header-titles h1 {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .header-titles h2 {
          font-size: 1rem;
          font-weight: 400;
          opacity: 0.95;
          margin-top: 5px;
        }

        /* CENTRAL CARD */
        .glass-card-wrapper {
          position: relative;
          width: 100%;
          max-width: 580px;
          margin-top: 90px;
        }
        
        .glass-bubble {
          position: absolute;
          top: -130px;
          left: 50%;
          transform: translateX(-50%);
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: linear-gradient(rgba(0, 40, 110, 0.5), rgba(0, 40, 110, 0.5)), url('/img/upds-sede-tarija-medium.jpg') center center / cover !important;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.3);
          z-index: 5;
        }
        
        .glass-bubble::after {
          content: 'DOMINGO SAVIO UNIVERSIDAD PRIVADA';
          position: absolute;
          bottom: 35px;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          text-align: center;
          color: white !important;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
          line-height: 1.3;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(25px) !important;
          -webkit-backdrop-filter: blur(25px) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 20px !important;
          padding: 140px 50px 50px 50px !important;
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3) !important;
          text-align: center;
          position: relative;
          z-index: 4;
        }
        
        .glass-card h2, .glass-card h3, .glass-card p, .glass-card div, .glass-card span {
          color: white !important;
        }
        
        .glass-card h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 5px;
          line-height: 1.3;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
        }
        
        .glass-card p.subtitle {
          font-size: 1rem;
          font-weight: 400;
          margin-bottom: 40px;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
          opacity: 0.95;
        }
        
        /* BUTTONS */
        .btn-glass-primary {
          background: #1B365D !important;
          color: white !important;
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          margin-bottom: 18px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        .btn-glass-primary:hover {
          background: #122540 !important;
          transform: translateY(-2px);
        }
        
        .btn-glass-outline {
          background: transparent !important;
          color: white !important;
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.7) !important;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-glass-outline:hover {
          background: rgba(255,255,255,0.1) !important;
        }
        
        /* INPUTS (para cuando se abra el formulario) */
        .glass-input-group {
          margin-bottom: 15px;
          text-align: left;
        }
        
        .glass-input-group label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.9rem;
          font-weight: 600;
          color: white !important;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        .glass-input-control {
          width: 100%;
          padding: 14px 15px;
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          border-radius: 10px;
          color: white !important;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
        }
        
        .glass-input-control::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        
        .glass-input-control:focus {
          background: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
        }

        /* OPCIONES DEL SELECTOR */
        select.glass-input-control option {
          background-color: white !important;
          color: #222 !important;
          font-weight: 600;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: white !important;
          text-decoration: none;
          font-size: 1rem;
          margin-bottom: 25px;
          opacity: 0.9;
          transition: opacity 0.3s;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        
        .back-link:hover {
          opacity: 1;
        }
        
        @media (max-width: 600px) {
          .header-top-left {
            top: 20px;
            left: 20px;
            gap: 15px !important;
          }
          .header-logo-container {
            width: 60px;
            height: 60px;
          }
          .glass-card {
            padding: 100px 30px 40px 30px !important;
          }
        }
      `}</style>

      <div className="login-bg-layer"></div>
      
      <div className="login-overlay">
        <div className="header-top-left">
          <div className="header-logo-container">
            <img src="/img/logo-upds.png" alt="Logo UPDS" />
          </div>
          <div className="header-titles">
            <h1>Universidad Privada Domingo Savio - Sede Tarija</h1>
            <h2>Sistema de Tutorias Académicas</h2>
          </div>
        </div>

        <div className="glass-card-wrapper">
          <div className="glass-bubble"></div>
          <div className="glass-card">
            
            {activeTab === 'menu' && (
              <>
                <h2>Universidad Privada<br/>Domingo Savio - Sede Tarija</h2>
                <p className="subtitle">Bienvenido al Portal de Tutorias</p>
                
                <button 
                  type="button"
                  className="btn-glass-primary" 
                  onClick={() => setActiveTab('login')}
                >
                  Iniciar sesión
                </button>
                <button 
                  type="button"
                  className="btn-glass-outline"
                  onClick={() => setActiveTab('register')}
                >
                  Registrarse
                </button>
              </>
            )}

            {activeTab === 'login' && (
              <form onSubmit={handleLogin} style={{ animation: 'fadeIn 0.3s' }}>
                <button type="button" className="back-link" onClick={() => setActiveTab('menu')}>
                  <ArrowLeft size={16} /> Volver
                </button>
                <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Iniciar Sesión</h3>
                
                <div className="glass-input-group">
                  <label><Mail size={14} style={{display:'inline', verticalAlign:'-2px', marginRight:'5px'}}/> Usuario o Correo</label>
                  <input
                    type="text"
                    className="glass-input-control"
                    placeholder="admin, tutor1, estudiante1..."
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                  />
                </div>
                
                <div className="glass-input-group">
                  <label><Lock size={14} style={{display:'inline', verticalAlign:'-2px', marginRight:'5px'}}/> Contraseña</label>
                  <input
                    type="password"
                    className="glass-input-control"
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px', textAlign: 'left', fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Usuarios de prueba:</div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button type="button" style={{padding:'4px 8px', borderRadius:'4px', border:'none', cursor:'pointer', background:'white', color:'#333'}} onClick={() => { setUsuario('admin'); setContrasena('password'); }}>Admin</button>
                    <button type="button" style={{padding:'4px 8px', borderRadius:'4px', border:'none', cursor:'pointer', background:'white', color:'#333'}} onClick={() => { setUsuario('tutor1'); setContrasena('password'); }}>Tutor</button>
                    <button type="button" style={{padding:'4px 8px', borderRadius:'4px', border:'none', cursor:'pointer', background:'white', color:'#333'}} onClick={() => { setUsuario('estudiante1'); setContrasena('password'); }}>Alumno</button>
                  </div>
                </div>

                <button type="submit" className="btn-glass-primary" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
                
                <div style={{ marginTop: '15px' }}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('recovery'); }}
                    style={{ color: 'white', fontSize: '0.9rem', textDecoration: 'underline' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegister} style={{ animation: 'fadeIn 0.3s', textAlign: 'left', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                <button type="button" className="back-link" onClick={() => setActiveTab('menu')}>
                  <ArrowLeft size={16} /> Volver
                </button>
                <h3 style={{ marginBottom: '15px', fontSize: '1.3rem', textAlign: 'center' }}>Registro de Nuevo Usuario</h3>
                
                <div className="glass-input-group">
                  <label>Tipo de Usuario:</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1, padding: '10px', background: regData.id_rol === 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', color: regData.id_rol === 3 ? '#19335A' : 'white', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                      <input type="radio" name="rol" value="3" checked={regData.id_rol === 3} onChange={() => setRegData({...regData, id_rol: 3})} style={{display:'none'}} />
                      🎓 Estudiante
                    </label>
                    <label style={{ flex: 1, padding: '10px', background: regData.id_rol === 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', color: regData.id_rol === 2 ? '#19335A' : 'white', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                      <input type="radio" name="rol" value="2" checked={regData.id_rol === 2} onChange={() => setRegData({...regData, id_rol: 2})} style={{display:'none'}} />
                      👨‍🏫 Tutor
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="glass-input-group">
                    <label>Nombre *</label>
                    <input type="text" className="glass-input-control" required value={regData.nombre} onChange={(e) => setRegData({...regData, nombre: e.target.value})} />
                  </div>
                  <div className="glass-input-group">
                    <label>Apellido *</label>
                    <input type="text" className="glass-input-control" required value={regData.apellido} onChange={(e) => setRegData({...regData, apellido: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="glass-input-group">
                    <label>Correo *</label>
                    <input type="email" className="glass-input-control" required value={regData.correo} onChange={(e) => setRegData({...regData, correo: e.target.value})} />
                  </div>
                  <div className="glass-input-group">
                    <label>Usuario *</label>
                    <input type="text" className="glass-input-control" required value={regData.usuario} onChange={(e) => setRegData({...regData, usuario: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="glass-input-group">
                    <label>Contraseña *</label>
                    <input type="password" className="glass-input-control" required value={regData.clave} onChange={(e) => setRegData({...regData, clave: e.target.value})} />
                  </div>
                  <div className="glass-input-group">
                    <label>Teléfono</label>
                    <input type="text" className="glass-input-control" value={regData.telefono} onChange={(e) => setRegData({...regData, telefono: e.target.value})} />
                  </div>
                </div>

                <div className="glass-input-group">
                  <label>Carrera *</label>
                  <select className="glass-input-control" value={regData.id_carrera} onChange={(e) => setRegData({...regData, id_carrera: Number(e.target.value)})}>
                    {carreras.map((c) => (
                      <option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>
                    ))}
                  </select>
                </div>

                {regData.id_rol === 3 && (
                  <div className="glass-input-group">
                    <label>Semestre</label>
                    <select className="glass-input-control" value={regData.semestre} onChange={(e) => setRegData({...regData, semestre: Number(e.target.value)})}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <option key={s} value={s}>{s}° Semestre</option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="btn-glass-primary" style={{marginTop: '10px'}} disabled={loading}>
                  {loading ? 'Registrando...' : 'Crear Mi Cuenta'}
                </button>
              </form>
            )}

            {activeTab === 'recovery' && (
              <form onSubmit={handleRecuperacion} style={{ animation: 'fadeIn 0.3s' }}>
                <button type="button" className="back-link" onClick={() => setActiveTab('menu')}>
                  <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ marginBottom: '20px' }}>
                  <KeyRound size={40} style={{ margin: '0 auto 10px auto', display: 'block' }} />
                  <h3 style={{ fontSize: '1.3rem' }}>Recuperar Contraseña</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ingresa tu correo institucional registrado</p>
                </div>
                
                <div className="glass-input-group">
                  <label><Mail size={14} style={{display:'inline', verticalAlign:'-2px', marginRight:'5px'}}/> Correo Institucional</label>
                  <input
                    type="email"
                    className="glass-input-control"
                    placeholder="usuario@upds.net.bo"
                    value={recuperacionCorreo}
                    onChange={(e) => setRecuperacionCorreo(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" className="btn-glass-primary" disabled={loading}>
                  {loading ? 'Procesando...' : 'Restablecer mi Contraseña'}
                </button>

                {recoveryUrl && (
                  <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(14, 165, 233, 0.2)', border: '1px solid #0ea5e9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>[ENTORNO DE DESARROLLO]</div>
                    <a href={recoveryUrl} onClick={(e) => {
                      e.preventDefault();
                      try {
                        const urlObj = new URL(recoveryUrl);
                        navigate(urlObj.pathname + urlObj.search);
                      } catch (error) {
                        console.error('URL inválida');
                      }
                    }} style={{ color: 'white', fontSize: '0.85rem' }}>
                      Abrir enlace de recuperación
                    </a>
                  </div>
                )}
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
};
