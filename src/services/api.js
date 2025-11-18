import axios from 'axios';
import config from '../config/config';

// Axios instance oluştur
const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (her istekten önce çalışır)
api.interceptors.request.use(
  (config) => {
    // Token varsa header'a ekle (sonra kullanacağız)
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

// Response interceptor (her response'dan sonra çalışır)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Hata durumunda konsola yaz
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
export default api;