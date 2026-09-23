import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setLoading(false);
      return;
    }

    const verificarToken = async () => {
      try {
        const response = await api.get(`/auth/verificar-token.php?token=${token}`);
        if (response.data && response.data.data && response.data.data.valido) {
          setTokenValid(true);
        } else {
          showError(response.data?.message || 'Token inválido.');
        }
      } catch (error) {
        showError(error.response?.data?.message || 'El enlace es inválido o ha expirado.');
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    verificarToken();
  }, [token, showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaContrasena.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/restablecer.php', {
        token,
        nueva_contrasena: nuevaContrasena
      });
      showSuccess(response.data?.message || 'Contraseña restablecida exitosamente.');
      navigate('/login');
    } catch (error) {
      showError(error.response?.data?.message || 'Error al restablecer la contraseña.');
      setLoading(false);
    }
  };

  return (
    <div className="portal-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 1rem' }}>
      <header className="portal-header">
        <div className="portal-brand">
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <img src="/logo-upds-oficial.png" alt="UPDS Logo Oficial" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase' }}>
              Universidad Privada
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '0.5px' }}>
              Domingo Savio
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
        <div
          className="card"
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: '#ffffff',
          }}
        >
          {validating ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--upds-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>Validando enlace de recuperación...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : !tokenValid ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--danger-bg, #fee2e2)', borderRadius: '50%', color: 'var(--danger-color, #dc2626)', marginBottom: '1rem' }}>
                <KeyRound size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--upds-blue-dark)', marginBottom: '0.5rem' }}>
                Enlace Inválido
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo desde la página de inicio de sesión.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem' }}
                onClick={() => navigate('/login')}
              >
                Volver al Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--upds-blue-subtle)', borderRadius: '50%', color: 'var(--upds-blue)', marginBottom: '0.5rem' }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--upds-blue-dark)', marginBottom: '0.2rem' }}>
                  Restablecer Contraseña
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Ingresa tu nueva contraseña a continuación.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={15} color="var(--upds-blue)" />
                  <span>Nueva Contraseña</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                  autoFocus
                  minLength="6"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={15} color="var(--upds-blue)" />
                  <span>Confirmar Contraseña</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.98rem', marginBottom: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Guardando...' : (
                  <>
                    <span>Cambiar Contraseña</span>
                    <ArrowRight size={18} style={{ marginLeft: '6px', verticalAlign: '-3px' }} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '1rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
        Universidad Privada Domingo Savio &bull; Sede Tarija &bull; Sistema Web de Tutorías Universitarias
      </footer>
    </div>
  );
};
