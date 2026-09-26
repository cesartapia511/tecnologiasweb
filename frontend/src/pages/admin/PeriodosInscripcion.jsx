import React, { useState, useEffect, useCallback } from 'react';
import { periodosInscripcionService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { RefreshCw, PlusCircle, Power, PowerOff } from 'lucide-react';

export const PeriodosInscripcionPage = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await periodosInscripcionService.obtenerTodos();
      // data might be array or object, assuming it's { success: true, data: [...] } or just array based on typical structure.
      setPeriodos(data.data || data || []);
    } catch (err) {
      showError(err.message || 'Error al cargar periodos');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      showError('La fecha de fin no puede ser menor a la fecha de inicio');
      return;
    }
    setFormLoading(true);
    try {
      await periodosInscripcionService.crear(formData);
      showSuccess('Periodo registrado con éxito');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error al registrar periodo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActivo = async (periodo) => {
    setFormLoading(true);
    try {
      if (periodo.activo == 1) {
        await periodosInscripcionService.desactivar(periodo.id_periodo);
        showSuccess('Periodo desactivado');
      } else {
        await periodosInscripcionService.activar(periodo.id_periodo);
        showSuccess('Periodo activado con éxito');
      }
      loadData();
    } catch (err) {
      showError(err.message || 'Error al cambiar estado del periodo');
    } finally {
      setFormLoading(false);
    }
  };

  const getEstadoPeriodo = (p) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(p.fecha_fin);
    fin.setHours(0, 0, 0, 0);
    
    if (p.activo == 1) return 'ACTIVO';
    if (fin < hoy) return 'VENCIDO';
    return 'INACTIVO';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Periodos de Inscripción</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Control de las fechas de apertura y cierre para inscripción de estudiantes a tutorías.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadData} className="btn btn-secondary" title="Actualizar lista">
            <RefreshCw size={18} />
          </button>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Nuevo Periodo</span>
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Cargando periodos...
          </div>
        ) : periodos.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Fecha inicio</th>
                  <th>Fecha fin</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => {
                  const estado = getEstadoPeriodo(p);
                  let badgeColor = estado === 'ACTIVO' ? 'var(--upds-green)' : estado === 'VENCIDO' ? 'var(--upds-red)' : 'var(--text-muted)';
                  
                  return (
                    <tr key={p.id_periodo}>
                      <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                      <td>{p.descripcion}</td>
                      <td>{p.fecha_inicio}</td>
                      <td>{p.fecha_fin}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: `${badgeColor}20`,
                          color: badgeColor
                        }}>
                          {estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleActivo(p)}
                          className="btn btn-outline btn-sm"
                          disabled={formLoading}
                          title={p.activo == 1 ? "Desactivar" : "Activar"}
                          style={{ color: p.activo == 1 ? 'var(--upds-red)' : 'var(--upds-green)' }}
                        >
                          {p.activo == 1 ? <PowerOff size={15} /> : <Power size={15} />}
                          <span style={{ marginLeft: '4px' }}>
                            {p.activo == 1 ? 'Desactivar' : 'Activar'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No hay periodos de inscripción registrados.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Periodo"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Periodo</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha de Inicio</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Fin</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar Periodo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
