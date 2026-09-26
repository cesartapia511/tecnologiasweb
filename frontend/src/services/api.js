import axios from 'axios';

export function fixMojibake(data) {
  if (typeof data === 'string') {
    return data
      .replace(/IngenierÃ­a/g, 'Ingeniería')
      .replace(/TecnologÃ­a/g, 'Tecnología')
      .replace(/MarÃ­a/g, 'María')
      .replace(/TutorÃ­as?/g, (m) =>
        m.endsWith('s') ? 'Tutorías' : 'Tutoría'
      )
      .replace(/PsicologÃ­a/g, 'Psicología')
      .replace(/ContadurÃ­a/g, 'Contaduría')
      .replace(/PÃºblica|PÃblica/g, 'Pública')
      .replace(/AdministraciÃ³n|AdministraciÃ³n/g, 'Administración')
      .replace(/ComunicaciÃ³n|ComunicaciÃ³n/g, 'Comunicación')
      .replace(/ProgramaciÃ³n|ProgramaciÃ³n/g, 'Programación')
      .replace(/GestiÃ³n|GestiÃ³n/g, 'Gestión')
      .replace(/InvestigaciÃ³n|InvestigaciÃ³n/g, 'Investigación')
      .replace(/OperaciÃ³nes?|OperaciÃ³nes?/g, (m) =>
        m.includes('es') ? 'Operaciones' : 'Operación'
      )
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã‰/g, 'É')
      .replace(/Ã“/g, 'Ó')
      .replace(/Ãš/g, 'Ú')
      .replace(/Ã‘/g, 'Ñ')
      .replace(/Ã¼/g, 'ü')
      .replace(/Ãœ/g, 'Ü');
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

// Agregar token automáticamente
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

// IMPORTANTE:
// Los servicios del proyecto esperan recibir directamente
// response.data del backend.
api.interceptors.response.use(
  (response) => {
    return fixMojibake(response.data);
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error en la conexión con el servidor';

    return Promise.reject(
      new Error(fixMojibake(message))
    );
  }
);

export default api;