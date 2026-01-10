import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const PROFILES_STORAGE_KEY = 'admin_profiles';
const ACTIVE_PROFILE_ID_KEY = 'active_profile_id';

// Request interceptor: подставляем токен активного профиля из localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);

      if (savedProfiles && savedActiveId) {
        const profiles = JSON.parse(savedProfiles);
        const activeId = parseInt(savedActiveId, 10);
        const activeProfile = profiles.find((p: any) => p.id === activeId);

        if (activeProfile && activeProfile.accessToken) {
          config.headers.Authorization = `Bearer ${activeProfile.accessToken}`;
        }
      }
    } catch (error) {
      console.error('Failed to get auth token from localStorage:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 401 пока только логируем, не трогаем localStorage
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        console.warn(
          'Received 401 on',
          currentPath,
          '- session may be invalid, но localStorage не чистим.'
        );
        // Здесь потом можно аккуратно добавить мягкий logout/уведомление
        // window.dispatchEvent(new Event('auth:profiles-updated'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
