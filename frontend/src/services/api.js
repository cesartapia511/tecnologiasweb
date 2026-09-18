import axios from 'axios';

export function fixMojibake(data) {
  if (typeof data === 'string') {
    return data
      .replace(/IngenierÃa/g, 'Ingeniería')
      .replace(/TecnologÃa/g, 'Tecnología')
      .replace(/MarÃa/g, 'María')
      .replace(/TutorÃas?/g, (m) => (m.endsWith('s') ? 'Tutorías' : 'Tutoría'))
      .replace(/PsicologÃa/g, 'Psicología')
      .replace(/ContadurÃa/g, 'Contaduría')
      .replace(/PÃºblica|PÃblica/g, 'Pública')
      .replace(/AdministraciÃ³n|AdministraciÃn/g, 'Administración')
      .replace(/ComunicaciÃ³n|ComunicaciÃn/g, 'Comunicación')
      .replace(/ProgramaciÃ³n|ProgramaciÃn/g, 'Programación')
      .replace(/GestiÃ³n|GestiÃn/g, 'Gestión')
      .replace(/InvestigaciÃ³n|InvestigaciÃn/g, 'Investigación')
      .replace(/OperaciÃ³nes?|OperaciÃnes?/g, (m) => (m.includes('es') ? 'Operaciones' : 'Operación'))
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã/g, 'Á')
      .replace(/Ã/g, 'É')
      .replace(/Ã/g, 'Í')
      .replace(/Ã/g, 'Ó')
      .replace(/Ã/g, 'Ú')
      .replace(/Ã/g, 'Ñ')
      .replace(/Ã¼/g, 'ü')
      .replace(/Ã/g, 'Ü')
      .replace(/Ã/g, 'í');
  }
  if (Array.isArray(data)) {
    return data.map(fixMojibake);
  }
  if (data !== null && typeof data === 'object') {
    const cleaned = {};
    for (const key of Object.keys(data)) {
      cleaned[key] = fixMojibake(data[key]);
    }
    return cleaned;
  }
  return data;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token si existe
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('upds_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {}
  }
  return config;
});

// Interceptor para normalizar respuesta y limpiar codificación de caracteres
api.interceptors.response.use(
  (response) => fixMojibake(response.data),
  (error) => {
    const message = error.response?.data?.message || error.message || 'Error en la conexión con el servidor';
    return Promise.reject(new Error(fixMojibake(message)));
  }
);

export default api;
