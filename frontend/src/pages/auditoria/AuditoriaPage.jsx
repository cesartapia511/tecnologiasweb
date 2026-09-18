import React, { useState, useEffect, useCallback } from 'react';
import { accesosService } from '../../services/dataServices';
import { RoleBadge } from '../../components/common/Badge';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AuditoriaPage = () => {
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accesosService.getAll();
      setAccesos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Bitácora de Accesos y Auditoría</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registro de auditoría de intentos de inicio de sesión con IP y fecha
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Actualizar Registro</span>
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Cargando registros de auditoría...
          </div>
        ) : accesos.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario / Cuenta</th>
                  <th>Rol</th>
                  <th>Dirección IP</th>
                  <th>Fecha y Hora</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {accesos.map((a) => (
                  <tr key={a.id_acceso}>
                    <td style={{ color: 'var(--text-muted)' }}>#{a.id_acceso}</td>
                    <td style={{ fontWeight: 600 }}>
                      {a.nombre ? `${a.nombre} ${a.apellido} (@${a.usuario})` : 'Usuario desconocido'}
                    </td>
                    <td>{a.nombre_rol ? <RoleBadge role={a.nombre_rol} /> : '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{a.ip_origen}</td>
                    <td>{a.fecha_hora}</td>
                    <td>
                      {a.resultado === 'exitoso' ? (
                        <span className="badge badge-realizada">
                          <CheckCircle2 size={12} />
                          Exitoso
                        </span>
                      ) : (
                        <span className="badge badge-admin">
                          <AlertTriangle size={12} />
                          Fallido
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No hay registros de acceso en la bitácora.
          </div>
        )}
      </div>
    </div>
  );
};
