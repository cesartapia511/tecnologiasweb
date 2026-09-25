import api from './api';

export const usuariosService = {
  getAll: async () => (await api.get('/usuarios/index.php')).data,
  getById: async (id) => (await api.get(`/usuarios/detalle.php?id=${id}`)).data,
  create: async (data) => await api.post('/usuarios/index.php', data),
  update: async (id, data) => await api.put(`/usuarios/detalle.php?id=${id}`, data),
  delete: async (id) => await api.delete(`/usuarios/detalle.php?id=${id}`),
  uploadFoto: async (file) => {
    const formData = new FormData();
    formData.append('foto', file);
    return await api.post('/usuarios/foto.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const carrerasService = {
  getAll: async () => (await api.get('/carreras/index.php')).data,
  getById: async (id) => (await api.get(`/carreras/detalle.php?id=${id}`)).data,
  create: async (nombre) => await api.post('/carreras/index.php', { nombre_carrera: nombre }),
  update: async (id, nombre) => await api.put(`/carreras/detalle.php?id=${id}`, { nombre_carrera: nombre }),
  delete: async (id) => await api.delete(`/carreras/detalle.php?id=${id}`),
};

export const materiasService = {
  getAll: async (carreraId) => (await api.get(`/materias/index.php${carreraId ? `?id_carrera=${carreraId}` : ''}`)).data,
  getById: async (id) => (await api.get(`/materias/detalle.php?id=${id}`)).data,
  create: async (data) => await api.post('/materias/index.php', data),
  update: async (id, data) => await api.put(`/materias/detalle.php?id=${id}`, data),
  delete: async (id) => await api.delete(`/materias/detalle.php?id=${id}`),
};

export const tutoresService = {
  getAll: async () => (await api.get('/tutores/index.php')).data,
  update: async (data) => await api.put('/tutores/index.php', data),
};

export const estudiantesService = {
  getAll: async () => (await api.get('/estudiantes/index.php')).data,
  getPerfil: async () => (await api.get('/estudiantes/perfil.php')).data,
};

export const disponibilidadService = {
  getAll: async (tutorId) => (await api.get(`/disponibilidad/index.php${tutorId ? `?id_tutor=${tutorId}` : ''}`)).data,
  create: async (data) => await api.post('/disponibilidad/index.php', data),
  delete: async (id) => await api.delete(`/disponibilidad/index.php?id=${id}`),
};

export const tutoriasService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return (await api.get(`/tutorias/index.php${query ? `?${query}` : ''}`)).data;
  },
  create: async (data) => await api.post('/tutorias/index.php', data),
  updateStatus: async (data) => await api.put('/tutorias/index.php', data),
};

export const evaluacionesService = {
  getAll: async (tutorId) => (await api.get(`/evaluaciones/index.php${tutorId ? `?id_tutor=${tutorId}` : ''}`)).data,
  create: async (data) => await api.post('/evaluaciones/index.php', data),
};

export const dashboardService = {
  getStats: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return (await api.get(`/dashboard/stats.php${query ? `?${query}` : ''}`)).data;
  },
  getAdvancedStats: async () => {
    return (await api.get('/dashboard/advanced_stats.php')).data;
  },
};

export const rolesService = {
  getAll: async () => (await api.get('/roles/index.php')).data,
};

export const accesosService = {
  getAll: async () => (await api.get('/accesos/index.php')).data,
};

export const reportesService = {
  getReportes: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return (await api.get(`/reportes/index.php${query ? `?${query}` : ''}`)).data;
  }
};

export const cartasService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return (await api.get(`/cartas_designacion/index.php${query ? `?${query}` : ''}`)).data;
  },
  create: async (data) => await api.post('/cartas_designacion/index.php', data),
  updateStatus: async (data) => await api.put('/cartas_designacion/index.php', data),
};

export const reunionesService = {
  obtenerPorTutoria: async (id_tutoria) => (await api.get(`/reuniones/index.php?id_tutoria=${id_tutoria}`)).data,
  crear: async (data) => await api.post('/reuniones/index.php', data),
  firmar: async (data) => await api.put('/reuniones/index.php', data),
};
