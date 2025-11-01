import { useState } from 'react';
import { api } from './api';
import './App.css';

export default function Auth({ onLogged }: { onLogged: () => void }) {
  const [email, setEmail] = useState('admin@barberia.com');
  const [password, setPassword] = useState('admin123');
  const [nombreCompleto, setNombreCompleto] = useState('Admin Barbería');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload = mode === 'login' 
        ? { email, password } 
        : { email, password, nombreCompleto };
      
      const { data } = await api.post(url, payload);
      localStorage.setItem('token', data.access_token);
      onLogged();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>✂️ Barbería Modern Style</h1>
            <p>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta nueva'}</p>
          </div>
          
          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={e => setNombreCompleto(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            )}

            {err && <p className="error-message">{err}</p>}

            <button 
              type="submit" 
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>

            <button
              type="button"
              className="btn-secondary full-width"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErr(null);
              }}
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
