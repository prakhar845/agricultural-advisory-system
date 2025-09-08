import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Farms API
export const farmsAPI = {
  getFarms: async () => {
    const response = await api.get('/farms');
    return response.data;
  },
  getFarm: async (farmId) => {
    const response = await api.get(`/farms/${farmId}`);
    return response.data;
  },
  createFarm: async (farmData) => {
    const response = await api.post('/farms', farmData);
    return response.data;
  },
  updateFarm: async (farmId, farmData) => {
    const response = await api.put(`/farms/${farmId}`, farmData);
    return response.data;
  },
  getFarmWeather: async (farmId) => {
    const response = await api.get(`/farms/${farmId}/weather`);
    return response.data;
  },
  getFarmWeatherForecast: async (farmId, days = 5) => {
    const response = await api.get(`/farms/${farmId}/weather/forecast?days=${days}`);
    return response.data;
  },
  getFarmRecommendations: async (farmId) => {
    const response = await api.get(`/farms/${farmId}/recommendations`);
    return response.data;
  },
  getDiseaseHistory: async (farmId) => {
    const response = await api.get(`/farms/${farmId}/disease-history`);
    return response.data;
  },
};

// Crops API
export const cropsAPI = {
  getFarmCrops: async (farmId) => {
    const response = await api.get(`/farms/${farmId}/crops`);
    return response.data;
  },
  createCrop: async (cropData) => {
    const response = await api.post('/crops', cropData);
    return response.data;
  },
  getIrrigationRecommendation: async (farmId, cropId) => {
    const response = await api.get(`/farms/${farmId}/crops/${cropId}/irrigation`);
    return response.data;
  },
  getFertilizerRecommendation: async (farmId, cropId) => {
    const response = await api.get(`/farms/${farmId}/crops/${cropId}/fertilizer`);
    return response.data;
  },
  detectDisease: async (farmId, cropId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/farms/${farmId}/crops/${cropId}/disease-detection`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
