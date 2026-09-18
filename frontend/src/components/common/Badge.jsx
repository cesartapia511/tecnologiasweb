import React from 'react';

export const RoleBadge = ({ role }) => {
  const r = role?.toLowerCase() || '';
  if (r === 'administrador') {
    return <span className="badge badge-admin">Administrador</span>;
  }
  if (r === 'tutor' || r === 'docente') {
    return <span className="badge badge-tutor">Docente Tutor</span>;
  }
  return <span className="badge badge-estudiante">Estudiante</span>;
};

export const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || '';
  switch (s) {
    case 'pendiente':
      return <span className="badge badge-pendiente">Pendiente</span>;
    case 'confirmada':
      return <span className="badge badge-confirmada">Confirmada</span>;
    case 'realizada':
      return <span className="badge badge-realizada">Realizada</span>;
    case 'cancelada':
      return <span className="badge badge-cancelada">Cancelada</span>;
    case 'activo':
      return <span className="badge badge-realizada">Activo</span>;
    case 'inactivo':
      return <span className="badge badge-cancelada">Inactivo</span>;
    default:
      return <span className="badge">{status}</span>;
  }
};
