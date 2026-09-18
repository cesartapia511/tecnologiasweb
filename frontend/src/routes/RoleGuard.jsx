import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const RoleGuard = ({ module, children }) => {
  const { canAccess, role } = useAuth();
  if (!canAccess(module)) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ fontSize: '3rem', color: 'var(--upds-red)', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Tu perfil actual (<strong>{role}</strong>) no tiene los privilegios necesarios para acceder al módulo de {module}.
        </p>
        <a href="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Volver al Dashboard
        </a>
      </div>
    );
  }
  return children;
};
