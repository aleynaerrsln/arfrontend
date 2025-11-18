import api from './api';

// Tüm restoranları getir
export const getAllRestaurants = async () => {
  const response = await api.get('/restaurants');
  return response.data;
};

// ID'ye göre restoran getir
export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

// İsme göre restoran getir
export const getRestaurantByName = async (name) => {
  const response = await api.get(`/restaurants/name/${name}`);
  return response.data;
};

// Yeni restoran ekle
export const createRestaurant = async (restaurantData) => {
  const response = await api.post('/restaurants', restaurantData);
  return response.data;
};

// Restoran güncelle
export const updateRestaurant = async (id, restaurantData) => {
  const response = await api.put(`/restaurants/${id}`, restaurantData);
  return response.data;
};

// Restoran sil
export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/restaurants/${id}`);
  return response.data;
};

// Login
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};
