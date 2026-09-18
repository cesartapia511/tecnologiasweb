import React, { useState, useEffect } from 'react';
import { tutoresService, materiasService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { UserCheck, Star, BookOpen, Mail, Phone, Edit3, RefreshCw } from 'lucide-react';

export const TutoresPage = () => {
  const [tutores, setTutores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTutor, setEditingTutor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    especialidad: '',
    biografia: '',
    materias_ids: [],
  });

  const { isAdmin, isDocente, user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, mData] = await Promise.all([
        tutoresService.getAll(),
        materiasService.getAll(),
      ]);
      setTutores(tData || []);
      setMaterias(mData || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (tutor) => {
    setEditingTutor(tutor);
    setFormData({
      especialidad: tutor.especialidad || '',
      biografia: tutor.biografia || '',
      materias_ids: tutor.materias?.map((m) => m.id_materia) || [],
    });
    setIsModalOpen(true);
  };

  const handleToggleMateria = (id) => {
    const ids = [...formData.materias_ids];
    const index = ids.indexOf(id);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(id);
    }
    setFormData({ ...formData, materias_ids: ids });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await tutoresService.update({
        id_tutor: editingTutor.id_tutor,
        especialidad: formData.especialidad,
        biografia: formData.biografia,
        materias_ids: formData.materias_ids,
      });
      showSuccess('Perfil y materias de tutor actualizados');
      setIsModalOpen(false);
      loadData();
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
          <h2>Directorio de Docentes Tutores</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Cuerpo docente UPDS Tarija y áreas de especialización académica
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando tutores...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {tutores.map((t) => {
            const canEditThis = isAdmin || (isDocente && user?.id_tutor === t.id_tutor);
            return (
              <div key={t.id_tutor} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--upds-blue) 0%, var(--upds-red) 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  >
                    {t.nombre?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>
                      Lic. {t.nombre} {t.apellido}
                    </h3>
                    <div style={{ color: 'var(--upds-red)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {t.especialidad || 'Docente Tutor UPDS'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--upds-gold-hover)', marginTop: '0.25rem' }}>
                      <Star size={14} fill="var(--upds-gold)" />
                      <span>{t.calificacion_promedio} / 5.0</span>
                      <span style={{ color: 'var(--text-muted)' }}>({t.total_evaluaciones} opiniones)</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem', flex: 1 }}>
                  {t.biografia || 'Docente disponible para acompañamiento pedagógico, tutorías personalizadas y refuerzo de contenidos.'}
                </p>

                {/* Materias asignadas */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Materias que Imparte:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {t.materias?.length > 0 ? (
                      t.materias.map((m) => (
                        <span key={m.id_materia} className="badge badge-tutor" style={{ fontSize: '0.75rem' }}>
                          <BookOpen size={12} />
                          {m.nombre_materia}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Sin materias asignadas aún
                      </span>
                    )}
                  </div>
                </div>

                {/* Contacto & Acciones */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} />
                    <span>{t.correo}</span>
                  </div>
                  {canEditThis && (
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Edit3 size={13} />
                      <span>Editar Perfil / Materias</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Editar Perfil & Asignar Materias */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Editar Perfil: ${editingTutor?.nombre} ${editingTutor?.apellido}`}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Especialidad / Área de Conocimiento</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.especialidad}
              onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biografía Profesional / Presentación</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.biografia}
              onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Materias que Imparte este Docente</label>
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              {materias.map((m) => (
                <label
                  key={m.id_materia}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.materias_ids.includes(m.id_materia)}
                    onChange={() => handleToggleMateria(m.id_materia)}
                  />
                  <span>
                    {m.nombre_materia} <small style={{ color: 'var(--text-muted)' }}>({m.nombre_carrera})</small>
                  </span>
                </label>
              ))}
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
              {formLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
