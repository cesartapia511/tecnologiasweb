import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tutoriasService, disponibilidadService } from '../../services/dataServices';
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, CheckCircle, HelpCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';

export const CalendarioTutor = () => {
  const { user } = useAuth();
  const [semana, setSemana] = useState([]);
  const [tutorias, setTutorias] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generar los días de la semana actual (Lunes a Sábado)
  const generarSemanaActual = () => {
    const hoy = new Date();
    // Ajustar para que Lunes sea el día 1 (0 es domingo)
    const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diaSemana + 1);

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nuevaSemana = dias.map((nombreDia, index) => {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + index);
      return {
        nombre: nombreDia,
        fechaCompleta: fecha,
        fechaStr: fecha.toISOString().split('T')[0], // YYYY-MM-DD
        diaMes: fecha.getDate(),
      };
    });
    return nuevaSemana;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const diasSemana = generarSemanaActual();
        setSemana(diasSemana);

        // Traer todas las tutorías del tutor
        const allTutorias = await tutoriasService.getAll();
        
        // Traer disponibilidad (horarios base del tutor)
        const allDisp = await disponibilidadService.getAll();
        const miDisp = allDisp.filter(d => d.id_tutor === user?.id_tutor);

        // Filtrar solo las confirmadas o pendientes
        const activas = allTutorias.filter(t => t.estado === 'confirmada' || t.estado === 'pendiente');

        setTutorias(activas);
        setDisponibilidad(miDisp);

      } catch (error) {
        console.error('Error cargando calendario', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id_tutor) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando calendario semanal...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Calendario</h1>
          <p className="page-description">Vista semanal de tus horarios disponibles y sesiones agendadas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--upds-blue)' }}></div>
            <span>Confirmadas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--upds-gold)' }}></div>
            <span>Pendientes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px dashed #cbd5e1' }}></div>
            <span>Disponible</span>
          </div>
        </div>
      </div>

      {/* Grid Semanal con CSS Grid puro */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1rem',
        alignItems: 'start'
      }}>
        {semana.map((dia) => {
          // Filtrar tutorías para esta fecha exacta
          const tutoriasDia = tutorias.filter(t => t.fecha === dia.fechaStr);
          
          // Filtrar disponibilidad base para este nombre de día
          // (ej: Si es "Lunes", buscar si tiene disponibilidad los lunes)
          const dispDia = disponibilidad.filter(d => d.dia_semana === dia.nombre);

          return (
            <div key={dia.nombre} className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', minHeight: '300px' }}>
              <div style={{ 
                background: dia.fechaStr === new Date().toISOString().split('T')[0] ? 'var(--upds-blue)' : '#f8fafc',
                color: dia.fechaStr === new Date().toISOString().split('T')[0] ? '#fff' : 'var(--text-color)',
                padding: '1rem', 
                textAlign: 'center', 
                borderBottom: '1px solid var(--border-color)' 
              }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{dia.nombre}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{dia.fechaStr}</div>
              </div>

              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* 1. Mostrar Tutorías Agendadas */}
                {tutoriasDia.map(tut => (
                  <div key={tut.id_tutoria} style={{ 
                    borderLeft: `4px solid ${tut.estado === 'confirmada' ? 'var(--upds-blue)' : 'var(--upds-gold)'}`,
                    background: tut.estado === 'confirmada' ? 'rgba(0,51,160,0.05)' : 'rgba(255,184,28,0.05)',
                    padding: '0.75rem',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '4px' }}>
                      {tut.hora_inicio.slice(0, 5)} - {tut.hora_fin.slice(0, 5)}
                    </div>
                    <div style={{ color: 'var(--upds-blue-dark)', fontWeight: 500 }}>{tut.nombre_materia}</div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <User size={12} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tut.estudiante_nombre} {tut.estudiante_apellido}
                      </span>
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      {tut.estado === 'confirmada' ? (
                        <span style={{ fontSize: '0.7rem', background: 'var(--upds-blue)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}><CheckCircle size={10} style={{ display: 'inline', marginRight: '2px' }}/> Confirmada</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', background: 'var(--upds-gold)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}><HelpCircle size={10} style={{ display: 'inline', marginRight: '2px' }}/> Pendiente</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* 2. Mostrar Horarios Base Disponibles */}
                {dispDia.map(disp => {
                  // Pequeña lógica visual: si ya hay una tutoría en este rango, podríamos ocultarlo,
                  // pero como es informativo, lo mostramos indicando que es el horario base.
                  return (
                    <div key={disp.id_disponibilidad} style={{ 
                      border: '1px dashed #cbd5e1',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#64748b' }}>
                        <Clock size={14} />
                        <span>{disp.hora_inicio.slice(0, 5)} - {disp.hora_fin.slice(0, 5)}</span>
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                        Horario base ({disp.modalidad})
                      </div>
                    </div>
                  );
                })}

                {tutoriasDia.length === 0 && dispDia.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '2rem 0', fontSize: '0.85rem' }}>
                    <CalendarIcon size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    Sin actividad
                  </div>
                )}
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
