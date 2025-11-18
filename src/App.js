import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import AdminPanel from './pages/AdminPanel';
import PanelLogin from './pages/PanelLogin';
import PanelDashboard from './pages/PanelDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Admin Panel */}
          <Route path="/adminpanel" element={<AdminPanel />} />
          
          {/* Restoran Panel Login */}
          <Route path="/panel/:restaurant/login" element={<PanelLogin />} />
          
          {/* Restoran Panel Dashboard */}
          <Route path="/panel/:restaurant" element={<PanelDashboard />} />
          
          {/* Ana Sayfa */}
          <Route path="/" element={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              flexDirection: 'column'
            }}>
              <h1>🎯 AR Menu</h1>
              <p>Admin Panel: <a href="/adminpanel">/adminpanel</a></p>
              <p>Restoran Panel: <a href="/panel/garage/login">/panel/garage/login</a></p>
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
