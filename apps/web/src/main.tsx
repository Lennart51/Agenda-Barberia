import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from './Auth.tsx';
import App from './App.tsx';
import { api } from './api.ts';
import './index.css';

const qc = new QueryClient();

const Root = () => {
  const [logged, setLogged] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar si el token es válido y obtener información del usuario
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
          setLogged(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLogged(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setLogged(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLogged(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  return logged ? <App user={user} onLogout={handleLogout} /> : <Auth onLogged={handleLogin} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <Root />
    </QueryClientProvider>
  </React.StrictMode>
);
