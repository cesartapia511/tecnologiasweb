import api from './api';

export const authService = {
  login: async (usuario, contrasena) => {
    const res = await api.post('/auth/login.php', { usuario, contrasena });
    if (res.success && res.data) {
      localStorage.setItem('upds_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('upds_user');
  },

  register: async (userData) => {
    const res = await api.post('/auth/register.php', userData);
    return res;
  },

  getCurrentUser: () => {
    const data = localStorage.getItem('upds_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
};
