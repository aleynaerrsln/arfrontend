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
  CircularProgress,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RotateRightIcon from '@mui/icons-material/RotateRight';

const RECORDING_STEPS = [
  'Kamera Hazırla',
  'Video Kaydet',
  'İncele',
  'Bilgi Gir',
  'İşleniyor'
];

function ARScanner({ open, onClose, restaurantId, onModelAdded }) {
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [stream, setStream] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraPermission, setCameraPermission] = useState(null); // 'granted', 'denied', 'prompt'
  const [cameraLoading, setCameraLoading] = useState(false);

  const [modelData, setModelData] = useState({
    name: '',
    description: '',
    category: ''
  });

  // Kamera başlat
const startCamera = async () => {
  setCameraLoading(true);
  setError('');
  
  try {
    // HTTPS kontrolü ekle
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      throw new Error('HTTPS_REQUIRED');
    }
    
    // Tarayıcı desteği kontrolü - daha detaylı
    if (!navigator.mediaDevices) {
      console.error('navigator.mediaDevices mevcut değil');
      throw new Error('BROWSER_NOT_SUPPORTED');
    }
    
    if (!navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia fonksiyonu mevcut değil');
      throw new Error('BROWSER_NOT_SUPPORTED');
    }

    // Kamera izni iste
    console.log('🎥 Kamera izni isteniyor...');
    
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    console.log('✅ Kamera izni alındı');

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      
      // Video elementinin muted olduğundan emin ol (autoplay için gerekli)
      videoRef.current.muted = true;
      videoRef.current.playsInline = true; // iOS için önemli
      
      try {
        await videoRef.current.play();
        console.log('✅ Video stream başladı');
      } catch (playError) {
        console.error('Video play error:', playError);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }, 100);
      }
    }

    setStream(mediaStream);
    setCameraPermission('granted');
    setError('');
    setActiveStep(0);
    
  } catch (err) {
    setCameraPermission('denied');
    console.error('Kamera hatası detayı:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    // Hata mesajlarını güncelle
    if (err.message === 'HTTPS_REQUIRED') {
      setError('Kamera erişimi için HTTPS bağlantısı gerekiyor. Lütfen güvenli bağlantı kullanın.');
    } else if (err.message === 'BROWSER_NOT_SUPPORTED') {
      setError('Tarayıcınız kamera kullanımını desteklemiyor. Lütfen güncel Chrome, Firefox veya Safari kullanın.');
    } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setError('Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera iznini kontrol edin.');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      setError('Kamera bulunamadı. Lütfen cihazınızda kamera olduğundan emin olun.');
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      setError('Kamera başka bir uygulama tarafından kullanılıyor olabilir.');
    } else if (err.name === 'OverconstrainedError') {
      setError('İstenen kamera özellikleri desteklenmiyor.');
    } else {
      setError(`Kamera başlatılamadı: ${err.name || err.message}`);
    }
  } finally {
    setCameraLoading(false);
  }
};
  // Kamera durdur
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Video kaydı başlat
  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo({ blob, url: videoUrl });
      setActiveStep(2); // İncele adımına geç
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
    setActiveStep(1);
    
    // Kayıt süresini başlat
    setRecordingTime(0);
  };

  // Video kaydı durdur
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCamera();
    }
  };

  // Tekrar kaydet
  const retakeVideo = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
    setActiveStep(0);
    startCamera();
  };

  // Videoyu onayla
  const approveVideo = () => {
    setActiveStep(3); // Bilgi girişi adımına geç
  };

  // Kayıt süresi sayacı
  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // Dialog açıldığında kamerayı başlat
  useEffect(() => {
    if (open) {
      // Kamera otomatik açılmıyor, kullanıcı manuel açacak
      setCameraPermission('prompt');
    } else {
      stopCamera();
      setRecordedVideo(null);
      setActiveStep(0);
      setRecordingTime(0);
      setModelData({ name: '', description: '', category: '' });
      setError('');
      setCameraPermission(null);
    }

    return () => stopCamera();
  }, [open]);

  // Form değişikliklerini handle et
  const handleInputChange = (e) => {
    setModelData({
      ...modelData,
      [e.target.name]: e.target.value
    });
  };

  // Süreyi formatla (00:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video ve model bilgilerini yükle
  const handleUpload = async () => {
    if (!modelData.name) {
      setError('Lütfen model adı girin');
      return;
    }

    if (!recordedVideo) {
      setError('Video kaydı bulunamadı');
      return;
    }

    setActiveStep(4);
    setProcessing(true);
    setError('');

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('video', recordedVideo.blob, 'scan-video.webm');
      formData.append('restaurantId', restaurantId);
      formData.append('name', modelData.name);
      formData.append('description', modelData.description);
      formData.append('category', modelData.category);

      console.log('📤 Video backend\'e gönderiliyor...');

      // Backend'e gönder - GERÇEK API ÇAĞRISI
      const response = await fetch('http://192.168.1.4:5000/api/models/from-video', {
        method: 'POST',
        body: formData,
        // Content-Type otomatik olarak multipart/form-data olur
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload başarısız');
      }

      const result = await response.json();
      
      console.log('✅ Upload başarılı:', result);

      // Başarılı
      onModelAdded();
      onClose();
      
    } catch (err) {
      console.error('❌ Upload hatası:', err);
      setError('Model yüklenirken hata oluştu: ' + err.message);
      setActiveStep(3);
    } finally {
      setProcessing(false);
    }
  };

  // ESKI SIMÜLASYON FONKSİYONU KALDIRILDI
  // const simulateUpload = (formData) => { ... }

  return (
    <Dialog 
      open={open} 
      onClose={!processing ? onClose : undefined}
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={processing}
    >
      <DialogTitle>
        📸 AR 3D Model Tarama
      </DialogTitle>

      <DialogContent>
        {/* Progress Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {RECORDING_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ADIM 0-1: Kamera & Kayıt */}
        {(activeStep === 0 || activeStep === 1) && (
          <Box>
            {/* Kamera İzin Ekranı */}
            {cameraPermission === 'prompt' && !stream && (
              <Paper
                elevation={3}
                sx={{
                  width: '100%',
                  height: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  mb: 2,
                  textAlign: 'center',
                  p: 4
                }}
              >
                <CameraAltIcon sx={{ fontSize: 100, color: 'primary.main', mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  Kamera Erişimi Gerekli
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                  3D model taraması için kameranıza erişmemiz gerekiyor. 
                  Lütfen tarayıcınızın izin isteğini onaylayın.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraAltIcon />}
                  onClick={startCamera}
                  disabled={cameraLoading}
                >
                  {cameraLoading ? 'Kamera Açılıyor...' : 'Kamerayı Aç'}
                </Button>
              </Paper>
            )}

            {/* Kamera Aktif */}
            {stream && (
              <Paper 
                elevation={3}
                sx={{ 
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  backgroundColor: '#000',
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 2
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                />

                {/* Kamera test göstergesi */}
                {!recording && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      backgroundColor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}
                  >
                    ● CANLI
                  </Box>
                )}

                {/* Kayıt göstergesi */}
                {recording && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: 'rgba(244, 67, 54, 0.9)',
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderRadius: 2
                    }}
                  >
                    <FiberManualRecordIcon sx={{ animation: 'blink 1s infinite' }} />
                    <Typography variant="h6" fontWeight={600}>
                      {formatTime(recordingTime)}
                    </Typography>
                  </Box>
                )}

                {/* Tarama rehberi */}
                {recording && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      px: 3,
                      py: 2,
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <RotateRightIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1" fontWeight={600}>
                      Nesneyi 360° Çevirin
                    </Typography>
                    <Typography variant="caption">
                      Her açıdan görüntü alın • Yavaşça döndürün
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {!recording && stream && (
              <Alert severity="info">
                <strong>Tarama İpuçları:</strong>
                <br />
                • Nesneyi düz bir yüzeye koyun
                <br />
                • İyi ışıklandırılmış bir ortam seçin
                <br />
                • Nesnenin etrafında yavaşça dönün
                <br />
                • En az 10-15 saniye video çekin
              </Alert>
            )}
          </Box>
        )}

        {/* ADIM 2: Video İnceleme */}
        {activeStep === 2 && recordedVideo && (
          <Box>
            <Paper 
              elevation={3}
              sx={{ 
                width: '100%',
                height: 400,
                backgroundColor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 2
              }}
            >
              <video
                src={recordedVideo.url}
                controls
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain' 
                }}
              />
            </Paper>

            <Alert severity="success" icon={<CheckCircleIcon />}>
              Video başarıyla kaydedildi! • Süre: {formatTime(recordingTime)}
            </Alert>
          </Box>
        )}

        {/* ADIM 3: Model Bilgileri */}
        {activeStep === 3 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              3D model bilgilerini girin
            </Alert>

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

        {/* ADIM 4: İşleniyor */}
        {activeStep === 4 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={80} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              3D Model Oluşturuluyor...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Video işleniyor ve 3D model oluşturuluyor. Bu işlem 1-3 dakika sürebilir.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>İşlem Adımları:</strong>
              <br />
              1. Video yükleniyor
              <br />
              2. Frame'ler çıkarılıyor
              <br />
              3. 3D model oluşturuluyor
              <br />
              4. Model kaydediliyor
            </Alert>

            <Typography variant="caption" color="text.secondary">
              Lütfen sayfayı kapatmayın...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {/* ADIM 0: Kamera Hazır */}
        {activeStep === 0 && (
          <>
            <Button onClick={onClose}>İptal</Button>
            <Button 
              variant="contained" 
              startIcon={<FiberManualRecordIcon />}
              onClick={startRecording}
              disabled={!stream}
            >
              Kaydı Başlat
            </Button>
          </>
        )}

        {/* ADIM 1: Kayıt Devam Ediyor */}
        {activeStep === 1 && (
          <Button 
            variant="contained" 
            color="error"
            startIcon={<StopIcon />}
            onClick={stopRecording}
          >
            Kaydı Durdur
          </Button>
        )}

        {/* ADIM 2: Video İnceleme */}
        {activeStep === 2 && (
          <>
            <Button onClick={retakeVideo} startIcon={<CameraAltIcon />}>
              Tekrar Çek
            </Button>
            <Button 
              variant="contained" 
              startIcon={<CheckCircleIcon />}
              onClick={approveVideo}
            >
              Devam Et
            </Button>
          </>
        )}

        {/* ADIM 3: Bilgi Girişi */}
        {activeStep === 3 && (
          <>
            <Button onClick={retakeVideo}>Geri</Button>
            <Button 
              variant="contained" 
              startIcon={<PlayArrowIcon />}
              onClick={handleUpload}
              disabled={!modelData.name}
            >
              3D Model Oluştur
            </Button>
          </>
        )}

        {/* ADIM 4: İşleniyor - Buton yok */}
      </DialogActions>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </Dialog>
  );
}

export default ARScanner;