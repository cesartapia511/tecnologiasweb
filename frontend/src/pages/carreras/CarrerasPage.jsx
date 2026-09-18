import React, { useState, useEffect, useCallback } from 'react';
import { carrerasService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Search, Edit2, Trash2, GraduationCap, RefreshCw } from 'lucide-react';

export const CarrerasPage = () => {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await carrerasService.getAll();
      setCarreras(data || []);
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
    setEditingCarrera(null);
    setNombre('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCarrera(c);
    setNombre(c.nombre_carrera);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setFormLoading(true);
    try {
      if (editingCarrera) {
        await carrerasService.update(editingCarrera.id_carrera, nombre);
        showSuccess('Carrera actualizada con éxito');
      } else {
        await carrerasService.create(nombre);
        showSuccess('Carrera creada exitosamente');
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
      await carrerasService.delete(deletingId);
      showSuccess('Carrera eliminada');
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = carreras.filter((c) =>
    c.nombre_carrera.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Carreras Universitarias</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Programas de pregrado registrados en UPDS Tarija
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={18} />
          <span>Nueva Carrera</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="header-search" style={{ width: '320px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar carrera..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            Cargando carreras...
          </div>
        ) : filtered.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Programa / Carrera</th>
                  <th>Total Materias</th>
                  <th>Estudiantes Matriculados</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id_carrera}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{c.id_carrera}</td>
                    <td style={{ fontWeight: 600, color: 'var(--upds-blue-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={18} color="var(--upds-red)" />
                        <span>{c.nombre_carrera}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-tutor">{c.total_materias || 0} materias</span>
                    </td>
                    <td>
                      <span className="badge badge-estudiante">{c.total_estudiantes || 0} alumnos</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button onClick={() => handleOpenEdit(c)} className="btn btn-outline btn-sm">
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(c.id_carrera);
                            setIsDeleteOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--upds-red)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No se encontraron carreras registradas.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCarrera ? 'Editar Carrera' : 'Registrar Nueva Carrera'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de la Carrera</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Ej: Ingeniería de Sistemas, Derecho, Administración..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
              {formLoading ? 'Guardando...' : editingCarrera ? 'Actualizar' : 'Crear Carrera'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar esta carrera?"
        message="Si la carrera tiene materias o estudiantes inscritos, la base de datos protegerá la integridad referencial."
        isLoading={formLoading}
      />
    </div>
  );
};
