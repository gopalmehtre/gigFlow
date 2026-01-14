import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        // If cookies don't work, send token via Authorization header
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        
        if (status === 401 && url.includes('/auth/me')) {
            return Promise.reject(error);
        }

        if (status === 401) {
            console.log('Unauthorized access - redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (status === 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;