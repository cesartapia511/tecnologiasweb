import React, { useState, useEffect, useCallback } from 'react';
import { estudiantesService, carrerasService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { Search, Edit2, GraduationCap, RefreshCw, Phone, Mail } from 'lucide-react';

export const EstudiantesPage = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    id_carrera: '',
    semestre: 1,
    registro_universitario: '',
  });

  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eData, cData] = await Promise.all([
        estudiantesService.getAll(),
        carrerasService.getAll(),
      ]);
      setEstudiantes(eData || []);
      setCarreras(cData || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenEdit = (est) => {
    setEditingEstudiante(est);
    setFormData({
      id_carrera: est.id_carrera || (carreras[0]?.id_carrera || ''),
      semestre: est.semestre || 1,
      registro_universitario: est.registro_universitario || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await estudiantesService.update({
        id_estudiante: editingEstudiante.id_estudiante,
        id_carrera: formData.id_carrera,
        semestre: formData.semestre,
        registro_universitario: formData.registro_universitario,
      });
      showSuccess('Datos de estudiante actualizados');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = estudiantes.filter((est) => {
    const matchSearch =
      est.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      est.apellido?.toLowerCase().includes(search.toLowerCase()) ||
      est.registro_universitario?.toLowerCase().includes(search.toLowerCase()) ||
      est.correo?.toLowerCase().includes(search.toLowerCase());
    const matchCarrera = selectedCarrera ? String(est.id_carrera) === String(selectedCarrera) : true;
    return matchSearch && matchCarrera;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Padrón de Estudiantes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Alumnos matriculados en programas de pregrado de la UPDS Sede Tarija
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '320px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por nombre, RU o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '220px' }}>
            <select
              className="form-control"
              value={selectedCarrera}
              onChange={(e) => setSelectedCarrera(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
            >
              <option value="">Todas las Carreras</option>
              {carreras.map((c) => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total matriculados: <strong>{filtered.length}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Cargando estudiantes...
          </div>
        ) : filtered.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estudiante</th>
                  <th>Registro Univ. (RU)</th>
                  <th>Carrera</th>
                  <th>Semestre</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((est) => (
                  <tr key={est.id_estudiante}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{est.id_estudiante}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--upds-blue-dark)' }}>
                        {est.nombre} {est.apellido}
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>@{est.usuario}</small>
                    </td>
                    <td>
                      <span className="badge badge-estudiante" style={{ fontFamily: 'monospace' }}>
                        {est.registro_universitario || 'Sin asignar'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GraduationCap size={15} color="var(--upds-red)" />
                        <span>{est.nombre_carrera || 'Ingeniería de Sistemas'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-tutor">{est.semestre}° Semestre</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} color="var(--text-muted)" />
                          {est.correo}
                        </span>
                        {est.telefono && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <Phone size={12} />
                            {est.telefono}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={est.estado || 'activo'} />
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenEdit(est)}
                          className="btn btn-outline btn-sm"
                          title="Editar datos académicos"
                        >
                          <Edit2 size={14} />
                          <span>Editar</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No se encontraron estudiantes registrados.
          </div>
        )}
      </div>

      {/* Modal Editar Datos Académicos */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Datos Académicos: ${editingEstudiante?.nombre} ${editingEstudiante?.apellido}`}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Carrera Universitaria</label>
            <select
              className="form-control"
              value={formData.id_carrera}
              onChange={(e) => setFormData({ ...formData, id_carrera: Number(e.target.value) })}
              required
            >
              {carreras.map((c) => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Semestre Actual</label>
            <select
              className="form-control"
              value={formData.semestre}
              onChange={(e) => setFormData({ ...formData, semestre: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={s}>
                  {s}° Semestre
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Registro Universitario (RU)</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.registro_universitario}
              onChange={(e) => setFormData({ ...formData, registro_universitario: e.target.value })}
            />
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
