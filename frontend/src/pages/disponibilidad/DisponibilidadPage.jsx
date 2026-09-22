import React, { useState, useEffect, useCallback } from 'react';
import { disponibilidadService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CalendarClock, Plus, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const DIAS_LABELS = {
  'Lunes': 'Lunes',
  'Martes': 'Martes',
  'Miercoles': 'Miércoles',
  'Jueves': 'Jueves',
  'Viernes': 'Viernes',
  'Sabado': 'Sábado'
};

export const DisponibilidadPage = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    dia_semana: 'Lunes',
    hora_inicio: '14:00',
    hora_fin: '18:00',
  });

  const loadHorarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await disponibilidadService.getAll(user?.id_tutor);
      setHorarios(data || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id_tutor, showError]);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id_tutor) {
      showError('Tu cuenta no tiene un perfil de tutor asociado');
      return;
    }
    
    // Basic validation
    if (formData.hora_inicio >= formData.hora_fin) {
      showError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    setFormLoading(true);
    try {
      await disponibilidadService.create({
        id_tutor: user.id_tutor,
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio + ':00',
        hora_fin: formData.hora_fin + ':00',
      });
      showSuccess('Horario de atención registrado');
      setIsModalOpen(false);
      loadHorarios();
    } catch (err) {
      showError(err.response?.data?.mensaje || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setFormLoading(true);
    try {
      await disponibilidadService.delete(deletingId);
      showSuccess('Horario eliminado');
      setIsDeleteOpen(false);
      loadHorarios();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Agrupar horarios por día
  const horariosAgrupados = DIAS.reduce((acc, dia) => {
    acc[dia] = horarios.filter(h => h.dia_semana === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Disponibilidad Horaria</h1>
          <p className="page-description">
            Configura los bloques de tiempo en los que los estudiantes podrán agendar tutorías contigo.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Agregar Horario</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando configuración de horarios...
        </div>
      ) : horarios.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,51,160,0.05)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
          }}>
            <CalendarClock size={40} color="var(--upds-blue)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--upds-blue-dark)', marginBottom: '0.5rem' }}>No tienes horarios configurados</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Para que los estudiantes puedan solicitar tutorías, es obligatorio que definas al menos un bloque horario de disponibilidad en la semana.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <Plus size={18} />
            <span>Configurar Mi Primer Horario</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {DIAS.map(dia => {
            const bloques = horariosAgrupados[dia];
            const hasBloques = bloques.length > 0;
            
            return (
              <div key={dia} className="card" style={{ 
                padding: '0', 
                overflow: 'hidden', 
                borderTop: hasBloques ? '4px solid var(--upds-blue)' : '4px solid #e2e8f0' 
              }}>
                <div style={{ 
                  background: hasBloques ? 'rgba(0,51,160,0.03)' : '#f8fafc', 
                  padding: '1rem 1.5rem', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: hasBloques ? 'var(--upds-blue-dark)' : 'var(--text-muted)' }}>
                    {DIAS_LABELS[dia]}
                  </h3>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    background: hasBloques ? 'var(--upds-blue)' : '#cbd5e1', 
                    color: '#fff', 
                    padding: '2px 8px', 
                    borderRadius: '12px' 
                  }}>
                    {bloques.length} bloques
                  </span>
                </div>
                
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!hasBloques ? (
                    <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '1rem 0', fontSize: '0.9rem' }}>
                      Sin disponibilidad este día
                    </div>
                  ) : (
                    bloques.map(h => (
                      <div key={h.id_disponibilidad} style={{ 
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        position: 'relative',
                        background: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{ background: 'var(--upds-gold)', padding: '6px', borderRadius: '6px', color: '#fff' }}>
                            <Clock size={16} />
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-color)' }}>
                            {h.hora_inicio.slice(0, 5)} - {h.hora_fin.slice(0, 5)}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--upds-green)', marginLeft: '2.25rem' }}>
                          <CheckCircle size={14} />
                          <span>Disponible para agendar</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setDeletingId(h.id_disponibilidad);
                            setIsDeleteOpen(true);
                          }}
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--upds-red)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                          title="Eliminar este horario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Agregar Horario */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Horario de Atención Semanal">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Día de la Semana</label>
            <select
              className="form-control"
              value={formData.dia_semana}
              onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
            >
              {DIAS.map((d) => (
                <option key={d} value={d}>{DIAS_LABELS[d]}</option>
              ))}
            </select>
            <small className="form-help">Este horario se repetirá todos los {DIAS_LABELS[formData.dia_semana].toLowerCase()}s.</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Hora de Inicio</label>
              <input
                type="time"
                className="form-control"
                required
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hora de Fin</label>
              <input
                type="time"
                className="form-control"
                required
                value={formData.hora_fin}
                onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,184,28,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} color="var(--upds-gold)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: 1.4 }}>
              Recuerda que el bloque debe durar un <strong>mínimo de 30 minutos</strong> y un <strong>máximo de 3 horas</strong>.
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar Horario'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar este bloque horario?"
        message="Los estudiantes ya no podrán agendar sesiones en este bloque. Las tutorías previamente agendadas no se verán afectadas."
        isLoading={formLoading}
      />
    </div>
  );
};
