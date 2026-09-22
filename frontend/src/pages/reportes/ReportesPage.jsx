import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { reportesService, carrerasService, materiasService } from '../../services/dataServices';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart3, Download, Printer, Filter, Calendar as CalendarIcon, 
  BookOpen, GraduationCap, Clock, CheckCircle, XCircle 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ReportesPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Todos',
    id_carrera: 'Todas',
    id_materia: 'Todas'
  });

  useEffect(() => {
    loadFilterOptions();
    fetchReportes(false); // Carga inicial
  }, []);

  const loadFilterOptions = async () => {
    try {
      const resCarreras = await carrerasService.getAll();
      if (resCarreras?.data) setCarreras(resCarreras.data);
      
      const resMaterias = await materiasService.getAll();
      if (resMaterias?.data) setMaterias(resMaterias.data);
    } catch (error) {
      addToast('Error al cargar opciones de filtros', 'error');
    }
  };

  const fetchReportes = async (isManualAction = false) => {
    setLoading(true);
    try {
      const activeFilters = { ...filters };
      if (activeFilters.estado === 'Todos') delete activeFilters.estado;
      if (activeFilters.id_carrera === 'Todas') delete activeFilters.id_carrera;
      if (activeFilters.id_materia === 'Todas') delete activeFilters.id_materia;
      
      const res = await reportesService.getReportes(activeFilters);
      if (res.success) {
        setData(res.data);
        if (isManualAction) addToast('Filtros aplicados correctamente', 'success');
      } else {
        addToast(res.message || 'Error al cargar reportes', 'error');
      }
    } catch (error) {
      addToast(error.message || 'Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchReportes(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (!data || !data.tutorias_tabla || data.tutorias_tabla.length === 0) {
      addToast('No hay datos para exportar', 'warning');
      return;
    }
    
    const headers = ['ID Tutoría', 'Fecha', 'Estado', 'Carrera', 'Materia', 'Tutor'];
    const rows = data.tutorias_tabla.map(t => [
      t.id_tutoria,
      t.fecha_format,
      t.estado,
      t.nombre_carrera,
      t.nombre_materia,
      t.nombre_tutor
    ]);
    
    const BOM = '\uFEFF';
    let csvContent = headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
      
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_tutorias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Reporte exportado exitosamente', 'success');
  };

  if (loading && !data) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Cargando reportes y estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header print-hide">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={24} color="var(--upds-blue)" />
            Reportes Institucionales
          </h1>
          <p className="page-description">Centro de análisis y estadísticas avanzadas para administración.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} /> Imprimir Reporte
          </button>
          <button className="btn btn-primary" onClick={exportToCSV}>
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card print-hide" style={{ marginBottom: '2rem' }}>
        <form onSubmit={applyFilters} className="form-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label className="form-label">Fecha Inicio</label>
            <input 
              type="date" 
              name="fecha_inicio" 
              className="form-control" 
              value={filters.fecha_inicio} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label className="form-label">Fecha Fin</label>
            <input 
              type="date" 
              name="fecha_fin" 
              className="form-control" 
              value={filters.fecha_fin} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label className="form-label">Estado</label>
            <select name="estado" className="form-control" value={filters.estado} onChange={handleFilterChange}>
              <option value="Todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Carrera</label>
            <select name="id_carrera" className="form-control" value={filters.id_carrera} onChange={handleFilterChange}>
              <option value="Todas">Todas las Carreras</option>
              {carreras.map(c => (
                <option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Materia</label>
            <select name="id_materia" className="form-control" value={filters.id_materia} onChange={handleFilterChange}>
              <option value="Todas">Todas las Materias</option>
              {materias.map(m => (
                <option key={m.id_materia} value={m.id_materia}>{m.nombre_materia}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Filter size={16} /> {loading ? 'Filtrando...' : 'Aplicar Filtros'}
            </button>
          </div>
        </form>
      </div>

      {data && (
        <>
          {/* Header de impresión */}
          <div className="print-only" style={{ textAlign: 'center', marginBottom: '2rem', display: 'none' }}>
            <h2>Universidad Privada Domingo Savio</h2>
            <h3>Reporte Institucional de Tutorías</h3>
            <p>Fecha de emisión: {new Date().toLocaleDateString()}</p>
            <hr />
          </div>

          {/* Resumen General */}
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Resumen General</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid var(--upds-blue)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--upds-blue)' }}>{data.kpis.total_tutorias}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tutorías Totales</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{data.kpis.pendientes}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pendientes</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{data.kpis.confirmadas}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confirmadas</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #10b981' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{data.kpis.realizadas}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Realizadas</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{data.kpis.canceladas}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Canceladas</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
             <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--upds-blue-subtle)', borderRadius: '50%', color: 'var(--upds-blue)' }}><GraduationCap size={24} /></div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.kpis.total_estudiantes}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estudiantes</div>
              </div>
            </div>
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--upds-gold-subtle)', borderRadius: '50%', color: 'var(--upds-gold-dark)' }}><Clock size={24} /></div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.kpis.total_tutores}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Docentes Tutores</div>
              </div>
            </div>
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: '#10b981' }}><BookOpen size={24} /></div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.kpis.total_materias}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Materias</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Evolución temporal */}
            <div className="card">
              <div className="card-header"><h2 className="card-title">Evolución de Tutorías</h2></div>
              <div style={{ height: 300, width: '100%', padding: '0 1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.tutorias_por_fecha}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Tutorías" stroke="var(--upds-blue)" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tutorías por Estado */}
            <div className="card">
              <div className="card-header"><h2 className="card-title">Distribución por Estado</h2></div>
              <div style={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.tutorias_por_estado}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.tutorias_por_estado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tutorías por Carrera */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header"><h2 className="card-title">Tutorías por Carrera</h2></div>
              <div style={{ height: 350, width: '100%', padding: '0 1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.tutorias_por_carrera} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="total" name="Total Tutorías" fill="var(--upds-gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribución de Evaluaciones */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <h2 className="card-title">Distribución de Evaluaciones</h2>
                <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--upds-gold-subtle)', color: 'var(--upds-gold-dark)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Promedio: {data.kpis.promedio_evaluaciones} ⭐
                </div>
              </div>
              <div style={{ height: 300, width: '100%', padding: '0 1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.evaluaciones_distribucion} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="total" name="Cantidad" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>

          {/* Tabla Resumen */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Detalle de Tutorías (Resultados Recientes)</h2>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Carrera / Materia</th>
                    <th>Docente Tutor</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tutorias_tabla && data.tutorias_tabla.length > 0 ? (
                    data.tutorias_tabla.map((t) => (
                      <tr key={t.id_tutoria}>
                        <td>#{t.id_tutoria}</td>
                        <td>{t.fecha_format}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{t.nombre_materia}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.nombre_carrera}</div>
                        </td>
                        <td>{t.nombre_tutor}</td>
                        <td>
                          <span className={`badge badge-${t.estado === 'realizada' ? 'success' : t.estado === 'pendiente' ? 'warning' : t.estado === 'confirmada' ? 'primary' : 'danger'}`}>
                            {t.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No se encontraron tutorías con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          .print-only { display: block !important; }
          .card { box-shadow: none !important; border: 1px solid #ccc !important; break-inside: avoid; }
          body { background: white; }
          .page-container { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};
