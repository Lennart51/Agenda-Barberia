import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useState } from 'react';
import './App.css';

type Servicio = {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precioBase: number | string;
  duracionMinutos: number;
  activo: boolean;
};

const categoriasLabels: Record<string, string> = {
  CORTE: '✂️ Corte',
  BARBA: '🧔 Barba',
  AFEITADO: '🪒 Afeitado',
  TINTURA: '🎨 Tintura',
  TRATAMIENTO: '💆 Tratamiento',
  COMBO: '⭐ Combo'
};

export default function App() {
  const qc = useQueryClient();
  const { data: servicios, isLoading, error } = useQuery<Servicio[]>({
    queryKey: ['servicios'],
    queryFn: async () => (await api.get('/servicios')).data,
  });

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('CORTE');
  const [precioBase, setPrecioBase] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState('');
  const [activo, setActivo] = useState(true);

  // Estado para edición
  const [editingId, setEditingId] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async () => 
      api.post('/servicios', { 
        nombre, 
        descripcion: descripcion || undefined,
        categoria,
        precioBase: parseFloat(precioBase),
        duracionMinutos: parseInt(duracionMinutos),
        activo: true
      }),
    onSuccess: () => {
      resetForm();
      qc.invalidateQueries({ queryKey: ['servicios'] });
    },
  });

  const update = useMutation({
    mutationFn: async () => 
      api.patch(`/servicios/${editingId}`, { 
        nombre, 
        descripcion: descripcion || undefined,
        categoria,
        precioBase: parseFloat(precioBase),
        duracionMinutos: parseInt(duracionMinutos),
        activo
      }),
    onSuccess: () => {
      resetForm();
      qc.invalidateQueries({ queryKey: ['servicios'] });
    },
  });

  const deleteServicio = useMutation({
    mutationFn: async (id: string) => api.delete(`/servicios/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servicios'] });
    },
  });

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setCategoria('CORTE');
    setPrecioBase('');
    setDuracionMinutos('');
    setActivo(true);
    setEditingId(null);
  };

  const startEdit = (servicio: Servicio) => {
    setNombre(servicio.nombre);
    setDescripcion(servicio.descripcion || '');
    setCategoria(servicio.categoria);
    setPrecioBase(servicio.precioBase.toString());
    setDuracionMinutos(servicio.duracionMinutos.toString());
    setActivo(servicio.activo);
    setEditingId(servicio.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando servicios…</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p>❌ Error cargando servicios</p>
    </div>
  );

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            <div>
              <h1>✂️ Gestión de Servicios</h1>
              <p>Barbería Modern Style</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid white',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <main className="main-content">
        {/* Formulario */}
        <section className="form-section">
          <h2>{editingId ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nombre.trim() && precioBase && duracionMinutos) {
                editingId ? update.mutate() : create.mutate();
              }
            }}
            className="form-grid"
          >
            <div className="form-group">
              <label>Nombre del Servicio *</label>
              <input
                type="text"
                placeholder="Ej: Corte Clásico"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Categoría *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="CORTE">✂️ Corte</option>
                <option value="BARBA">🧔 Barba</option>
                <option value="AFEITADO">🪒 Afeitado</option>
                <option value="TINTURA">🎨 Tintura</option>
                <option value="TRATAMIENTO">💆 Tratamiento</option>
                <option value="COMBO">⭐ Combo</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Precio (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="15.00"
                value={precioBase}
                onChange={(e) => setPrecioBase(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Duración (minutos) *</label>
              <input
                type="number"
                min="5"
                placeholder="30"
                value={duracionMinutos}
                onChange={(e) => setDuracionMinutos(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label>Descripción (opcional)</label>
              <textarea
                placeholder="Describe los detalles del servicio..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            {editingId && (
              <div className="form-group full-width">
                <label>
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                  />
                  {' '}Servicio activo
                </label>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={create.isPending || update.isPending}
              >
                {create.isPending || update.isPending 
                  ? 'Guardando...' 
                  : editingId ? '💾 Actualizar' : '➕ Crear Servicio'
                }
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  ✕ Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista de servicios */}
        <section className="services-section">
          <h2>
            Servicios Disponibles
            {servicios && <span className="badge">{servicios.length}</span>}
          </h2>

          {servicios && servicios.length === 0 ? (
            <div className="empty-state">
              <p>📋 No hay servicios registrados todavía</p>
              <small>Crea tu primer servicio usando el formulario de arriba</small>
            </div>
          ) : (
            <div className="services-grid">
              {servicios?.map((s) => (
                <div key={s.id} className="service-card">
                  <div className="service-header">
                    <div className="service-title">
                      <h3>{s.nombre}</h3>
                      <span className="category-badge">
                        {categoriasLabels[s.categoria] || s.categoria}
                      </span>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(s)}
                        title="Editar servicio"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          if (confirm(`¿Eliminar servicio "${s.nombre}"?`)) {
                            deleteServicio.mutate(s.id);
                          }
                        }}
                        title="Eliminar servicio"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {s.descripcion && (
                    <p className="service-description">{s.descripcion}</p>
                  )}

                  <div className="service-details">
                    <div className="detail">
                      <span className="label">Precio</span>
                      <span className="value price">€{parseFloat(s.precioBase as any).toFixed(2)}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Duración</span>
                      <span className="value">{s.duracionMinutos} min</span>
                    </div>
                    <div className="detail">
                      <span className="label">Estado</span>
                      <span className={`status ${s.activo ? 'active' : 'inactive'}`}>
                        {s.activo ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
