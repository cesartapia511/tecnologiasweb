import React, { useState, useEffect, useCallback } from 'react';
import { tutoresService, materiasService, solicitudesMateriasService } from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Star,
  BookOpen,
  Mail,
  Edit3,
  RefreshCw,
  Search,
  CheckCircle,
} from 'lucide-react';

export const TutoresPage = () => {
  const [tutores, setTutores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [editingTutor, setEditingTutor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [todasSolicitudes, setTodasSolicitudes] = useState([]);
  const [activeTab, setActiveTab] = useState('directorio');

  const [formData, setFormData] = useState({
    especialidad: '',
    biografia: '',
    materias_ids: [],
  });

  const { isAdmin, isDocente, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [tData, mData, sData] = await Promise.all([
        tutoresService.getAll(),
        materiasService.getAll(),
        isAdmin ? solicitudesMateriasService.getAll() : Promise.resolve([]),
      ]);

      setTutores(tData || []);
      setMaterias(mData || []);
      setTodasSolicitudes(sData || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

    setFormData({
      ...formData,
      materias_ids: ids,
    });
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

  const filteredTutores = tutores.filter((t) => {
    const term = search.toLowerCase();

    const matchSearch =
      (t.nombre + ' ' + t.apellido).toLowerCase().includes(term) ||
      (t.especialidad || '').toLowerCase().includes(term);

    const matchMateria = selectedMateria
      ? t.materias?.some(
          (m) => String(m.id_materia) === String(selectedMateria)
        )
      : true;

    return matchSearch && matchMateria;
  });

  return (
    <div>
      {/* Encabezado */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2>Directorio de Docentes Tutores</h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            Cuerpo docente UPDS Tarija y áreas de especialización académica
          </p>
        </div>
      </div>
      
      {isAdmin && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            className={`btn ${activeTab === 'directorio' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
            onClick={() => setActiveTab('directorio')}
          >
            Directorio
          </button>
          <button 
            className={`btn ${activeTab === 'solicitudes' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
            onClick={() => setActiveTab('solicitudes')}
          >
            Solicitudes de Materias
            {todasSolicitudes.filter(s => s.estado === 'pendiente').length > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: '8px', background: 'var(--upds-red)', color: 'white' }}>
                {todasSolicitudes.filter(s => s.estado === 'pendiente').length}
              </span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'directorio' && (
      <>
      {/* Filtros */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="header-search"
            style={{ width: '300px' }}
          >
            <Search
              size={18}
              color="var(--text-muted)"
            />

            <input
              type="text"
              placeholder="Buscar por nombre, especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '220px' }}>
            <select
              className="form-control"
              value={selectedMateria}
              onChange={(e) => setSelectedMateria(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.88rem',
              }}
            >
              <option value="">Todas las Materias</option>

              {materias.map((m) => (
                <option
                  key={m.id_materia}
                  value={m.id_materia}
                >
                  {m.nombre_materia}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Lista de tutores */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)',
          }}
        >
          Cargando tutores...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredTutores.map((t) => {
            const canEditThis = isAdmin;

            return (
              <div
                key={t.id_tutor}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Información principal */}
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--upds-blue) 0%, var(--upds-red) 100%)',
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
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        marginBottom: '0.15rem',
                      }}
                    >
                      Lic. {t.nombre} {t.apellido}
                    </h3>

                    <div
                      style={{
                        color: 'var(--upds-red)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      {t.especialidad || 'Docente Tutor UPDS'}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        color: 'var(--upds-gold-hover)',
                        marginTop: '0.25rem',
                      }}
                    >
                      <Star
                        size={14}
                        fill="var(--upds-gold)"
                      />

                      <span>
                        {t.calificacion_promedio} / 5.0
                      </span>

                      <span
                        style={{
                          color: 'var(--text-muted)',
                        }}
                      >
                        ({t.total_evaluaciones} opiniones)
                      </span>
                    </div>
                  </div>

                  <div style={{ alignSelf: 'flex-start' }}>
                    <StatusBadge
                      status={t.estado || 'activo'}
                    />
                  </div>
                </div>

                {/* Tutorías realizadas */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      background: '#e0e7ff',
                      color: '#3730a3',
                    }}
                  >
                    <CheckCircle
                      size={12}
                      style={{ marginRight: '4px' }}
                    />

                    {t.tutorias_realizadas || 0} Tutorías Realizadas
                  </span>
                </div>

                {/* Biografía */}
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '1rem',
                    flex: 1,
                  }}
                >
                  {t.biografia ||
                    'Docente disponible para acompañamiento pedagógico, tutorías personalizadas y refuerzo de contenidos.'}
                </p>

                {/* Materias asignadas */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Materias que Imparte:
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                    }}
                  >
                    {t.materias?.length > 0 ? (
                      t.materias.map((m) => (
                        <span
                          key={m.id_materia}
                          className="badge badge-tutor"
                          style={{
                            fontSize: '0.75rem',
                          }}
                        >
                          <BookOpen size={12} />
                          {m.nombre_materia}
                        </span>
                      ))
                    ) : (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Sin materias asignadas aún
                      </span>
                    )}
                  </div>
                </div>

                {/* Contacto y acciones */}
                <div
                  style={{
                    borderTop:
                      '1px solid var(--border-color)',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
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

      {/* Modal Editar Perfil y Asignar Materias */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Editar Perfil: ${editingTutor?.nombre || ''} ${
          editingTutor?.apellido || ''
        }`}
      >
        <form onSubmit={handleSubmit}>
          {/* Especialidad */}
          <div className="form-group">
            <label className="form-label">
              Especialidad / Área de Conocimiento
            </label>

            <input
              type="text"
              className="form-control"
              required
              value={formData.especialidad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  especialidad: e.target.value,
                })
              }
            />
          </div>

          {/* Biografía */}
          <div className="form-group">
            <label className="form-label">
              Biografía Profesional / Presentación
            </label>

            <textarea
              className="form-control"
              rows="3"
              value={formData.biografia}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  biografia: e.target.value,
                })
              }
            />
          </div>

          {/* Materias */}
          <div className="form-group">
            <label className="form-label">
              Materias que Imparte este Docente
            </label>

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border:
                  '1px solid var(--border-color)',
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
                    checked={formData.materias_ids.includes(
                      m.id_materia
                    )}
                    onChange={() =>
                      handleToggleMateria(m.id_materia)
                    }
                  />

                  <span>
                    {m.nombre_materia}{' '}
                    <small
                      style={{
                        color: 'var(--text-muted)',
                      }}
                    >
                      ({m.nombre_carrera})
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div
            className="modal-footer"
            style={{
              margin:
                '1.5rem -1.5rem -1.5rem -1.5rem',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={formLoading}
            >
              {formLoading
                ? 'Guardando...'
                : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>
      </>
      )}

      {activeTab === 'solicitudes' && isAdmin && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tutor</th>
                <th>Materia</th>
                <th>Día</th>
                <th>Turno/Horario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {todasSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay solicitudes registradas
                  </td>
                </tr>
              ) : (
                todasSolicitudes.map(sol => (
                  <tr key={sol.id_solicitud}>
                    <td>Lic. {sol.tutor_nombres} {sol.tutor_apellidos}</td>
                    <td>{sol.nombre_materia} ({sol.nombre_carrera || 'General'})</td>
                    <td>{sol.dia_semana}</td>
                    <td>{sol.hora_inicio?.slice(0,5)} - {sol.hora_fin?.slice(0,5)}</td>
                    <td>
                      <StatusBadge status={sol.estado === 'aprobada' ? 'realizada' : (sol.estado === 'rechazada' ? 'cancelada' : 'pendiente')} />
                    </td>
                    <td>
                      {sol.estado === 'pendiente' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={async () => {
                              try {
                                await solicitudesMateriasService.resolve(sol.id_solicitud, 'aprobada');
                                showSuccess('Solicitud aprobada');
                                loadData();
                              } catch (e) {
                                showError(e.response?.data?.mensaje || 'Error al aprobar');
                              }
                            }}
                          >
                            Aprobar
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--upds-red)', borderColor: 'var(--upds-red)' }}
                            onClick={async () => {
                              try {
                                await solicitudesMateriasService.resolve(sol.id_solicitud, 'rechazada');
                                showSuccess('Solicitud rechazada');
                                loadData();
                              } catch (e) {
                                showError(e.response?.data?.mensaje || 'Error al rechazar');
                              }
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Resuelta el {sol.fecha_resolucion ? new Date(sol.fecha_resolucion).toLocaleDateString() : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};