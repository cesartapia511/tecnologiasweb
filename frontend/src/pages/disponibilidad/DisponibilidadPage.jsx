import React, { useState, useEffect } from 'react';
import { disponibilidadService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CalendarClock, Plus, Trash2, Clock, CheckCircle } from 'lucide-react';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

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

  useEffect(() => {
    loadHorarios();
  }, [user]);

  const loadHorarios = async () => {
    setLoading(true);
    try {
      const data = await disponibilidadService.getAll(user?.id_tutor);
      setHorarios(data || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id_tutor) {
      showError('Tu cuenta no tiene un perfil de tutor asociado');
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
      showError(err.message);
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Mis Horarios de Disponibilidad</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Define tus días y franjas horarias semanales para que los alumnos de UPDS puedan agendar tutorías
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Agregar Nuevo Horario</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando horarios...
        </div>
      ) : horarios.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {horarios.map((h) => (
            <div key={h.id_disponibilidad} className="card" style={{ borderTop: '4px solid var(--upds-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--upds-blue-dark)' }}>
                  {h.dia_semana}
                </span>
                <button
                  onClick={() => {
                    setDeletingId(h.id_disponibilidad);
                    setIsDeleteOpen(true);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--upds-red)', padding: '4px' }}
                  title="Eliminar horario"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <Clock size={16} color="var(--upds-gold-hover)" />
                <span>
                  <strong>{h.hora_inicio.slice(0, 5)}</strong> a <strong>{h.hora_fin.slice(0, 5)}</strong>
                </span>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--upds-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={13} />
                <span>Habilitado para agendamiento estudiantil</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CalendarClock size={48} color="var(--upds-blue)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3>No has registrado horarios aún</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0.5rem auto 1.5rem' }}>
            Los estudiantes solo pueden agendar tutorías en los días y horas que tengas definidos aquí.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <Plus size={18} />
            <span>Configurar Mi Primer Horario</span>
          </button>
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
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
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
        message="Los estudiantes ya no podrán agendar sesiones en este horario."
        isLoading={formLoading}
      />
    </div>
  );
};
