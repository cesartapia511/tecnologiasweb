import React, { useState, useEffect, useCallback } from 'react';
import { usuariosService, rolesService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Search, Edit2, Trash2, UserPlus, RefreshCw } from 'lucide-react';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    usuario: '',
    clave: '',
    telefono: '',
    id_rol: '2',
    estado: 'activo',
  });

  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uData, rData] = await Promise.all([
        usuariosService.getAll(),
        rolesService.getAll(),
      ]);
      setUsuarios(uData || []);
      setRoles(rData || []);
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
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      usuario: '',
      clave: 'password',
      telefono: '',
      id_rol: '2',
      estado: 'activo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      correo: user.correo || '',
      usuario: user.usuario || '',
      clave: '',
      telefono: user.telefono || '',
      id_rol: String(user.id_rol || (roles.find(r => r.nombre_rol === user.nombre_rol)?.id_rol || '2')),
      estado: user.estado || 'activo',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        await usuariosService.update(editingUser.id_usuario, formData);
        showSuccess('Usuario actualizado correctamente');
      } else {
        await usuariosService.create(formData);
        showSuccess('Usuario registrado con éxito');
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
      await usuariosService.delete(deletingId);
      showSuccess('Usuario eliminado del sistema');
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = usuarios.filter((u) => {
    const matchSearch =
      u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(search.toLowerCase()) ||
      u.correo?.toLowerCase().includes(search.toLowerCase()) ||
      u.usuario?.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRole ? u.nombre_rol === selectedRole : true;
    const matchEstado = selectedEstado ? u.estado === selectedEstado : true;
    return matchSearch && matchRole && matchEstado;
  });

  return (
    <div>
      {/* Header Sección */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Control de cuentas, perfiles de docentes, estudiantes y administradores
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <UserPlus size={18} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="header-search" style={{ width: '300px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Filtrar rol:</span>
            <select
              className="form-control"
              style={{ width: '160px', padding: '0.45rem 0.75rem' }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="tutor">Docente Tutor</option>
              <option value="estudiante">Estudiante</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Estado:</span>
            <select
              className="form-control"
              style={{ width: '130px', padding: '0.45rem 0.75rem' }}
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Cargando lista de usuarios...
          </div>
        ) : filtered.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id_usuario}>
                    <td style={{ fontWeight: 600, color: 'var(--upds-blue)' }}>
                      @{u.usuario}
                    </td>
                    <td>{u.nombre} {u.apellido}</td>
                    <td>{u.correo}</td>
                    <td>
                      <RoleBadge role={u.nombre_rol} />
                    </td>
                    <td>
                      <StatusBadge status={u.estado} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-outline btn-sm"
                          title="Editar usuario"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(u.id_usuario);
                            setIsDeleteOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--upds-red)' }}
                          title="Eliminar usuario"
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
            No se encontraron usuarios que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Usuario de acceso</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Rol en el Sistema</label>
              <select
                className="form-control"
                value={formData.id_rol}
                onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre_rol.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-control"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Teléfono / WhatsApp</label>
              <input
                type="text"
                className="form-control"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {editingUser ? 'Contraseña (dejar en blanco para conservar)' : 'Contraseña Inicial'}
              </label>
              <input
                type="password"
                className="form-control"
                placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                value={formData.clave}
                onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                required={!editingUser}
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
              {formLoading ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar este usuario?"
        message="Se eliminará la cuenta del usuario seleccionado. Si tiene tutorías o perfiles vinculados, el sistema impedirá la acción por seguridad referencial."
        isLoading={formLoading}
      />
    </div>
  );
};
