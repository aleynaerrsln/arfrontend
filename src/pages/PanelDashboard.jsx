import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { getRestaurantByName } from '../services/restaurantService';
import ARScanner from '../components/panel/ARScanner';

function PanelDashboard() {
  const { restaurant } = useParams();
  const navigate = useNavigate();
  
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [models, setModels] = useState([]);
  const [arScannerOpen, setArScannerOpen] = useState(false);

  // Restoran bilgilerini yükle
  useEffect(() => {
    loadRestaurantData();
  }, [restaurant]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      const response = await getRestaurantByName(restaurant);
      setRestaurantData(response.data);
      setError('');
    } catch (err) {
      setError('Restoran bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant');
    navigate(`/panel/${restaurant}/login`);
  };

  // AR Scanner aç
  const handleOpenARScanner = () => {
    setArScannerOpen(true);
  };

  // AR Scanner kapat
  const handleCloseARScanner = () => {
    setArScannerOpen(false);
  };

  // Model eklendi
  const handleModelAdded = () => {
    // TODO: Modelleri yeniden yükle
    alert('Model eklendi! (Model listesi yakında güncellenecek)');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Top Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎯 {restaurantData?.displayName} - Yönetim Paneli
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Çıkış Yap">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Hoş Geldin Mesajı */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            👋 Hoş Geldiniz!
          </Typography>
          <Typography color="text.secondary">
            Restoran Adı: <strong>{restaurantData?.displayName}</strong>
          </Typography>
          <Typography color="text.secondary">
            URL: <strong>armenu.com/{restaurantData?.name}</strong>
          </Typography>
        </Paper>

        {/* AR Tarama Bölümü */}
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <CameraAltIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            3D Model Tarama
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Kamerayı açarak ürünlerinizi 3D olarak tarayın
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CameraAltIcon />}
            onClick={handleOpenARScanner}
          >
            📸 AR Taramayı Başlat
          </Button>
        </Paper>

        {/* 3D Modeller Listesi */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            📦 3D Modellerim ({models.length})
          </Typography>
          
          {models.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Henüz 3D model eklenmemiş
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                "AR Taramayı Başlat" butonuna tıklayarak ilk modelinizi ekleyin
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {models.map((model) => (
                <Grid item xs={12} sm={6} md={4} key={model._id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{model.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {model.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* AR Scanner Dialog */}
      <ARScanner
        open={arScannerOpen}
        onClose={handleCloseARScanner}
        restaurantId={restaurantData?._id}
        onModelAdded={handleModelAdded}
      />
    </Box>
  );
}

export default PanelDashboard;
