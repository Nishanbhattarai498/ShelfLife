import axios from 'axios';

// Prefer an explicit public API URL (e.g. your deployed backend). Fall back to localhost.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
});

let authInterceptorId: number | null = null;

export const setupAuthInterceptor = (getToken: () => Promise<string | null>) => {
  // Eject existing interceptor to prevent duplicates if this is called multiple times
  if (authInterceptorId !== null) {
    api.interceptors.request.eject(authInterceptorId);
  }

  authInterceptorId = api.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting token for request:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};
