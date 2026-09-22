import React, { useState, useEffect, useCallback } from 'react';
import { materiasService, carrerasService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Search, Edit2, Trash2, BookOpen, RefreshCw, CalendarDays } from 'lucide-react';

export const MateriasPage = () => {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('');

  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre_materia: '',
    id_carrera: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mData, cData] = await Promise.all([
        materiasService.getAll(),
        carrerasService.getAll(),
      ]);
      setMaterias(mData || []);
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

  const handleOpenCreate = () => {
    setEditingMateria(null);
    setFormData({
      nombre_materia: '',
      id_carrera: carreras[0]?.id_carrera || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMateria(m);
    setFormData({
      nombre_materia: m.nombre_materia,
      id_carrera: m.id_carrera || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_materia.trim()) return;
    setFormLoading(true);
    try {
      if (editingMateria) {
        await materiasService.update(editingMateria.id_materia, formData);
        showSuccess('Materia actualizada con éxito');
      } else {
        await materiasService.create(formData);
        showSuccess('Materia registrada correctamente');
      }
      setIsModalOpen(false);
      loadData();
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
      await materiasService.delete(deletingId);
      showSuccess('Materia eliminada');
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = materias.filter((m) => {
    const matchSearch = m.nombre_materia.toLowerCase().includes(search.toLowerCase());
    const matchCarrera = selectedCarrera ? String(m.id_carrera) === String(selectedCarrera) : true;
    return matchSearch && matchCarrera;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Catálogo de Materias</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Asignaturas académicas disponibles para tutorías de refuerzo
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={18} />
            <span>Nueva Materia</span>
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="header-search" style={{ width: '300px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por materia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Carrera:</span>
            <select
              className="form-control"
              style={{ width: '220px', padding: '0.45rem 0.75rem' }}
              value={selectedCarrera}
              onChange={(e) => setSelectedCarrera(e.target.value)}
            >
              <option value="">Todas las carreras</option>
              {carreras.map((c) => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </option>
              ))}
            </select>
          </div>

          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Cargando materias...
          </div>
        ) : filtered.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre de la Asignatura</th>
                  <th>Carrera Vinculada</th>
                  <th>Tutores Asignados</th>
                  <th>Tutorías Registradas</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id_materia}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{m.id_materia}</td>
                    <td style={{ fontWeight: 600, color: 'var(--upds-blue-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={17} color="var(--upds-blue)" />
                        <span>{m.nombre_materia}</span>
                      </div>
                    </td>
                    <td>{m.nombre_carrera || 'Tronco Común'}</td>
                    <td>
                      <span className="badge badge-tutor">{m.total_tutores || 0} docentes</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                        <CalendarDays size={12} style={{ marginRight: '4px' }} />
                        {m.total_tutorias || 0} sesiones
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button onClick={() => handleOpenEdit(m)} className="btn btn-outline btn-sm">
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(m.id_materia);
                              setIsDeleteOpen(true);
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--upds-red)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No se encontraron materias registradas.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMateria ? 'Editar Materia' : 'Registrar Nueva Materia'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de la Materia</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Ej: Base de Datos I, Programación Web..."
              value={formData.nombre_materia}
              onChange={(e) => setFormData({ ...formData, nombre_materia: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Carrera Perteneciente</label>
            <select
              className="form-control"
              value={formData.id_carrera}
              onChange={(e) => setFormData({ ...formData, id_carrera: e.target.value })}
            >
              <option value="">-- Sin carrera específica / Tronco común --</option>
              {carreras.map((c) => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </option>
              ))}
            </select>
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
              {formLoading ? 'Guardando...' : editingMateria ? 'Actualizar' : 'Guardar Materia'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar esta materia?"
        message="No se podrá eliminar si existen tutorías agendadas para esta materia."
        isLoading={formLoading}
      />
    </div>
  );
};
