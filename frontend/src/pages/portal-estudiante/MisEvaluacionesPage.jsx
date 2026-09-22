import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tutoriasService, evaluacionesService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { Star, FileText, CheckCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { EvaluacionesTutor } from '../tutores/EvaluacionesTutor';

const EvaluacionesEstudiante = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [tutorias, setTutorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCalificarOpen, setIsCalificarOpen] = useState(false);
  const [selectedTutoria, setSelectedTutoria] = useState(null);
  const [calificacionData, setCalificacionData] = useState({ calificacion: 5, comentario: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchTutorias = async () => {
    setLoading(true);
    try {
      const data = await tutoriasService.getAll({ id_estudiante: user?.id_estudiante });
      // Filtrar solo las realizadas
      const realizadas = (data || []).filter(t => t.estado === 'realizada');
      setTutorias(realizadas);
    } catch (error) {
      showError('Error al cargar historial de evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id_estudiante) {
      fetchTutorias();
    }
  }, [user?.id_estudiante]);

  const handleOpenCalificar = (tut) => {
    setSelectedTutoria(tut);
    setCalificacionData({ calificacion: 5, comentario: '' });
    setIsCalificarOpen(true);
  };

  const handleSaveCalificacion = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await evaluacionesService.create({
        id_tutoria: selectedTutoria.id_tutoria,
        calificacion: calificacionData.calificacion,
        comentario: calificacionData.comentario,
      });
      showSuccess('Evaluación registrada con éxito');
      setIsCalificarOpen(false);
      fetchTutorias();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando evaluaciones...</div>;
  }

  const pendientesDeEvaluar = tutorias.filter(t => !t.calificacion);
  const yaEvaluadas = tutorias.filter(t => t.calificacion);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Evaluaciones</h1>
          <p className="page-description">Evalúa la calidad de las sesiones de tutoría académica recibidas.</p>
        </div>
      </div>

      {tutorias.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Star size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>Sin sesiones finalizadas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Debes tener sesiones de tutoría marcadas como "Realizadas" para poder evaluarlas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {pendientesDeEvaluar.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--upds-blue-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} color="var(--upds-gold)" fill="var(--upds-gold)" />
                Pendientes de Evaluar
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {pendientesDeEvaluar.map(tutoria => (
                  <div key={tutoria.id_tutoria} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--upds-gold)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-color)' }}>{tutoria.nombre_materia}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Lic. {tutoria.tutor_nombre} {tutoria.tutor_apellido}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                        {tutoria.fecha}
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary w-100" 
                      style={{ color: 'var(--upds-gold-hover)', borderColor: 'var(--upds-gold)' }}
                      onClick={() => handleOpenCalificar(tutoria)}
                    >
                      <Star size={16} fill="var(--upds-gold)" />
                      Evaluar Desempeño
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yaEvaluadas.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} />
                Historial de Evaluaciones
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {yaEvaluadas.map(tutoria => (
                  <div key={tutoria.id_tutoria} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-color)' }}>{tutoria.nombre_materia}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Lic. {tutoria.tutor_nombre} {tutoria.tutor_apellido}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--upds-gold-subtle)', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        <Star size={14} fill="#92400e" />
                        {tutoria.calificacion}/5
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', fontStyle: 'italic', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                      "{tutoria.evaluacion_comentario || 'Sin comentario adicional'}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Calificar Tutoría */}
      <Modal
        isOpen={isCalificarOpen}
        onClose={() => setIsCalificarOpen(false)}
        title="Evaluación de Calidad de la Tutoría"
      >
        <form onSubmit={handleSaveCalificacion}>
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Califica el nivel de claridad y apoyo brindado por el docente tutor:
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCalificacionData({ ...calificacionData, calificacion: star })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '2rem',
                    color: star <= calificacionData.calificacion ? 'var(--upds-gold)' : '#cbd5e1',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <span style={{ fontWeight: 700, color: 'var(--upds-blue-dark)' }}>
              {calificacionData.calificacion} de 5 Estrellas
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Comentarios o sugerencias (Opcional)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="El docente resolvió todas las dudas con paciencia y precisión..."
              value={calificacionData.comentario}
              onChange={(e) => setCalificacionData({ ...calificacionData, comentario: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCalificarOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar Evaluación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const MisEvaluacionesPage = () => {
  const { isDocente } = useAuth();

  if (isDocente) {
    return <EvaluacionesTutor />;
  }

  return <EvaluacionesEstudiante />;
};
