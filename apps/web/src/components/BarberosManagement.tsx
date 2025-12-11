import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useState } from 'react';

type Barbero = {
  id: string;
  nombre: string;
  anosExperiencia?: number;
  biografia?: string;
  disponible: boolean;
  usuario: {
    id: string;
    email: string;
    telefono?: string;
    nombreCompleto: string;
  };
};

export default function BarberosManagement() {
  const qc = useQueryClient();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [biografia, setBiografia] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: barberos, isLoading, error } = useQuery<Barbero[]>({
    queryKey: ['barberos'],
    queryFn: async () => (await api.get('/barberos')).data,
  });

  const createBarbero = useMutation({
    mutationFn: async () => {
      return api.post('/barberos', {
        nombre,
        email,
        password,
        nombreCompleto: nombre,
        telefono,
        anosExperiencia: anosExperiencia ? parseInt(anosExperiencia) : undefined,
        biografia: biografia || undefined,
        disponible
      });
    },
    onSuccess: () => {
      resetForm();
      qc.invalidateQueries({ queryKey: ['barberos'] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Error al crear barbero');
    }
  });

  const updateBarbero = useMutation({
    mutationFn: async () => 
      api.patch(`/barberos/${editingId}`, {
        nombre,
        anosExperiencia: anosExperiencia ? parseInt(anosExperiencia) : undefined,
        biografia: biografia || undefined,
        disponible
      }),
    onSuccess: () => {
      resetForm();
      qc.invalidateQueries({ queryKey: ['barberos'] });
    },
  });

  const deleteBarbero = useMutation({
    mutationFn: async (id: string) => api.delete(`/barberos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['barberos'] });
    },
  });

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setTelefono('');
    setPassword('');
    setAnosExperiencia('');
    setBiografia('');
    setDisponible(true);
    setEditingId(null);
  };

  const startEdit = (barbero: Barbero) => {
    setNombre(barbero.nombre);
    setEmail(barbero.usuario.email);
    setTelefono(barbero.usuario.telefono || '');
    setPassword(''); // No mostrar password existente por seguridad
    setAnosExperiencia(barbero.anosExperiencia?.toString() || '');
    setBiografia(barbero.biografia || '');
    setDisponible(barbero.disponible);
    setEditingId(barbero.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando barberos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ Error cargando barberos</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">
          {editingId ? '✏️ Editar Barbero' : '👨‍💼 Nuevo Barbero'}
        </h2>
        {!editingId && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            ℹ️ Al crear un barbero nuevo se generará automáticamente una cuenta de acceso con las credenciales proporcionadas
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (editingId) {
            // Para edición, validar solo campos básicos
            if (nombre.trim()) {
              updateBarbero.mutate();
            }
          } else {
            // Para creación, validar que incluya credenciales
            if (nombre.trim() && email.trim() && password.trim()) {
              createBarbero.mutate();
            } else {
              alert('Por favor completa todos los campos obligatorios (*) para crear un nuevo barbero');
            }
          }
        }}
        className="form-grid"
        style={{ marginBottom: '3rem' }}
      >
        <div className="form-group">
          <label>Nombre Completo *</label>
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {!editingId && (
          <>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="juan@barberia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                placeholder="+56912345678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Años de Experiencia</label>
          <input
            type="number"
            min="0"
            placeholder="5"
            value={anosExperiencia}
            onChange={(e) => setAnosExperiencia(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
            />
            {' '}Disponible para citas
          </label>
        </div>

        <div className="form-group full-width">
          <label>Biografía y Especialidades (opcional)</label>
          <textarea
            placeholder="Describe la experiencia, estilo y especialidades del barbero (ej: Especialista en cortes modernos, barba, etc.)..."
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-actions full-width">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={createBarbero.isPending || updateBarbero.isPending}
          >
            {createBarbero.isPending || updateBarbero.isPending
              ? 'Guardando...' 
              : editingId ? '💾 Actualizar' : '➕ Crear Barbero'
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

      <div className="section-header">
        <h2 className="section-title">
          Barberos Registrados
          {barberos && <span className="badge">{barberos.length}</span>}
        </h2>
      </div>

      {barberos && barberos.length === 0 ? (
        <div className="empty-state">
          <p>👨‍💼 No hay barberos registrados todavía</p>
          <small>Agrega el primer barbero usando el formulario de arriba</small>
        </div>
      ) : (
        <div className="barberos-grid">
          {barberos?.map(barbero => (
            <div key={barbero.id} className="barbero-card">
              <div className="barbero-header">
                <div>
                  <h3>{barbero.nombre}</h3>
                  <p className="email">{barbero.usuario.email}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="btn-edit"
                    onClick={() => startEdit(barbero)}
                    title="Editar barbero"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => {
                      if (confirm(`¿Eliminar barbero "${barbero.nombre}"?`)) {
                        deleteBarbero.mutate(barbero.id);
                      }
                    }}
                    title="Eliminar barbero"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="barbero-info">
                {barbero.anosExperiencia && (
                  <p className="experiencia">
                    <strong>Experiencia:</strong> {barbero.anosExperiencia} años
                  </p>
                )}

                {barbero.usuario.telefono && (
                  <p className="telefono">
                    <strong>Teléfono:</strong> {barbero.usuario.telefono}
                  </p>
                )}

                <div className="disponibilidad">
                  <span className={`availability-badge ${barbero.disponible ? 'available' : 'unavailable'}`}>
                    {barbero.disponible ? '✅ Disponible' : '🚫 No disponible'}
                  </span>
                </div>

                {barbero.biografia && (
                  <div className="biografia">
                    <strong>Biografía:</strong>
                    <p>{barbero.biografia}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}