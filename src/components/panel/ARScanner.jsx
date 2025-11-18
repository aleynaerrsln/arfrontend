import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ARScanner({ open, onClose, restaurantId, onModelAdded }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [step, setStep] = useState(1); // 1: Kamera, 2: Bilgi formu, 3: Yükleniyor
  const [error, setError] = useState('');
  const [modelData, setModelData] = useState({
    name: '',
    description: '',
    category: ''
  });

  // Kamera başlat
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Arka kamera (mobilde)
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setError('');
    } catch (err) {
      setError('Kamera erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.');
      console.error('Kamera hatası:', err);
    }
  };

  // Kamera durdur
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Dialog açıldığında kamerayı başlat
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setStep(1);
      setModelData({ name: '', description: '', category: '' });
    }

    return () => stopCamera();
  }, [open]);

  // Fotoğraf çek
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
      setStep(2);
    }
  };

  // Tekrar çek
  const retakePhoto = () => {
    setCapturedImage(null);
    setStep(1);
    startCamera();
  };

  // Form değişikliklerini handle et
  const handleInputChange = (e) => {
    setModelData({
      ...modelData,
      [e.target.name]: e.target.value
    });
  };

  // 3D Model oluştur ve yükle
  const handleUpload = async () => {
    if (!modelData.name) {
      setError('Lütfen model adı girin');
      return;
    }

    setStep(3);
    setError('');

    try {
      // TODO: Gerçek 3D model oluşturma ve upload
      // Şimdilik simüle ediyoruz
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
      
      alert('✅ 3D Model başarıyla oluşturuldu!\n\n(Gerçek AR tarama özelliği yakında eklenecek)');
      
      onModelAdded();
      onClose();
      
    } catch (err) {
      setError('Model yüklenirken hata oluştu');
      setStep(2);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        📸 AR 3D Model Tarama
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ADIM 1: Kamera */}
        {step === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Taramak istediğiniz ürünü kamera önüne koyun ve fotoğrafını çekin
            </Typography>
            
            {capturedImage ? (
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                />
              </Box>
            ) : (
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                height: 400,
                backgroundColor: '#000',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>
            )}
          </Box>
        )}

        {/* ADIM 2: Model Bilgileri */}
        {step === 2 && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img 
                src={capturedImage} 
                alt="Captured" 
                style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              3D model bilgilerini girin
            </Typography>

            <TextField
              fullWidth
              required
              label="Model Adı"
              name="name"
              value={modelData.name}
              onChange={handleInputChange}
              margin="normal"
              placeholder="Örn: Whopper Burger"
            />

            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={modelData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
              placeholder="Model hakkında kısa açıklama"
            />

            <TextField
              fullWidth
              label="Kategori"
              name="category"
              value={modelData.category}
              onChange={handleInputChange}
              margin="normal"
              placeholder="Örn: Burgerler, İçecekler"
            />
          </Box>
        )}

        {/* ADIM 3: Yükleniyor */}
        {step === 3 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">
              3D Model Oluşturuluyor...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lütfen bekleyin
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step === 1 && !capturedImage && (
          <>
            <Button onClick={onClose}>İptal</Button>
            <Button 
              variant="contained" 
              startIcon={<CameraAltIcon />}
              onClick={capturePhoto}
            >
              Fotoğraf Çek
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Button onClick={retakePhoto}>Tekrar Çek</Button>
            <Button 
              variant="contained" 
              startIcon={<CheckCircleIcon />}
              onClick={handleUpload}
            >
              Kaydet ve Yükle
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ARScanner;
