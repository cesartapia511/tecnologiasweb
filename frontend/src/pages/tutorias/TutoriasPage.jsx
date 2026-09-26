import React, { useState, useEffect, useCallback } from 'react';
import {
  tutoriasService,
  materiasService,
  tutoresService,
  evaluacionesService,
  cartasService,
  estudiantesService,
  reunionesService,
  informesService
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
  Users,
  ClipboardList,
} from 'lucide-react';

export const TutoriasPage = () => {
  const { user, role, isAdmin, isDocente, isEstudiante } = useAuth();
  const [tutorias, setTutorias] = useState([]);
  const [tutoriasDisponibles, setTutoriasDisponibles] = useState([]);
  const [periodoInscripcion, setPeriodoInscripcion] = useState(null);
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
  const [isVerCartaOpen, setIsVerCartaOpen] = useState(false);
  const [selectedCarta, setSelectedCarta] = useState(null);

  // Modales Reuniones
  const [isReunionesOpen, setIsReunionesOpen] = useState(false);
  const [reuniones, setReuniones] = useState([]);
  const [selectedTutoriaReunion, setSelectedTutoriaReunion] = useState(null);
  const [reunionFormData, setReunionFormData] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    lugar_o_enlace: '',
    asistio_estudiante: 'si',
    minutos_tardanza: 0,
    evidencia_url: '',
    observaciones: ''
  });

  // Modales Informes
  const [isInformesOpen, setIsInformesOpen] = useState(false);
  const [informes, setInformes] = useState([]);
  const [selectedTutoriaInforme, setSelectedTutoriaInforme] = useState(null);
  const [informeFormData, setInformeFormData] = useState({
    numero_informe: '',
    fecha_limite: '',
    descripcion_avance: '',
    porcentaje_avance: 0
  });

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

      const [tData, mData, tutData, cData, estData, disponiblesData] = await Promise.all([
        tutoriasService.getAll(params),
        materiasService.getAll(),
        tutoresService.getAll(),
        cartasService.getAll(params),
        isAdmin ? estudiantesService.getAll() : Promise.resolve([]),
        isEstudiante ? tutoriasService.disponibles() : Promise.resolve(null),
      ]);

      setTutorias(tData || []);
      setMaterias(mData || []);
      setTutores(tutData || []);
      setCartas(cData || []);
      setEstudiantes(estData || []);
      setTutoriasDisponibles(disponiblesData?.tutorias || []);
      setPeriodoInscripcion(disponiblesData?.periodo || null);

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

  // Inscribirse en una tutoría disponible
  const handleInscribir = async (idTutoria) => {
    setFormLoading(true);
    try {
      await tutoriasService.inscribir(idTutoria);
      showSuccess('Inscripción realizada correctamente');
      await loadData();
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

  const handleOpenVerCarta = (carta) => {
    setSelectedCarta(carta);
    setIsVerCartaOpen(true);
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

  // ----------------------------------------------------
  // REUNIONES
  // ----------------------------------------------------

  const fetchReuniones = async (id_tutoria) => {
    try {
      setFormLoading(true);
      const data = await reunionesService.obtenerPorTutoria(id_tutoria);
      setReuniones(data || []);
    } catch (error) {
      showError(error.message || 'Error al obtener reuniones');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenReuniones = (tutoria) => {
    setSelectedTutoriaReunion(tutoria);
    setReuniones([]);
    setReunionFormData({
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '',
      hora_fin: '',
      lugar_o_enlace: '',
      asistio_estudiante: 'si',
      minutos_tardanza: 0,
      evidencia_url: '',
      observaciones: ''
    });
    fetchReuniones(tutoria.id_tutoria);
    setIsReunionesOpen(true);
  };

  const handleCreateReunion = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await reunionesService.crear({
        ...reunionFormData,
        id_tutoria: selectedTutoriaReunion.id_tutoria
      });
      showSuccess('Reunión registrada exitosamente');
      setReunionFormData({
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '',
        hora_fin: '',
        lugar_o_enlace: '',
        asistio_estudiante: 'si',
        minutos_tardanza: 0,
        evidencia_url: '',
        observaciones: ''
      });
      fetchReuniones(selectedTutoriaReunion.id_tutoria);
    } catch (error) {
      showError(error.message || 'Error al registrar reunión');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFirmarReunion = async (id_reunion, tipo_firma) => {
    try {
      setFormLoading(true);
      await reunionesService.firmar({ id_reunion, accion: tipo_firma });
      showSuccess('Firma registrada exitosamente');
      fetchReuniones(selectedTutoriaReunion.id_tutoria);
    } catch (error) {
      showError(error.message || 'Error al firmar');
    } finally {
      setFormLoading(false);
    }
  };

  // ----------------------------------------------------
  // INFORMES DE AVANCE
  // ----------------------------------------------------

  const fetchInformes = async (id_tutoria) => {
    try {
      setFormLoading(true);
      const data = await informesService.obtenerPorTutoria(id_tutoria);
      setInformes(data || []);
    } catch (error) {
      showError(error.message || 'Error al obtener informes');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenInformes = (tutoria) => {
    setSelectedTutoriaInforme(tutoria);
    setInformes([]);
    setInformeFormData({
      numero_informe: '',
      fecha_limite: '',
      descripcion_avance: '',
      porcentaje_avance: 0
    });
    fetchInformes(tutoria.id_tutoria);
    setIsInformesOpen(true);
  };

  const handleCreateInforme = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await informesService.crear({
        ...informeFormData,
        id_tutoria: selectedTutoriaInforme.id_tutoria
      });
      showSuccess('Informe registrado exitosamente');
      setInformeFormData({
        numero_informe: '',
        fecha_limite: '',
        descripcion_avance: '',
        porcentaje_avance: 0
      });
      fetchInformes(selectedTutoriaInforme.id_tutoria);
    } catch (error) {
      showError(error.message || 'Error al registrar informe');
    } finally {
      setFormLoading(false);
    }
  };

  const calcularEstadoInforme = (fecha_limite, porcentaje) => {
    if (porcentaje >= 100) return { texto: 'Completado', color: 'green' };
    if (!fecha_limite) return { texto: 'En plazo', color: 'var(--upds-blue)' };
    
    const limite = new Date(fecha_limite);
    const hoy = new Date();
    // Normalizar a media noche para comparación justa de días
    limite.setHours(0,0,0,0);
    hoy.setHours(0,0,0,0);
    
    if (hoy > limite) {
      return { texto: 'Atrasado', color: 'var(--upds-red)' };
    }
    return { texto: 'En plazo', color: 'var(--upds-blue)' };
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

      {/* Tutorías disponibles para inscripción */}
      {isEstudiante && (
        <div className="card" style={{ marginBottom: '1.25rem', border: '1px solid var(--upds-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--upds-blue-dark)' }}>
                Tutorías disponibles para inscripción
              </h3>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Selecciona una tutoría con cupo disponible para inscribirte.
              </p>
              {periodoInscripcion && (
                <small style={{ color: 'var(--text-muted)' }}>
                  Periodo: {periodoInscripcion.nombre} ({periodoInscripcion.fecha_inicio} al {periodoInscripcion.fecha_fin})
                </small>
              )}
            </div>
            <span
              className="badge"
              style={{
                background: 'var(--upds-blue)',
                color: '#fff',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px'
              }}
            >
              {tutoriasDisponibles.length} disponible(s)
            </span>
          </div>

          {tutoriasDisponibles.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Docente Tutor</th>
                    <th>Fecha y Horario</th>
                    <th>Modalidad / Lugar</th>
                    <th>Cupos</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {tutoriasDisponibles.map((t) => (
                    <tr key={t.id_tutoria}>
                      <td style={{ fontWeight: 600, color: 'var(--upds-blue-dark)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BookOpen size={16} color="var(--upds-red)" />
                          <span>{t.nombre_materia}</span>
                        </div>
                      </td>
                      <td>
                        Lic. {t.tutor_nombre} {t.tutor_apellido}
                        <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                          {t.tutor_especialidad || 'Tutor UPDS'}
                        </small>
                      </td>
                      <td>
                        <div>{t.fecha}</div>
                        <small style={{ color: 'var(--text-muted)' }}>
                          {String(t.hora_inicio).slice(0, 5)} - {String(t.hora_fin).slice(0, 5)}
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
                          <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                            {t.lugar_o_enlace}
                          </small>
                        )}
                      </td>
                      <td>
                        <strong>{t.cupos_disponibles}</strong> / {t.cupo_maximo}
                        <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                          {t.cupos_ocupados} ocupado(s)
                        </small>
                      </td>
                      <td>
                        <StatusBadge status={t.estado} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {t.ya_inscrito ? (
                          <span
                            className="badge"
                            style={{
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '0.4rem 0.7rem',
                              borderRadius: '16px'
                            }}
                          >
                            Ya inscrito
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleInscribir(t.id_tutoria)}
                            disabled={formLoading || Number(t.cupos_disponibles) <= 0}
                          >
                            <Check size={14} />
                            <span>{formLoading ? 'Procesando...' : 'Inscribirme'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <CalendarDays size={40} color="var(--upds-blue)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>
                {periodoInscripcion
                  ? 'No hay tutorías con cupos disponibles en este momento.'
                  : 'No existe un periodo de inscripción activo actualmente.'}
              </p>
            </div>
          )}
        </div>
      )}

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
                        {/* Botón Informes */}
                        <button
                          onClick={() => handleOpenInformes(t)}
                          className="btn btn-outline btn-sm"
                          title="Ver Informes de Avance"
                          style={{ color: 'var(--upds-red)', borderColor: 'var(--upds-red)' }}
                        >
                          <ClipboardList size={14} />
                          <span>Informes</span>
                        </button>

                        {/* Botón Reuniones */}
                        <button
                          onClick={() => handleOpenReuniones(t)}
                          className="btn btn-outline btn-sm"
                          title="Ver Reuniones"
                          style={{ color: 'var(--upds-blue)', borderColor: 'var(--upds-blue)' }}
                        >
                          <Users size={14} />
                          <span>Reuniones</span>
                        </button>

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
                            style={{ marginRight: '4px' }}
                          >
                            <FileSignature size={14} />
                            <span>Responder</span>
                          </button>
                        )}
                        {c.tipo_firma === 'aceptada' && (
                          <button
                            onClick={() => handleOpenVerCarta(c)}
                            className="btn btn-outline btn-sm"
                            title="Ver Documento Oficial"
                            style={{ color: 'var(--upds-portal-blue)', borderColor: 'var(--upds-portal-blue)' }}
                          >
                            <FileText size={14} />
                            <span>Ver Carta</span>
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

      {/* Modal Ver Carta */}
      <Modal isOpen={isVerCartaOpen} onClose={() => setIsVerCartaOpen(false)} title="Carta de Designación" maxWidth="680px">
        {selectedCarta && (
          <div>
            <div style={{ border: '2px solid var(--upds-blue)', borderRadius: '12px', padding: '2rem', background: '#ffffff', marginBottom: '1rem', fontFamily: 'serif' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img src="/logo-upds-oficial.png" alt="UPDS" style={{ height: '60px', objectFit: 'contain', marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>UNIVERSIDAD PRIVADA DOMINGO SAVIO</div>
                <div style={{ fontSize: '1rem' }}>CARTA DE DESIGNACIÓN DE TUTOR</div>
              </div>
              
              <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                Tarija, {new Date(selectedCarta.fecha_generacion).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <div style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                Señor(a):<br />
                <strong>Lic. {selectedCarta.tutor_nombre} {selectedCarta.tutor_apellido}</strong><br />
                Presente.-
              </div>

              <div style={{ marginBottom: '2rem', lineHeight: '1.6', textAlign: 'justify' }}>
                De mi mayor consideración:<br /><br />
                Mediante la presente, tengo a bien comunicarle que ha sido designado(a) como <strong>Tutor(a)</strong> del(la) estudiante <strong>{selectedCarta.estudiante_nombre} {selectedCarta.estudiante_apellido}</strong>, quien se encuentra desarrollando la modalidad de graduación <strong>{selectedCarta.nombre_modalidad || 'Proyecto de Grado'}</strong>.<br /><br />
                Agradecemos su compromiso con la excelencia académica y le deseamos el mayor de los éxitos en el acompañamiento de este proceso.
              </div>

              <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #000', width: '250px', margin: '0 auto 8px' }}></div>
                <strong>Firma y Sello de Coordinación</strong>
              </div>
            </div>
            <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsVerCartaOpen(false)}>Cerrar</button>
              <button type="button" className="btn btn-primary" onClick={() => window.print()} title="Imprimir Carta">
                <Printer size={16} />
                <span>Imprimir Carta</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Reuniones */}
      <Modal isOpen={isReunionesOpen} onClose={() => setIsReunionesOpen(false)} title="Registro de Reuniones de Tutoría" maxWidth="800px">
        {selectedTutoriaReunion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
              <strong>Materia:</strong> {selectedTutoriaReunion.nombre_materia} <br />
              <strong>Tutor:</strong> Lic. {selectedTutoriaReunion.tutor_nombre} {selectedTutoriaReunion.tutor_apellido} <br />
              <strong>Estudiante:</strong> {selectedTutoriaReunion.estudiante_nombre} {selectedTutoriaReunion.estudiante_apellido}
            </div>

            {(isDocente || isAdmin) && (
              <form onSubmit={handleCreateReunion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e0e0e0', padding: '1rem', borderRadius: '8px' }}>
                <h5>Registrar Nueva Reunión</h5>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label className="form-label">Fecha</label>
                    <input type="date" className="form-control" value={reunionFormData.fecha} onChange={e => setReunionFormData({...reunionFormData, fecha: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                    <label className="form-label">Hora Inicio</label>
                    <input type="time" className="form-control" value={reunionFormData.hora_inicio} onChange={e => setReunionFormData({...reunionFormData, hora_inicio: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                    <label className="form-label">Hora Fin</label>
                    <input type="time" className="form-control" value={reunionFormData.hora_fin} onChange={e => setReunionFormData({...reunionFormData, hora_fin: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                    <label className="form-label">Lugar / Enlace</label>
                    <input type="text" className="form-control" value={reunionFormData.lugar_o_enlace} onChange={e => setReunionFormData({...reunionFormData, lugar_o_enlace: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label className="form-label">Asistencia Estudiante</label>
                    <select className="form-control" value={reunionFormData.asistio_estudiante} onChange={e => setReunionFormData({...reunionFormData, asistio_estudiante: e.target.value})} required>
                      <option value="si">Asistió</option>
                      <option value="no">No asistió</option>
                      <option value="tardanza">Tardanza</option>
                      <option value="no_aplica">No aplica</option>
                    </select>
                  </div>
                  {reunionFormData.asistio_estudiante === 'tardanza' && (
                    <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                      <label className="form-label">Minutos Tardanza</label>
                      <input type="number" min="1" className="form-control" value={reunionFormData.minutos_tardanza} onChange={e => setReunionFormData({...reunionFormData, minutos_tardanza: parseInt(e.target.value) || 0})} required />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Evidencia (URL)</label>
                  <input type="url" className="form-control" placeholder="https://..." value={reunionFormData.evidencia_url} onChange={e => setReunionFormData({...reunionFormData, evidencia_url: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Observaciones</label>
                  <textarea className="form-control" value={reunionFormData.observaciones} onChange={e => setReunionFormData({...reunionFormData, observaciones: e.target.value})}></textarea>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Guardando...' : 'Registrar Reunión'}
                  </button>
                </div>
              </form>
            )}

            <div>
              <h5>Historial de Reuniones</h5>
              {reuniones.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No hay reuniones registradas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reuniones.map((r, index) => (
                    <div key={r.id_reunion} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h6 style={{ margin: 0, color: 'var(--upds-blue)' }}>Reunión #{reuniones.length - index}</h6>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.fecha} ({r.hora_inicio.slice(0,5)} - {r.hora_fin.slice(0,5)})</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>Asistencia:</strong> <StatusBadge status={r.asistio_estudiante === 'si' ? 'confirmada' : r.asistio_estudiante === 'no' ? 'cancelada' : 'pendiente'} /> 
                        {r.asistio_estudiante === 'tardanza' && ` (${r.minutos_tardanza} min)`}
                      </div>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>Lugar/Enlace:</strong> {r.lugar_o_enlace || 'N/A'} <br/>
                        <strong>Observaciones:</strong> {r.observaciones || 'Ninguna'}
                      </div>
                      {r.evidencia_url && (
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          <a href={r.evidencia_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--upds-blue)', textDecoration: 'underline' }}>Ver Evidencia</a>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <strong>Firma Tutor:</strong> {r.firma_tutor == 1 ? <span style={{ color: 'green' }}><Check size={14}/> Firmado</span> : <span style={{ color: 'orange' }}>Pendiente</span>}
                          {isDocente && r.firma_tutor == 0 && (
                            <button onClick={() => handleFirmarReunion(r.id_reunion, 'firmar_tutor')} className="btn btn-primary btn-sm" style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '2px 8px' }}>Firmar</button>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong>Firma Estudiante:</strong> {r.firma_estudiante == 1 ? <span style={{ color: 'green' }}><Check size={14}/> Firmado</span> : <span style={{ color: 'orange' }}>Pendiente</span>}
                          {isEstudiante && r.firma_estudiante == 0 && (
                            <button onClick={() => handleFirmarReunion(r.id_reunion, 'firmar_estudiante')} className="btn btn-primary btn-sm" style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '2px 8px' }}>Firmar</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Informes de Avance */}
      <Modal isOpen={isInformesOpen} onClose={() => setIsInformesOpen(false)} title="Informes de Avance y Seguimiento" maxWidth="800px">
        {selectedTutoriaInforme && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
              <strong>Materia:</strong> {selectedTutoriaInforme.nombre_materia} <br />
              <strong>Tutor:</strong> Lic. {selectedTutoriaInforme.tutor_nombre} {selectedTutoriaInforme.tutor_apellido} <br />
              <strong>Estudiante:</strong> {selectedTutoriaInforme.estudiante_nombre} {selectedTutoriaInforme.estudiante_apellido}
            </div>

            {(isDocente || isAdmin) && (
              <form onSubmit={handleCreateInforme} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e0e0e0', padding: '1rem', borderRadius: '8px' }}>
                <h5>Registrar Nuevo Informe</h5>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                    <label className="form-label">Nº Informe (Opcional)</label>
                    <input type="number" min="1" className="form-control" placeholder="Auto" value={informeFormData.numero_informe} onChange={e => setInformeFormData({...informeFormData, numero_informe: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label className="form-label">Fecha Límite</label>
                    <input type="date" className="form-control" value={informeFormData.fecha_limite} onChange={e => setInformeFormData({...informeFormData, fecha_limite: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                    <label className="form-label">Porcentaje de Avance (%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input type="range" min="0" max="100" step="5" style={{ flex: 1 }} value={informeFormData.porcentaje_avance} onChange={e => setInformeFormData({...informeFormData, porcentaje_avance: parseInt(e.target.value)})} />
                      <span style={{ fontWeight: 'bold', width: '40px' }}>{informeFormData.porcentaje_avance}%</span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción del Avance</label>
                  <textarea className="form-control" required rows="3" value={informeFormData.descripcion_avance} onChange={e => setInformeFormData({...informeFormData, descripcion_avance: e.target.value})}></textarea>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Registrando...' : 'Registrar Informe'}
                  </button>
                </div>
              </form>
            )}

            <div>
              <h5>Historial de Informes</h5>
              {informes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No hay informes registrados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {informes.map((inf) => {
                    const estado = calcularEstadoInforme(inf.fecha_limite, inf.porcentaje_avance);
                    return (
                      <div key={inf.id_informe} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <h6 style={{ margin: 0, color: 'var(--upds-blue)' }}>Informe #{inf.numero_informe}</h6>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: estado.color, padding: '2px 8px', borderRadius: '12px', background: `${estado.color}15` }}>
                            {estado.texto}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                          Registrado: {inf.fecha_registro} | Límite: {inf.fecha_limite || 'Sin fecha límite'}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Descripción:</strong>
                          <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{inf.descripcion_avance}</p>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span>Progreso de Avance</span>
                            <span style={{ fontWeight: 'bold' }}>{inf.porcentaje_avance}%</span>
                          </div>
                          <div style={{ background: '#eee', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ background: estado.color, width: `${inf.porcentaje_avance}%`, height: '100%', transition: 'width 0.3s' }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
