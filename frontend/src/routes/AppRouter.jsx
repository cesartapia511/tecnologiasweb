import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from './RoleGuard';
import { MainLayout } from '../components/layout/MainLayout';

import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { CarrerasPage } from '../pages/carreras/CarrerasPage';
import { MateriasPage } from '../pages/materias/MateriasPage';
import { TutoresPage } from '../pages/tutores/TutoresPage';
import { DisponibilidadPage } from '../pages/disponibilidad/DisponibilidadPage';
import { TutoriasPage } from '../pages/tutorias/TutoriasPage';
import { EvaluacionesPage } from '../pages/evaluaciones/EvaluacionesPage';
import { AuditoriaPage } from '../pages/auditoria/AuditoriaPage';
import { EstudiantesPage } from '../pages/estudiantes/EstudiantesPage';
import { RolesPage } from '../pages/roles/RolesPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas autenticadas */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Tutorías */}
          <Route path="/tutorias" element={<TutoriasPage />} />

          {/* Disponibilidad docente */}
          <Route
            path="/disponibilidad"
            element={
              <RoleGuard module="disponibilidad">
                <DisponibilidadPage />
              </RoleGuard>
            }
          />

          {/* Docentes y Estudiantes */}
          <Route path="/tutores" element={<TutoresPage />} />
          <Route
            path="/estudiantes"
            element={
              <RoleGuard module="estudiantes">
                <EstudiantesPage />
              </RoleGuard>
            }
          />

          {/* Evaluaciones */}
          <Route
            path="/evaluaciones"
            element={
              <RoleGuard module="evaluaciones">
                <EvaluacionesPage />
              </RoleGuard>
            }
          />

          {/* Académico */}
          <Route
            path="/carreras"
            element={
              <RoleGuard module="carreras">
                <CarrerasPage />
              </RoleGuard>
            }
          />
          <Route
            path="/materias"
            element={
              <RoleGuard module="materias">
                <MateriasPage />
              </RoleGuard>
            }
          />

          {/* Administración */}
          <Route
            path="/usuarios"
            element={
              <RoleGuard module="usuarios">
                <UsuariosPage />
              </RoleGuard>
            }
          />
          <Route
            path="/roles"
            element={
              <RoleGuard module="roles">
                <RolesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/auditoria"
            element={
              <RoleGuard module="auditoria">
                <AuditoriaPage />
              </RoleGuard>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
