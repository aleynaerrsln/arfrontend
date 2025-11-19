import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRestaurantByName } from '../services/restaurantService';
import ARScanner from '../components/panel/ARScanner';
import ModelViewer3D from '../components/panel/ModelViewer3D';

function PanelDashboard() {
  const { restaurant } = useParams();
  const navigate = useNavigate();
  
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [models, setModels] = useState([]);
  const [arScannerOpen, setArScannerOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Restoran bilgilerini yükle
  const loadRestaurantData = useCallback(async () => {
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
  }, [restaurant]);

  // 3D Modelleri yükle
  const loadModels = useCallback(async () => {
    if (!restaurantData?._id) return;

    try {
      console.log('📦 Modeller yükleniyor...');
      
      // Backend'den modelleri çek
      const response = await fetch(`http://172.20.10.2:5000/api/models/restaurant/${restaurantData._id}`);
      
      if (!response.ok) {
        throw new Error('Modeller yüklenemedi');
      }

      const result = await response.json();
      
      console.log('✅ Modeller yüklendi:', result);
      
      setModels(result.data || []);
      
    } catch (err) {
      console.error('❌ Model yükleme hatası:', err);
      setError('Modeller yüklenirken hata oluştu');
      setModels([]);
    }
  }, [restaurantData]);

  useEffect(() => {
    loadRestaurantData();
  }, [restaurant]); // Sadece restaurant parametresi değişince çalış

  useEffect(() => {
    if (restaurantData?._id) {
      loadModels();
    }
  }, [restaurantData?._id]); // Sadece restaurant ID değişince modelleri yükle

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
    console.log('✅ Yeni model eklendi, liste güncelleniyor...');
    loadModels(); // Backend'den yeniden yükle
  };

  // 3D Viewer aç
  const handleOpenViewer = (model) => {
    setSelectedModel(model);
    setViewerOpen(true);
  };

  // 3D Viewer kapat
  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedModel(null);
  };

  // Model sil
  const handleDeleteModel = async (modelId) => {
    if (!window.confirm('Bu modeli silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      console.log('🗑️ Model siliniyor:', modelId);
      
      const response = await fetch(`http://172.20.10.2:5000/api/models/${modelId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Model silinemedi');
      }

      console.log('✅ Model silindi');
      
      // Listeyi güncelle
      loadModels();
      
    } catch (err) {
      console.error('❌ Model silme hatası:', err);
      alert('Model silinirken hata oluştu: ' + err.message);
    }
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              📦 3D Modellerim ({models.length})
            </Typography>
          </Box>
          
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
            <Grid container spacing={3}>
              {models.map((model) => (
                <Grid item xs={12} sm={6} md={4} key={model._id}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {model.name}
                        </Typography>
                        <ViewInArIcon color="primary" />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {model.description}
                      </Typography>
                      
                      {model.category && (
                        <Chip 
                          label={model.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        📅 {new Date(model.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ViewInArIcon />}
                        onClick={() => handleOpenViewer(model)}
                      >
                        Görüntüle
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteModel(model._id)}
                        title="Sil"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
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

      {/* 3D Model Viewer Dialog */}
      <Dialog 
        open={viewerOpen} 
        onClose={handleCloseViewer}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              🎨 {selectedModel?.name}
            </Typography>
            <Chip label="3D Model" color="primary" size="small" />
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedModel && (
            <ModelViewer3D 
              modelUrl={`http://172.20.10.2:5000${selectedModel.modelUrl}`}
              title={selectedModel.description}
            />
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseViewer}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PanelDashboard;