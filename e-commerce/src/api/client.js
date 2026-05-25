import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
    baseURL,
});

// attach token to every request automatically
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// if token expired, try to refresh it
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 429) {
            toast.error('Too many requests. Please slow down and try again in a minute!');
            return Promise.reject(error);
        }

        const original = error.config;

        const isAuthEndpoint = original.url?.includes('auth/login') || 
                               original.url?.includes('auth/register') || 
                               original.url?.includes('auth/otp-login');

        if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
            original._retry = true;

            const refresh = localStorage.getItem('refresh_token');
            if (!refresh) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${baseURL}/auth/token/refresh/`, {
                    refresh,
                });
                localStorage.setItem('access_token', res.data.access);
                original.headers.Authorization = `Bearer ${res.data.access}`;
                return client(original);
            } catch {
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default client;