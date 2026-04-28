import axios from 'axios';

const api = axios.create({ 
  baseURL: process.env.VITE_API_URL || '/api'
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register/user', data);
export const registerFoodPartner = (data) => api.post('/auth/register/food-partner', data);
export const getMe = () => api.get('/auth/me');

// Food
export const getFeed = (page = 1, limit = 10) => api.get(`/food?page=${page}&limit=${limit}`);
export const getFoodById = (id) => api.get(`/food/${id}`);
export const toggleLike = (id) => api.post(`/food/${id}/like`);
export const toggleSave = (id) => api.post(`/food/${id}/save`);
export const getSavedFoods = () => api.get('/food/saved');
export const getPartnerFoods = (id) => api.get(`/food/partner/${id}`);

// Upload
export const createFood = (formData) => api.post('/food/create', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const createFoodWithUrl = (data) => api.post('/food/create-url', data);
export const deleteFood = (id) => api.delete(`/food/${id}`);
export default api;
