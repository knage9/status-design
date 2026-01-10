import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const PROFILES_STORAGE_KEY = 'admin_profiles';
const ACTIVE_PROFILE_ID_KEY = 'active_profile_id';

// Add request interceptor to include auth token from active profile
api.interceptors.request.use(
    (config) => {
        // Get active profile from localStorage
        try {
            const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
            const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
            
            if (savedProfiles && savedActiveId) {
                const profiles = JSON.parse(savedProfiles);
                const activeId = parseInt(savedActiveId);
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
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to login
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                // Clear invalid token from localStorage
                try {
                    const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
                    const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
                    
                    if (savedProfiles && savedActiveId) {
                        const profiles = JSON.parse(savedProfiles);
                        const activeId = parseInt(savedActiveId);
                        const updatedProfiles = profiles.filter((p: any) => p.id !== activeId);
                        
                        if (updatedProfiles.length > 0) {
                            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updatedProfiles));
                            localStorage.setItem(ACTIVE_PROFILE_ID_KEY, updatedProfiles[0].id.toString());
                            // Reload page to refresh auth state
                            window.location.reload();
                        } else {
                            // No more profiles, clear everything and redirect to login
                            localStorage.removeItem(PROFILES_STORAGE_KEY);
                            localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
                            window.location.href = '/login';
                        }
                    }
                } catch (e) {
                    console.error('Failed to handle 401 error:', e);
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
