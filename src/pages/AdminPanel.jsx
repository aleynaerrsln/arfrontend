import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import RestaurantForm from '../components/admin/RestaurantForm';
import RestaurantList from '../components/admin/RestaurantList';
import { getAllRestaurants } from '../services/restaurantService';

function AdminPanel() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Restoranları yükle
  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getAllRestaurants();
      setRestaurants(data.data);
      setError(null);
    } catch (err) {
      setError('Restoranlar yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde restoranları getir
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Yeni restoran eklendiğinde
  const handleRestaurantAdded = () => {
    setSuccessMessage('Restoran başarıyla eklendi!');
    loadRestaurants();
    
    // 3 saniye sonra mesajı kaldır
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Başlık */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          🎯 Admin Paneli
        </Typography>

        {/* Başarı Mesajı */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Hata Mesajı */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Restoran Ekleme Formu */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            ➕ Yeni Restoran Ekle
          </Typography>
          <RestaurantForm onRestaurantAdded={handleRestaurantAdded} />
        </Paper>

        {/* Restoran Listesi */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            📋 Restoranlar ({restaurants.length})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <RestaurantList 
              restaurants={restaurants} 
              onRestaurantDeleted={loadRestaurants}
            />
          )}
        </Paper>
      </Container>
    </Box>
  );
}
export default AdminPanel;
