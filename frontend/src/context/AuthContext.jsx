import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const login = async (usuario, contrasena) => {
    setLoading(true);
    try {
      const data = await authService.login(usuario, contrasena);
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Helper de roles
  const role = user?.nombre_rol?.toLowerCase() || '';
  const isAdmin = role === 'administrador';
  const isDocente = role === 'tutor';
  const isEstudiante = role === 'estudiante';

  // Matriz de permisos de navegación
  const canAccess = (module) => {
    if (!user) return false;
    if (isAdmin) return true; // Administrador tiene acceso a todo

    switch (module) {
      case 'dashboard':
        return true;
      case 'usuarios':
        return false; // Solo admin
      case 'carreras':
        return false; // Solo admin
      case 'materias':
        return isDocente; // Docente puede ver materias
      case 'tutores':
        return true; // Todos pueden ver docentes
      case 'estudiantes':
        return false; // Solo admin
      case 'disponibilidad':
        return isDocente; // Docente gestiona sus horarios
      case 'tutorias':
        return true; // Docente y estudiante tienen su vista
      case 'evaluaciones':
        return isDocente; // Docente ve sus evaluaciones
      case 'roles':
        return false; // Solo admin
      case 'auditoria':
        return false; // Solo admin
      case 'reportes':
        return false; // Solo admin
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isDocente,
        isEstudiante,
        canAccess,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
