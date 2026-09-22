import React, { useState, useEffect, useCallback } from 'react';
import { evaluacionesService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Star, BookOpen, RefreshCw } from 'lucide-react';

export const EvaluacionesPage = () => {
  const { user, isDocente } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCalificacion, setSelectedCalificacion] = useState('');
  const [selectedFecha, setSelectedFecha] = useState('');
  const { showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.getAll(isDocente ? user?.id_tutor : null);
      setEvaluaciones(data || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isDocente, user?.id_tutor, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEvaluaciones = evaluaciones.filter(ev => {
    if (selectedCalificacion && String(ev.calificacion) !== String(selectedCalificacion)) return false;
    if (selectedFecha && ev.fecha_evaluacion?.slice(0, 10) !== selectedFecha) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchMateria = ev.nombre_materia?.toLowerCase().includes(term);
      const matchEstudiante = (ev.estudiante_nombre + ' ' + ev.estudiante_apellido).toLowerCase().includes(term);
      const matchTutor = (ev.tutor_nombre + ' ' + ev.tutor_apellido).toLowerCase().includes(term);
      return matchMateria || matchEstudiante || matchTutor;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Evaluaciones y Opiniones de Tutorías</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Retroalimentación y calificaciones otorgadas por los estudiantes
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por materia, tutor o estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <input
              type="date"
              className="form-control"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-control"
              value={selectedCalificacion}
              onChange={(e) => setSelectedCalificacion(e.target.value)}
            >
              <option value="">Cualquier Nota</option>
              <option value="5">5 Estrellas</option>
              <option value="4">4 Estrellas</option>
              <option value="3">3 Estrellas</option>
              <option value="2">2 Estrellas</option>
              <option value="1">1 Estrella</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando evaluaciones...
        </div>
      ) : filteredEvaluaciones.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filteredEvaluaciones.map((ev) => (
            <div key={ev.id_evaluacion} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--upds-blue-dark)', fontWeight: 600 }}>
                    <BookOpen size={16} color="var(--upds-red)" />
                    <span>{ev.nombre_materia}</span>
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>
                    Estudiante: {ev.estudiante_nombre} {ev.estudiante_apellido}
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--upds-gold-hover)', fontWeight: 700 }}>
                  <Star size={16} fill="var(--upds-gold)" />
                  <span>{ev.calificacion}.0</span>
                </div>
              </div>

              <p style={{ color: '#334155', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1rem', flex: 1 }}>
                "{ev.comentario || 'El estudiante no dejó comentarios por escrito.'}"
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Docente: Lic. {ev.tutor_nombre} {ev.tutor_apellido}</span>
                <span>{ev.fecha_evaluacion ? ev.fecha_evaluacion.slice(0, 10) : ''}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Star size={44} color="var(--upds-gold)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3>No hay evaluaciones registradas aún</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto', maxWidth: '420px' }}>
            Las opiniones aparecerán aquí cuando los alumnos califiquen las tutorías completadas.
          </p>
        </div>
      )}
    </div>
  );
};
