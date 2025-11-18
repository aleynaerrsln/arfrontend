import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Box,
  Alert 
} from '@mui/material';
import { createRestaurant } from '../../services/restaurantService';

function RestaurantForm({ onRestaurantAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Input değişikliklerini handle et
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Zorunlu alanları kontrol et
    if (!formData.name || !formData.displayName || !formData.username || !formData.password) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await createRestaurant(formData);
      
      // Formu temizle
      setFormData({
        name: '',
        displayName: '',
        username: '',
        password: '',
        email: '',
        phone: '',
        address: ''
      });
      
      // Parent component'e bildir
      onRestaurantAdded();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Restoran eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Restoran Adı (URL)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="burger-king"
            helperText="Küçük harf, tire ile (örn: burger-king)"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Görünen İsim"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Burger King"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Kullanıcı Adı"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="burgerking_admin"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="password"
            label="Şifre"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="******"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@burgerking.com"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Telefon"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+90 555 123 4567"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adres"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="İstanbul, Türkiye"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Ekleniyor...' : '✅ Restoran Ekle'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default RestaurantForm;
