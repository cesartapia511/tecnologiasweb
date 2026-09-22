import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Book, Hash, Calendar, Shield, Save } from 'lucide-react';
import { estudiantesService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const MiPerfilPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
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
  });

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
      });
    } catch (error) {
      addToast('Error al cargar tu perfil académico', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await estudiantesService.updatePerfil({
        telefono: perfil.telefono,
        correo: perfil.correo
      });
      addToast('Tu perfil ha sido actualizado correctamente', 'success');
    } catch (error) {
      addToast(error.response?.data?.mensaje || 'Error al actualizar tu perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando información del perfil...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil Académico</h1>
          <p className="page-description">Consulta tus datos institucionales y actualiza tu información de contacto.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Panel Izquierdo: Resumen y Datos No Editables */}
        <div className="card">
          <div style={{ textAlign: 'center', padding: '1rem 0 2rem 0' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--upds-blue)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem auto'
            }}>
              {perfil.nombre.charAt(0)}{perfil.apellido.charAt(0)}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-color)' }}>
              {perfil.nombre} {perfil.apellido}
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Estudiante UPDS
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Datos Institucionales</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-red)' }}><Hash size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registro Universitario (RU)</div>
                  <div style={{ fontWeight: 500 }}>{perfil.registro_universitario}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-blue)' }}><Book size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carrera</div>
                  <div style={{ fontWeight: 500 }}>{perfil.nombre_carrera}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-gold)' }}><Calendar size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Semestre Actual</div>
                  <div style={{ fontWeight: 500 }}>Semestre {perfil.semestre}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}><Shield size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Usuario Institucional</div>
                  <div style={{ fontWeight: 500 }}>{perfil.usuario}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Edición */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Información de Contacto</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label className="form-label">Correo Electrónico Institucional / Personal</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
              <small className="form-help">Donde recibirás notificaciones sobre tus tutorías.</small>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Teléfono / WhatsApp</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
              <small className="form-help">Para contacto rápido por parte de tus docentes tutores.</small>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
              >
                {saving ? 'Guardando...' : (
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
