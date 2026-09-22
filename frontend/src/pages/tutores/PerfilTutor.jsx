import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Shield, Save, Briefcase, FileText } from 'lucide-react';
import { tutoresService, materiasService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const PerfilTutor = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
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
    materias_ids: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Obtener todas las materias disponibles
      const materias = await materiasService.getAll();
      setTodasMaterias(materias);

      // Obtener datos del tutor
      const tutores = await tutoresService.getAll();
      const miPerfil = tutores.find(t => t.id_tutor === user?.id_tutor);
      
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
          materias_ids: miPerfil.materias?.map(m => m.id_materia) || []
        });
      }
    } catch (error) {
      addToast('Error al cargar tu perfil profesional', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const handleMateriaChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setPerfil(prev => ({ ...prev, materias_ids: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tutoresService.update({
        id_tutor: perfil.id_tutor,
        especialidad: perfil.especialidad,
        biografia: perfil.biografia,
        materias_ids: perfil.materias_ids
      });
      addToast('Tu perfil profesional ha sido actualizado correctamente', 'success');
    } catch (error) {
      addToast(error.response?.data?.mensaje || 'Error al actualizar tu perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando perfil profesional...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil Profesional</h1>
          <p className="page-description">Gestiona tu carta de presentación, especialidad y las materias que impartes como tutor.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
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
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--upds-gold)', fontSize: '0.95rem', fontWeight: 600 }}>
              Docente Tutor UPDS
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Datos de Contacto e Institucionales</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-red)' }}><Mail size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Correo Institucional</div>
                  <div style={{ fontWeight: 500 }}>{perfil.correo || 'No registrado'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--upds-blue)' }}><Phone size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Teléfono</div>
                  <div style={{ fontWeight: 500 }}>{perfil.telefono || 'No registrado'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}><Shield size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Usuario del Sistema</div>
                  <div style={{ fontWeight: 500 }}>{perfil.usuario}</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,184,28,0.1)', borderRadius: '0.5rem', fontSize: '0.85rem', color: 'var(--text-color)' }}>
                <strong>Nota:</strong> Los datos personales e institucionales son administrados por la Universidad. Si requieres actualizarlos, contacta con soporte técnico.
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Edición Profesional */}
        <div className="card">
          <div className="card-header-clean" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 className="card-title" style={{ fontSize: '1.15rem' }}>Información Profesional</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Datos públicos para los estudiantes</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label className="form-label">Especialidad Académica <span style={{ color: 'var(--upds-red)' }}>*</span></label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="especialidad"
                  className="form-control"
                  style={{ paddingLeft: '35px' }}
                  value={perfil.especialidad}
                  onChange={handleChange}
                  placeholder="Ej: Ingeniero de Software, Magíster en Educación..."
                  required
                  minLength="3"
                  maxLength="150"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Biografía Profesional (Opcional)</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <textarea
                  name="biografia"
                  className="form-control"
                  style={{ paddingLeft: '35px', minHeight: '100px', resize: 'vertical' }}
                  value={perfil.biografia}
                  onChange={handleChange}
                  placeholder="Una breve descripción sobre tu trayectoria, métodos de enseñanza o filosofía como tutor..."
                  maxLength="1000"
                ></textarea>
              </div>
              <small className="form-help">Máximo 1000 caracteres. Esta biografía será visible para los estudiantes que busquen tutorías.</small>
            </div>

            <div className="form-group">
              <label className="form-label">Materias Asignadas para Tutorías</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <BookOpen size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <select
                  multiple
                  name="materias_ids"
                  className="form-control"
                  style={{ paddingLeft: '35px', minHeight: '160px' }}
                  value={perfil.materias_ids}
                  onChange={handleMateriaChange}
                >
                  {todasMaterias.map(materia => (
                    <option key={materia.id_materia} value={materia.id_materia}>
                      {materia.nombre_materia} ({materia.nombre_carrera || 'Sin carrera'})
                    </option>
                  ))}
                </select>
              </div>
              <small className="form-help">Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples materias.</small>
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
