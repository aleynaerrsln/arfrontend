import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import { Box, Typography, CircularProgress, Paper, IconButton, Chip } from '@mui/material';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

// 3D Model Component
function Model({ url, autoRotate }) {
  const modelRef = useRef();
  const { scene } = useGLTF(url);

  // Otomatik döndürme
  useFrame(() => {
    if (autoRotate && modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Center>
      <primitive ref={modelRef} object={scene} scale={1} />
    </Center>
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="body2" sx={{ mt: 2 }}>
        3D Model Yükleniyor...
      </Typography>
    </Box>
  );
}

// Main Viewer Component
function ModelViewer3D({ modelUrl, title, onError }) {
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef();

  // Zoom In
  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
      controlsRef.current.update();
    }
  };

  // Zoom Out
  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
      controlsRef.current.update();
    }
  };

  // Auto Rotate Toggle
  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',
        width: '100%',
        height: 500,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0'
      }}
    >
      {/* Header */}
      {title && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {title}
          </Typography>
          {autoRotate && (
            <Chip
              label="Otomatik Döndürme Aktif"
              size="small"
              color="primary"
              sx={{ backgroundColor: 'rgba(25, 118, 210, 0.9)' }}
            />
          )}
        </Box>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Işıklandırma */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* 3D Model */}
          <Model url={modelUrl} autoRotate={autoRotate} />

          {/* Çevre Aydınlatması */}
          <Environment preset="studio" />

          {/* Kamera Kontrolleri */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <Suspense fallback={<LoadingSpinner />} />

      {/* Control Buttons */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 10
        }}
      >
        {/* Zoom In */}
        <IconButton
          onClick={handleZoomIn}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
          }}
          title="Yakınlaştır"
        >
          <ZoomInIcon />
        </IconButton>

        {/* Zoom Out */}
        <IconButton
          onClick={handleZoomOut}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
          }}
          title="Uzaklaştır"
        >
          <ZoomOutIcon />
        </IconButton>

        {/* Auto Rotate */}
        <IconButton
          onClick={toggleAutoRotate}
          sx={{
            backgroundColor: autoRotate
              ? 'rgba(25, 118, 210, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            color: autoRotate ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: autoRotate
                ? 'rgba(25, 118, 210, 1)'
                : 'rgba(255, 255, 255, 1)'
            }
          }}
          title="Otomatik Döndürme"
        >
          <RotateRightIcon />
        </IconButton>
      </Box>

      {/* Instructions */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 1,
          zIndex: 10
        }}
      >
        <Typography variant="caption" sx={{ display: 'block' }}>
          🖱️ Sürükle: Döndür
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          🖱️ Scroll: Yakınlaştır
        </Typography>
        <Typography variant="caption">
          🖱️ Sağ Tık: Kaydır
        </Typography>
      </Box>
    </Paper>
  );
}

export default ModelViewer3D;