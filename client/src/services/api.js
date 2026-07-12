import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('transitops_token');
      localStorage.removeItem('transitops_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUsers: () => api.get('/auth/users'),
  getUsersList: () => api.get('/auth/users/list'),
};

// Dashboard
export const dashboardAPI = {
  get: (params) => api.get('/dashboard', { params }),
};

// Vehicles
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  getAvailable: () => api.get('/vehicles/available'),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Drivers
export const driverAPI = {
  getAll: (params) => api.get('/drivers', { params }),
  getOne: (id) => api.get(`/drivers/${id}`),
  getAvailable: () => api.get('/drivers/available'),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

// Trips
export const tripAPI = {
  getAll: (params) => api.get('/trips', { params }),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  dispatch: (id) => api.patch(`/trips/${id}/dispatch`),
  complete: (id, data) => api.patch(`/trips/${id}/complete`, data),
  cancel: (id, data) => api.patch(`/trips/${id}/cancel`, data),
};

// Maintenance
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getOne: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// Fuel
export const fuelAPI = {
  getAll: (params) => api.get('/fuel', { params }),
  getOne: (id) => api.get(`/fuel/${id}`),
  create: (data) => api.post('/fuel', data),
  update: (id, data) => api.put(`/fuel/${id}`, data),
  delete: (id) => api.delete(`/fuel/${id}`),
};

// Expenses
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getOne: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Reports
export const reportsAPI = {
  get: (params) => api.get('/reports', { params }),
};

export default api;
