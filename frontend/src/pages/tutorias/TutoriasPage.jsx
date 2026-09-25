import React, { useState, useEffect, useCallback } from 'react';
import {
  tutoriasService,
  materiasService,
  tutoresService,
  evaluacionesService,
  cartasService,
  estudiantesService
} from '../../services/dataServices';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  CalendarDays,
  Plus,
  Check,
  X,
  Star,
  Video,
  MapPin,
  BookOpen,
  RefreshCw,
  FileText,
  Printer,
  FileSignature,
} from 'lucide-react';

export const TutoriasPage = () => {
  const { user, role, isAdmin, isDocente, isEstudiante } = useAuth();
  const [tutorias, setTutorias] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  
  // Cartas y Estudiantes para Designación
  const [cartas, setCartas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [activeTab, setActiveTab] = useState('reforzamiento'); // reforzamiento | designaciones

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  
  // Modales
  const [isSolicitudOpen, setIsSolicitudOpen] = useState(false);
  const [isAtenderOpen, setIsAtenderOpen] = useState(false);
  const [isCalificarOpen, setIsCalificarOpen] = useState(false);
  const [isActaOpen, setIsActaOpen] = useState(false);
  const [selectedTutoria, setSelectedTutoria] = useState(null);
  const [actaTutoria, setActaTutoria] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Modales Designación
  const [isDesignacionOpen, setIsDesignacionOpen] = useState(false);
  const [isResponderCartaOpen, setIsResponderCartaOpen] = useState(false);
  const [selectedCarta, setSelectedCarta] = useState(null);

  const [designacionData, setDesignacionData] = useState({
    id_estudiante: '',
    id_tutor: '',
    id_modalidad: '1',
  });

  const [responderData, setResponderData] = useState({
    accion: 'aceptar',
    motivo: '',
  });

  // Form Solicitud (Estudiante)
  const [solicitudData, setSolicitudData] = useState({
    id_materia: '',
    id_tutor: '',
    fecha: '',
    hora_inicio: '15:00',
    hora_fin: '18:00',
    modalidad: 'virtual',
    lugar_o_enlace: 'meet.google.com/upds-tarija',
    observaciones: '',
  });

  // Form Atender (Docente)
  const [atenderData, setAtenderData] = useState({
    estado: 'confirmada',
    lugar_o_enlace: '',
    observaciones: '',
  });

  // Form Calificar (Estudiante)
  const [calificacionData, setCalificacionData] = useState({
    calificacion: 5,
    comentario: '',
  });

  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (isDocente && user?.id_tutor) {
        params.id_tutor = user.id_tutor;
      } else if (isEstudiante && user?.id_estudiante) {
        params.id_estudiante = user.id_estudiante;
      }

      const [tData, mData, tutData, cData, estData] = await Promise.all([
        tutoriasService.getAll(params),
        materiasService.getAll(),
        tutoresService.getAll(),
        cartasService.getAll(params),
        isAdmin ? estudiantesService.getAll() : Promise.resolve([]),
      ]);

      setTutorias(tData || []);
      setMaterias(mData || []);
      setTutores(tutData || []);
      setCartas(cData || []);
      setEstudiantes(estData || []);

      if (mData?.length > 0 && tutData?.length > 0) {
        let initialMateria = mData[0].id_materia;
        if (isEstudiante && user?.id_carrera) {
          const userMateria = mData.find(m => String(m.id_carrera) === String(user.id_carrera) || !m.id_carrera);
          if (userMateria) initialMateria = userMateria.id_materia;
        }

        const validTutores = tutData.filter(t => t.materias?.some(m => String(m.id_materia) === String(initialMateria)));
        const initialTutor = validTutores.length > 0 ? validTutores[0].id_tutor : '';

        setSolicitudData((prev) => ({
          ...prev,
          id_materia: initialMateria,
          id_tutor: initialTutor,
          fecha: new Date().toISOString().split('T')[0],
        }));
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isDocente, isEstudiante, user?.id_tutor, user?.id_estudiante, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Crear Solicitud
  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!user?.id_estudiante) {
      showError('Tu cuenta debe tener perfil de estudiante para agendar');
      return;
    }
    setFormLoading(true);
    try {
      await tutoriasService.create({
        id_estudiante: user.id_estudiante,
        id_tutor: solicitudData.id_tutor,
        id_materia: solicitudData.id_materia,
        fecha: solicitudData.fecha,
        hora_inicio: solicitudData.hora_inicio + ':00',
        hora_fin: solicitudData.hora_fin + ':00',
        modalidad: solicitudData.modalidad,
        lugar_o_enlace: solicitudData.lugar_o_enlace,
        observaciones: solicitudData.observaciones,
      });
      showSuccess('Solicitud de tutoría agendada con éxito');
      setIsSolicitudOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir modal atender
  const handleOpenAtender = (tut, nuevoEstado) => {
    setSelectedTutoria(tut);
    setAtenderData({
      estado: nuevoEstado,
      lugar_o_enlace: tut.lugar_o_enlace || (tut.modalidad === 'virtual' ? 'meet.google.com/upds-tarija' : 'Aula 204 - Bloque Central'),
      observaciones: tut.observaciones || '',
    });
    setIsAtenderOpen(true);
  };

  // Guardar estado
  const handleSaveEstado = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await tutoriasService.updateStatus({
        id_tutoria: selectedTutoria.id_tutoria,
        estado: atenderData.estado,
        lugar_o_enlace: atenderData.lugar_o_enlace,
        observaciones: atenderData.observaciones,
      });
      showSuccess(`Tutoría actualizada a: ${atenderData.estado}`);
      setIsAtenderOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir modal calificar
  const handleOpenCalificar = (tut) => {
    setSelectedTutoria(tut);
    setCalificacionData({ calificacion: 5, comentario: '' });
    setIsCalificarOpen(true);
  };

  // Guardar calificación
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
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir Acta Oficial
  const handleOpenActa = (tut) => {
    setActaTutoria(tut);
    setIsActaOpen(true);
  };

  // Crear Designacion
  const handleCrearDesignacion = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await cartasService.create(designacionData);
      showSuccess('Carta de designación y tutoría generadas con éxito');
      setIsDesignacionOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir Modal Responder
  const handleOpenResponder = (carta) => {
    setSelectedCarta(carta);
    setResponderData({ accion: 'aceptar', motivo: '' });
    setIsResponderCartaOpen(true);
  };

  // Guardar Respuesta
  const handleSaveResponder = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await cartasService.updateStatus({
        id_carta: selectedCarta.id_carta,
        accion: responderData.accion,
        motivo: responderData.motivo
      });
      showSuccess(`Carta ${responderData.accion}da con éxito`);
      setIsResponderCartaOpen(false);
      loadData();
    } catch (err) {
      showError(err.message);
    } finally {
      setFormLoading(false);
    }
  };


  // Lógica de filtrado combinado
  const filteredTutorias = tutorias.filter(t => {
    // Filtro por Estado
    if (filtroEstado !== 'todas' && t.estado !== filtroEstado) return false;
    if (selectedFecha && t.fecha !== selectedFecha) return false;
    if (selectedMateria && String(t.id_materia) !== String(selectedMateria)) return false;
    
    // Filtro por Texto de Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchMateria = t.nombre_materia?.toLowerCase().includes(term);
      const matchEstudiante = (t.estudiante_nombre + ' ' + t.estudiante_apellido).toLowerCase().includes(term);
      const matchTutor = (t.tutor_nombre + ' ' + t.tutor_apellido).toLowerCase().includes(term);
      return matchMateria || matchEstudiante || matchTutor;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>
            {role === 'estudiante'
              ? 'Mis Tutorías Académicas'
              : role === 'tutor'
              ? 'Bandeja de Tutorías Asignadas'
              : 'Control y Seguimiento de Tutorías'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registro formal de sesiones de reforzamiento y designaciones - UPDS Tarija
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
          
          {isAdmin && (
            <button onClick={() => setIsDesignacionOpen(true)} className="btn btn-primary" style={{ backgroundColor: 'var(--upds-blue)' }}>
              <FileSignature size={18} />
              <span>Generar Designación</span>
            </button>
          )}

          {(isEstudiante || isAdmin) && (
            <button onClick={() => setIsSolicitudOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Solicitar Tutoría</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('reforzamiento')}
          style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'none', borderBottom: activeTab === 'reforzamiento' ? '3px solid var(--upds-blue)' : '3px solid transparent', color: activeTab === 'reforzamiento' ? 'var(--upds-blue-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'reforzamiento' ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          Reforzamiento Académico (Materias)
        </button>
        <button 
          onClick={() => setActiveTab('designaciones')}
          style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'none', borderBottom: activeTab === 'designaciones' ? '3px solid var(--upds-red)' : '3px solid transparent', color: activeTab === 'designaciones' ? 'var(--upds-red)' : 'var(--text-muted)', fontWeight: activeTab === 'designaciones' ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          Modalidad de Graduación (Designaciones)
        </button>
      </div>

      {activeTab === 'reforzamiento' && (
        <>

      {/* Pestañas de Filtrado por Estado y Búsqueda */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', flex: 1 }}>
            {['todas', 'pendiente', 'confirmada', 'realizada', 'cancelada'].map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`btn ${filtroEstado === estado ? 'btn-primary' : 'btn-outline'}`}
                style={{ textTransform: 'capitalize', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.9rem' }}
              >
                {estado === 'todas' ? 'Todas' : estado === 'confirmada' ? 'Próximas (Confirmadas)' : estado}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por materia, estudiante o tutor..."
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
          <div style={{ minWidth: '200px' }}>
            <select
              className="form-control"
              value={selectedMateria}
              onChange={(e) => setSelectedMateria(e.target.value)}
            >
              <option value="">Todas las materias</option>
              {materias.map((m) => (
                <option key={m.id_materia} value={m.id_materia}>
                  {m.nombre_materia}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista / Cards de Tutorías */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Cargando tutorías...
          </div>
        ) : tutorias.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>{isDocente ? 'Estudiante' : 'Docente Tutor'}</th>
                  <th>Fecha y Horario</th>
                  <th>Modalidad / Lugar</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTutorias.map((t) => (
                  <tr key={t.id_tutoria}>
                    <td style={{ fontWeight: 600, color: 'var(--upds-blue-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={16} color="var(--upds-red)" />
                        <span>{t.nombre_materia}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {isDocente
                          ? `${t.estudiante_nombre} ${t.estudiante_apellido}`
                          : `Lic. ${t.tutor_nombre} ${t.tutor_apellido}`}
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {isDocente ? `R.U.: ${t.registro_universitario || 'Regular'}` : t.tutor_especialidad}
                      </small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarDays size={14} color="var(--upds-blue)" />
                        <span>{t.fecha}</span>
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
                      </small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {t.modalidad === 'virtual' ? (
                          <Video size={15} color="var(--upds-blue)" />
                        ) : (
                          <MapPin size={15} color="var(--upds-red)" />
                        )}
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                          {t.modalidad}
                        </span>
                      </div>
                      {t.lugar_o_enlace && (
                        <small style={{ color: 'var(--text-muted)', display: 'block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.lugar_o_enlace}
                        </small>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={t.estado} />
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {t.observaciones || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {/* Botón Ver Ficha / Acta Oficial */}
                        <button
                          onClick={() => handleOpenActa(t)}
                          className="btn btn-outline btn-sm"
                          title="Ver Ficha Institucional de Tutoría"
                          style={{ color: 'var(--upds-portal-blue)', borderColor: 'var(--upds-portal-blue)' }}
                        >
                          <FileText size={14} />
                          <span>Acta</span>
                        </button>

                        {/* Acciones para Docente */}
                        {(isDocente || isAdmin) && t.estado === 'pendiente' && (
                          <button
                            onClick={() => handleOpenAtender(t, 'confirmada')}
                            className="btn btn-primary btn-sm"
                            title="Confirmar sesión y asignar aula o enlace"
                          >
                            <Check size={14} />
                            <span>Confirmar</span>
                          </button>
                        )}

                        {(isDocente || isAdmin) && t.estado === 'confirmada' && (
                          <button
                            onClick={() => handleOpenAtender(t, 'realizada')}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--upds-green)', borderColor: 'var(--upds-green)' }}
                            title="Marcar como sesión realizada"
                          >
                            <Check size={14} />
                            <span>Finalizar</span>
                          </button>
                        )}

                        {t.estado === 'pendiente' && (
                          <button
                            onClick={() => handleOpenAtender(t, 'cancelada')}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--upds-red)' }}
                            title="Cancelar tutoría"
                          >
                            <X size={14} />
                          </button>
                        )}

                        {/* Acción para Estudiante: Calificar si fue realizada */}
                        {isEstudiante && t.estado === 'realizada' && !t.calificacion && (
                          <button
                            onClick={() => handleOpenCalificar(t)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--upds-gold-hover)', borderColor: 'var(--upds-gold)' }}
                          >
                            <Star size={14} fill="var(--upds-gold)" />
                            <span>Calificar</span>
                          </button>
                        )}

                        {t.calificacion && (
                          <span className="badge" style={{ background: 'var(--upds-gold-subtle)', color: '#92400e', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Star size={12} fill="#92400e" />
                            {t.calificacion}/5
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTutorias.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hay tutorías que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem' }}>
            <CalendarDays size={48} color="var(--upds-blue)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No hay tutorías registradas</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '450px' }}>
              {isEstudiante
                ? 'Puedes solicitar una tutoría de reforzamiento con cualquier docente tutor de la UPDS.'
                : 'Aún no se han registrado sesiones en esta sección.'}
            </p>
            {isEstudiante && (
              <button onClick={() => setIsSolicitudOpen(true)} className="btn btn-primary" style={{ display: 'inline-flex' }}>
                <Plus size={18} />
                <span>Solicitar Tutoría</span>
              </button>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {activeTab === 'designaciones' && (
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Cargando designaciones...
            </div>
          ) : cartas.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Modalidad</th>
                    <th>Tutor Asignado</th>
                    <th>Estudiante</th>
                    <th>Firma Tutor</th>
                    <th>Estado Tutoría</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cartas.map((c) => (
                    <tr key={c.id_carta}>
                      <td style={{ fontWeight: 600 }}>
                        {c.id_modalidad === 1 ? 'Proyecto de Grado' : c.id_modalidad === 2 ? 'Tesis' : 'Trabajo Dirigido'}
                      </td>
                      <td>Lic. {c.tutor_nombre} {c.tutor_apellido}</td>
                      <td>{c.estudiante_nombre} {c.estudiante_apellido}</td>
                      <td>
                        <StatusBadge status={c.tipo_firma} />
                        {c.tipo_firma === 'rechazada' && c.motivo_rechazo && (
                          <small style={{ display: 'block', color: 'var(--upds-red)' }}>
                            Motivo: {c.motivo_rechazo}
                          </small>
                        )}
                      </td>
                      <td><StatusBadge status={c.estado_tutoria} /></td>
                      <td style={{ textAlign: 'right' }}>
                        {isDocente && c.tipo_firma === 'pendiente' && (
                          <button
                            onClick={() => handleOpenResponder(c)}
                            className="btn btn-primary btn-sm"
                          >
                            <FileSignature size={14} />
                            <span>Responder</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem' }}>
              <FileSignature size={48} color="var(--upds-blue)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>No hay cartas de designación</h3>
              <p style={{ color: 'var(--text-muted)' }}>No se encontraron registros de asignaciones formales.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: FICHA / ACTA OFICIAL DE TUTORÍA UPDS (Listo para presentar/imprimir) */}
      <Modal
        isOpen={isActaOpen}
        onClose={() => setIsActaOpen(false)}
        title="Ficha Oficial de Acompañamiento y Tutoría Académica"
        maxWidth="680px"
      >
        {actaTutoria && (
          <div>
            {/* Encabezado del Acta imprimible */}
            <div
              style={{
                border: '2px solid var(--upds-blue)',
                borderRadius: '12px',
                padding: '1.5rem',
                background: '#ffffff',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--upds-blue)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/logo-upds-oficial.png" alt="UPDS" style={{ height: '48px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--upds-blue-dark)', letterSpacing: '0.3px' }}>
                      UNIVERSIDAD PRIVADA DOMINGO SAVIO
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--upds-red)' }}>
                      SEDE TARIJA &bull; DEPARTAMENTO DE APOYO ACADÉMICO
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Vicerrectorado Académico &bull; Gestión 2026
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    N° DE FICHA
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--upds-blue-dark)' }}>
                    ACTA-TUT-{String(actaTutoria.id_tutoria).padStart(5, '0')}
                  </div>
                </div>
              </div>

              {/* Datos de los involucrados */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.86rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: 'var(--upds-blue-dark)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Datos del Estudiante
                  </div>
                  <div><strong>Nombre:</strong> {actaTutoria.estudiante_nombre} {actaTutoria.estudiante_apellido}</div>
                  <div><strong>R.U.:</strong> {actaTutoria.registro_universitario || 'Regular'}</div>
                  <div><strong>Correo:</strong> {actaTutoria.estudiante_correo}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: 'var(--upds-blue-dark)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Datos del Docente Tutor
                  </div>
                  <div><strong>Docente:</strong> Lic. {actaTutoria.tutor_nombre} {actaTutoria.tutor_apellido}</div>
                  <div><strong>Especialidad:</strong> {actaTutoria.tutor_especialidad || 'Tutor UPDS'}</div>
                  <div><strong>Correo:</strong> {actaTutoria.tutor_correo}</div>
                </div>
              </div>

              {/* Detalle Académico */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.86rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--upds-blue-dark)', marginBottom: '6px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Detalle de la Sesión de Reforzamiento
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div><strong>Asignatura:</strong> {actaTutoria.nombre_materia}</div>
                  <div><strong>Fecha:</strong> {actaTutoria.fecha}</div>
                  <div><strong>Horario:</strong> {actaTutoria.hora_inicio.slice(0, 5)} a {actaTutoria.hora_fin.slice(0, 5)}</div>
                  <div><strong>Modalidad:</strong> {actaTutoria.modalidad.toUpperCase()}</div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong>Lugar / Enlace:</strong> {actaTutoria.lugar_o_enlace || 'Campus UPDS Tarija'}
                  </div>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <strong>Temas Desarrollados y Observaciones:</strong>
                  <p style={{ marginTop: '2px', color: '#475569' }}>
                    {actaTutoria.observaciones || 'Sesión de reforzamiento y resolución de consultas académicas correspondiente a la materia.'}
                  </p>
                </div>

                {actaTutoria.calificacion && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>Calificación del Estudiante:</strong>
                    <span style={{ color: 'var(--upds-gold-hover)', fontWeight: 700 }}>
                      ★ {actaTutoria.calificacion} / 5.0
                    </span>
                    {actaTutoria.evaluacion_comentario && (
                      <span style={{ fontStyle: 'italic', color: '#64748b' }}>
                        ("{actaTutoria.evaluacion_comentario}")
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Firmas de Constancia */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto 4px' }}></div>
                  <div style={{ fontWeight: 700 }}>Lic. {actaTutoria.tutor_nombre} {actaTutoria.tutor_apellido}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Firma y Sello del Docente Tutor</div>
                </div>

                <div>
                  <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto 4px' }}></div>
                  <div style={{ fontWeight: 700 }}>{actaTutoria.estudiante_nombre} {actaTutoria.estudiante_apellido}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Firma de Conformidad del Estudiante</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsActaOpen(false)}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
                title="Imprimir Acta"
              >
                <Printer size={16} />
                <span>Imprimir Ficha Oficial</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Solicitar Tutoría (Estudiante) */}
      <Modal isOpen={isSolicitudOpen} onClose={() => setIsSolicitudOpen(false)} title="Solicitar Nueva Tutoría Académica">
        <form onSubmit={handleSolicitar}>
          <div className="form-group">
            <label className="form-label">Asignatura que deseas reforzar</label>
            <select
              className="form-control"
              value={solicitudData.id_materia}
              onChange={(e) => {
                const newMateriaId = e.target.value;
                const newTutores = tutores.filter(t => t.materias?.some(m => String(m.id_materia) === String(newMateriaId)));
                setSolicitudData({ 
                  ...solicitudData, 
                  id_materia: newMateriaId,
                  id_tutor: newTutores.length > 0 ? newTutores[0].id_tutor : ''
                });
              }}
              required
            >
              {(isEstudiante && user?.id_carrera ? materias.filter(m => String(m.id_carrera) === String(user.id_carrera) || !m.id_carrera) : materias).map((m) => (
                <option key={m.id_materia} value={m.id_materia}>
                  {m.nombre_materia} ({m.nombre_carrera || 'Tronco Común'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Docente Tutor Asignado</label>
            <select
              className="form-control"
              value={solicitudData.id_tutor}
              onChange={(e) => setSolicitudData({ ...solicitudData, id_tutor: e.target.value })}
              required
            >
              <option value="" disabled>Seleccione un tutor disponible</option>
              {tutores.filter(t => t.materias?.some(m => String(m.id_materia) === String(solicitudData.id_materia))).map((t) => (
                <option key={t.id_tutor} value={t.id_tutor}>
                  Lic. {t.nombre} {t.apellido} — {t.especialidad || 'Docente Tutor UPDS'}
                </option>
              ))}
            </select>
            {tutores.filter(t => t.materias?.some(m => String(m.id_materia) === String(solicitudData.id_materia))).length === 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--upds-red)', marginTop: '4px', display: 'block' }}>
                No hay docentes tutores asignados a esta materia actualmente.
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha de Sesión</label>
              <input
                type="date"
                className="form-control"
                required
                value={solicitudData.fecha}
                onChange={(e) => setSolicitudData({ ...solicitudData, fecha: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Turno Académico (UPDS)</label>
              <select
                className="form-control"
                required
                value={solicitudData.hora_inicio}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '07:30') setSolicitudData({ ...solicitudData, hora_inicio: '07:30', hora_fin: '10:30' });
                  if (val === '11:00') setSolicitudData({ ...solicitudData, hora_inicio: '11:00', hora_fin: '14:00' });
                  if (val === '15:00') setSolicitudData({ ...solicitudData, hora_inicio: '15:00', hora_fin: '18:00' });
                  if (val === '19:00') setSolicitudData({ ...solicitudData, hora_inicio: '19:00', hora_fin: '22:00' });
                }}
              >
                <option value="07:30">Turno Mañana (07:30 a 10:30)</option>
                <option value="11:00">Turno Mediodía (11:00 a 14:00)</option>
                <option value="15:00">Turno Tarde (15:00 a 18:00)</option>
                <option value="19:00">Turno Noche (19:00 a 22:00)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Modalidad de Atención</label>
              <select
                className="form-control"
                value={solicitudData.modalidad}
                onChange={(e) => setSolicitudData({ ...solicitudData, modalidad: e.target.value })}
              >
                <option value="virtual">Virtual (Meet / Zoom)</option>
                <option value="presencial">Presencial (Campus UPDS Tarija)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Enlace o Aula propuesta</label>
              <input
                type="text"
                className="form-control"
                placeholder={solicitudData.modalidad === 'virtual' ? 'Ej: meet.google.com/...' : 'Ej: Aula 204'}
                value={solicitudData.lugar_o_enlace}
                onChange={(e) => setSolicitudData({ ...solicitudData, lugar_o_enlace: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Temas y dudas específicas a desarrollar</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Ej: Dudas sobre consultas de SQL y diagramas entidad-relación..."
              value={solicitudData.observaciones}
              onChange={(e) => setSolicitudData({ ...solicitudData, observaciones: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSolicitudOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Registrando...' : 'Registrar Solicitud'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Atender / Cambiar Estado (Docente / Admin) */}
      <Modal
        isOpen={isAtenderOpen}
        onClose={() => setIsAtenderOpen(false)}
        title={`Gestionar Tutoría: ${selectedTutoria?.nombre_materia}`}
      >
        <form onSubmit={handleSaveEstado}>
          <div className="form-group">
            <label className="form-label">Estado de la Sesión</label>
            <select
              className="form-control"
              value={atenderData.estado}
              onChange={(e) => setAtenderData({ ...atenderData, estado: e.target.value })}
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada (Aceptada)</option>
              <option value="realizada">Realizada (Completada)</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Aula Física o Enlace Virtual de Conexión</label>
            <input
              type="text"
              className="form-control"
              value={atenderData.lugar_o_enlace}
              onChange={(e) => setAtenderData({ ...atenderData, lugar_o_enlace: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Acuerdos y Observaciones Pedagógicas</label>
            <textarea
              className="form-control"
              rows="3"
              value={atenderData.observaciones}
              onChange={(e) => setAtenderData({ ...atenderData, observaciones: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAtenderOpen(false)}
              disabled={formLoading}
            >
              Cerrar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Actualizar Estado'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Calificar Tutoría (Estudiante) */}
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
      {/* Modal Generar Designación */}
      <Modal isOpen={isDesignacionOpen} onClose={() => setIsDesignacionOpen(false)} title="Generar Carta de Designación">
        <form onSubmit={handleCrearDesignacion}>
          <div className="form-group">
            <label className="form-label">Estudiante</label>
            <select
              className="form-control"
              value={designacionData.id_estudiante}
              onChange={(e) => setDesignacionData({ ...designacionData, id_estudiante: e.target.value })}
              required
            >
              <option value="">Seleccione un estudiante...</option>
              {estudiantes.map((est) => (
                <option key={est.id_estudiante} value={est.id_estudiante}>
                  {est.nombre} {est.apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tutor</label>
            <select
              className="form-control"
              value={designacionData.id_tutor}
              onChange={(e) => setDesignacionData({ ...designacionData, id_tutor: e.target.value })}
              required
            >
              <option value="">Seleccione un tutor...</option>
              {tutores.map((t) => (
                <option key={t.id_tutor} value={t.id_tutor}>
                  Lic. {t.nombre} {t.apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Modalidad de Graduación</label>
            <select
              className="form-control"
              value={designacionData.id_modalidad}
              onChange={(e) => setDesignacionData({ ...designacionData, id_modalidad: e.target.value })}
              required
            >
              <option value="1">Proyecto de Grado</option>
              <option value="2">Tesis</option>
              <option value="3">Trabajo Dirigido</option>
            </select>
          </div>
          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDesignacionOpen(false)} disabled={formLoading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? 'Generando...' : 'Generar Designación'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Responder Carta */}
      <Modal isOpen={isResponderCartaOpen} onClose={() => setIsResponderCartaOpen(false)} title="Responder Carta de Designación">
        <form onSubmit={handleSaveResponder}>
          <div className="form-group">
            <label className="form-label">Respuesta</label>
            <select
              className="form-control"
              value={responderData.accion}
              onChange={(e) => setResponderData({ ...responderData, accion: e.target.value })}
              required
            >
              <option value="aceptar">Aceptar y Firmar</option>
              <option value="rechazar">Rechazar</option>
            </select>
          </div>
          {responderData.accion === 'rechazar' && (
            <div className="form-group">
              <label className="form-label">Motivo de Rechazo</label>
              <select
                className="form-control"
                value={responderData.motivo}
                onChange={(e) => setResponderData({ ...responderData, motivo: e.target.value })}
                required
              >
                <option value="">Seleccione el motivo...</option>
                <option value="Capacidad Excedida">No dispongo de capacidad (Límite alcanzado)</option>
                <option value="Falta de Tiempo">Falta de tiempo en el semestre actual</option>
                <option value="Conflicto de Interés / Derecho">Conflicto de interés o causa justificada</option>
              </select>
            </div>
          )}
          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResponderCartaOpen(false)} disabled={formLoading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? 'Guardando...' : 'Confirmar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
