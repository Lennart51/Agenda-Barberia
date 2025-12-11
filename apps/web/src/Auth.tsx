import { useState } from 'react';
import { api } from './api';
import './App.css';

export default function Auth({ onLogged }: { onLogged: (user: any) => void }) {
  const [email, setEmail] = useState('admin@barberia.com');
  const [password, setPassword] = useState('admin123');
  const [nombreCompleto, setNombreCompleto] = useState('Admin Barbería');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('CLIENTE');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Datos de prueba para diferentes roles
  const testUsers = {
    admin: { email: 'admin@barberia.com', password: 'admin123', nombre: 'Admin Barbería' },
    barbero: { email: 'barbero@barberia.com', password: 'barbero123', nombre: 'Juan Barbero' },
    cliente: { email: 'cliente@barberia.com', password: 'cliente123', nombre: 'María Cliente' }
  };

  const loadTestUser = (userType: 'admin' | 'barbero' | 'cliente') => {
    const user = testUsers[userType];
    setEmail(user.email);
    setPassword(user.password);
    setNombreCompleto(user.nombre);
    setRol(userType === 'admin' ? 'ADMIN' : userType === 'barbero' ? 'BARBERO' : 'CLIENTE');
    setErr(null); // Limpiar cualquier error previo
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload = mode === 'login' 
        ? { email, password } 
        : { email, password, nombreCompleto, telefono, rol };
      
      const { data } = await api.post(url, payload);
      localStorage.setItem('token', data.access_token);
      onLogged(data.usuario);
    } catch (e: any) {
      console.error('Error de autenticación:', e);
      const errorMsg = e?.response?.data?.message || e?.message || 'Error en la autenticación';
      setErr(errorMsg);
      // Mantener el error visible por más tiempo
      setTimeout(() => {
        // Solo limpiar el error si no hay nueva actividad
        if (!loading) {
          // No limpiar automáticamente el error
        }
      }, 5000);
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
              <>
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

                <div className="form-group">
                  <label>Teléfono (opcional)</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="+569 1234 5678"
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Usuario</label>
                  <select
                    value={rol}
                    onChange={e => setRol(e.target.value)}
                    required
                  >
                    <option value="CLIENTE">Cliente</option>
                    <option value="BARBERO">Barbero</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </>
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
                setErr(null); // Limpiar error al cambiar de modo
              }}
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>

            {/* Botones de prueba para facilitar testing */}
            {mode === 'login' && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
                  Usuarios de prueba:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => loadTestUser('admin')}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    style={{ 
                      background: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => loadTestUser('barbero')}
                  >
                    Barbero
                  </button>
                  <button
                    type="button"
                    style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => loadTestUser('cliente')}
                  >
                    Cliente
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
