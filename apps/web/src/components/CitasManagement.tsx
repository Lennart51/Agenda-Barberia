import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

type Cita = {
  id: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  notasCliente?: string;
  notasInternas?: string;
  montoTotal: number | string;
  cliente: {
    usuario: {
      nombreCompleto: string;
      telefono?: string;
    };
  };
  barbero: {
    nombre: string;
    especialidad: string;
  };
  servicios: {
    servicio: {
      nombre: string;
      categoria: string;
      precioBase: number | string;
      duracionMinutos: number;
    };
  }[];
};

type Props = {
  userRole: 'ADMIN' | 'CLIENTE';
  userId: string;
};

export default function CitasManagement({ userRole, userId }: Props) {
  const qc = useQueryClient();

  // Obtener información del cliente actual si el usuario es CLIENTE
  const { data: clienteData, isLoading: loadingCliente } = useQuery({
    queryKey: ['cliente-me'],
    queryFn: async () => {
      if (userRole !== 'CLIENTE') return null;
      const response = await api.get('/usuarios/me/cliente');
      return response.data;
    },
    enabled: userRole === 'CLIENTE',
  });

  const { data: citas, isLoading: loadingCitas, error } = useQuery<Cita[]>({
    queryKey: ['citas', userRole, userId, clienteData?.id],
    queryFn: async () => {
      if (userRole === 'ADMIN') {
        return (await api.get('/citas')).data;
      } else if (userRole === 'CLIENTE' && clienteData?.id) {
        return (await api.get(`/citas/cliente/${clienteData.id}`)).data;
      }
      return [];
    },
    enabled: userRole === 'ADMIN' || (userRole === 'CLIENTE' && !!clienteData?.id),
  });

  const updateEstadoCita = useMutation({
    mutationFn: async ({ citaId, nuevoEstado }: { citaId: string, nuevoEstado: string }) => {
      return api.patch(`/citas/${citaId}`, { estado: nuevoEstado });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['citas'] });
    },
  });

  const cancelarCita = useMutation({
    mutationFn: async (citaId: string) => {
      return api.patch(`/citas/${citaId}`, { 
        estado: 'CANCELADA',
        canceladaPor: userId,
        canceladaEn: new Date().toISOString(),
        razonCancelacion: 'Cancelada por el usuario'
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['citas'] });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'status-pending';
      case 'CONFIRMADA': return 'status-confirmed';
      case 'EN_PROGRESO': return 'status-progress';
      case 'COMPLETADA': return 'status-completed';
      case 'CANCELADA': return 'status-cancelled';
      case 'NO_ASISTIO': return 'status-noshow';
      default: return 'status-default';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '⏳';
      case 'CONFIRMADA': return '✅';
      case 'EN_PROGRESO': return '🔄';
      case 'COMPLETADA': return '✔️';
      case 'CANCELADA': return '❌';
      case 'NO_ASISTIO': return '👻';
      default: return '❓';
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'CORTE': return '✂️';
      case 'BARBA': return '🧔';
      case 'AFEITADO': return '🪒';
      case 'TINTURA': return '🎨';
      case 'TRATAMIENTO': return '💆';
      case 'COMBO': return '⭐';
      default: return '💼';
    }
  };

  const puedeModificar = (cita: Cita) => {
    return cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA';
  };

  const puedeCancelar = (cita: Cita) => {
    const horaInicio = new Date(cita.horaInicio);
    const ahora = new Date();
    const horasDeAnticipacion = (horaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return horasDeAnticipacion > 2 && puedeModificar(cita);
  };

  // Agrupar citas por fecha
  const agruparCitasPorFecha = (citas: Cita[]) => {
    const grupos: { [key: string]: Cita[] } = {};
    
    citas?.forEach(cita => {
      const fecha = new Date(cita.horaInicio).toDateString();
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(cita);
    });

    Object.keys(grupos).forEach(fecha => {
      grupos[fecha].sort((a, b) => 
        new Date(a.horaInicio).getTime() - new Date(b.horaInicio).getTime()
      );
    });

    return grupos;
  };

  if (loadingCliente || loadingCitas) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando citas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ Error cargando las citas</p>
      </div>
    );
  }

  const citasAgrupadas = agruparCitasPorFecha(citas || []);
  const fechasOrdenadas = Object.keys(citasAgrupadas).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const titulo = userRole === 'ADMIN' 
    ? 'Todas las Citas' 
    : 'Mis Reservas';

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">
          📅 {titulo}
          {citas && <span className="badge">{citas.length}</span>}
        </h2>
      </div>

      {citas && citas.length === 0 ? (
        <div className="empty-state">
          <p>📅 No hay citas {userRole === 'ADMIN' ? 'en el sistema' : 'reservadas'}</p>
          <small>
            {userRole === 'CLIENTE' && 'Reserva tu primera cita en la sección "Reservar Cita"'}
          </small>
        </div>
      ) : (
        <div className="citas-timeline">
          {fechasOrdenadas.map(fecha => (
            <div key={fecha} className="fecha-group">
              <h3 className="fecha-header">
                📅 {formatDate(fecha)}
              </h3>
              
              <div className="citas-del-dia">
                {citasAgrupadas[fecha].map(cita => (
                  <div key={cita.id} className="cita-card">
                    <div className="cita-header">
                      <div className="tiempo-info">
                        <span className="hora">
                          🕒 {formatTime(cita.horaInicio)} - {formatTime(cita.horaFin)}
                        </span>
                        <span className={`estado-badge ${getEstadoColor(cita.estado)}`}>
                          {getEstadoIcon(cita.estado)} {cita.estado.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="cita-actions">
                        {userRole === 'ADMIN' && puedeModificar(cita) && (
                          <>
                            {cita.estado === 'PENDIENTE' && (
                              <button
                                className="btn-confirm"
                                onClick={() => updateEstadoCita.mutate({
                                  citaId: cita.id,
                                  nuevoEstado: 'CONFIRMADA'
                                })}
                                title="Confirmar cita"
                              >
                                ✅
                              </button>
                            )}
                            {cita.estado === 'CONFIRMADA' && (
                              <button
                                className="btn-progress"
                                onClick={() => updateEstadoCita.mutate({
                                  citaId: cita.id,
                                  nuevoEstado: 'EN_PROGRESO'
                                })}
                                title="Marcar en progreso"
                              >
                                🔄
                              </button>
                            )}
                            {cita.estado === 'EN_PROGRESO' && (
                              <button
                                className="btn-complete"
                                onClick={() => updateEstadoCita.mutate({
                                  citaId: cita.id,
                                  nuevoEstado: 'COMPLETADA'
                                })}
                                title="Marcar completada"
                              >
                                ✔️
                              </button>
                            )}
                          </>
                        )}
                        
                        {puedeCancelar(cita) && (
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              if (confirm('¿Estás seguro de cancelar esta cita?')) {
                                cancelarCita.mutate(cita.id);
                              }
                            }}
                            title="Cancelar cita"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="participantes-info">
                      <div className="cliente-info">
                        <h4>👤 Cliente: {cita.cliente.usuario.nombreCompleto}</h4>
                        {cita.cliente.usuario.telefono && (
                          <p className="telefono">📞 {cita.cliente.usuario.telefono}</p>
                        )}
                      </div>
                      
                      <div className="barbero-info">
                        <h4>👨‍💼 Barbero: {cita.barbero.nombre}</h4>
                        <p className="especialidad">{cita.barbero.especialidad}</p>
                      </div>
                    </div>

                    <div className="servicios-info">
                      <h5>Servicios:</h5>
                      {cita.servicios.map((citaServicio, index) => (
                        <div key={index} className="servicio-item">
                          <span className="servicio-nombre">
                            {getCategoriaIcon(citaServicio.servicio.categoria)} {citaServicio.servicio.nombre}
                          </span>
                          <span className="servicio-detalles">
                            ${parseFloat(citaServicio.servicio.precioBase.toString()).toLocaleString()} • {citaServicio.servicio.duracionMinutos} min
                          </span>
                        </div>
                      ))}
                      <div className="total-precio">
                        <strong>Total: ${parseFloat(cita.montoTotal.toString()).toLocaleString()}</strong>
                      </div>
                    </div>

                    {cita.notasCliente && (
                      <div className="notas-cliente">
                        <h5>📝 Notas del cliente:</h5>
                        <p>{cita.notasCliente}</p>
                      </div>
                    )}

                    {userRole === 'ADMIN' && cita.notasInternas && (
                      <div className="notas-internas">
                        <h5>🔒 Notas internas:</h5>
                        <p>{cita.notasInternas}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}