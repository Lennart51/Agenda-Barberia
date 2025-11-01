import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from './Auth.tsx';
import App from './App.tsx';
import './index.css';

const qc = new QueryClient();

const Root = () => {
  const [logged, setLogged] = useState(!!localStorage.getItem('token'));
  
  return logged ? <App /> : <Auth onLogged={() => setLogged(true)} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <Root />
    </QueryClientProvider>
  </React.StrictMode>
);
