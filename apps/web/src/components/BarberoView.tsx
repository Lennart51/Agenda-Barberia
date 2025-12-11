import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

type Cita = {
  id: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  notasCliente?: string;
  cliente: {
    usuario: {
      nombreCompleto: string;
      telefono?: string;
    };
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
  userId: string;
};

export default function BarberoView({ userId }: Props) {
  // Primero obtener información del barbero actual
  const { data: barberoData, isLoading: loadingBarbero } = useQuery({
    queryKey: ['barbero-me'],
    queryFn: async () => {
      const response = await api.get('/barberos/me');
      return response.data;
    },
  });

  const { data: citas, isLoading: loadingCitas, error } = useQuery<Cita[]>({
    queryKey: ['mis-citas-barbero', barberoData?.id],
    queryFn: async () => {
      if (!barberoData?.id) return [];
      const response = await api.get(`/citas/barbero/${barberoData.id}`);
      return response.data;
    },
    enabled: !!barberoData?.id, // Solo ejecutar si tenemos el ID del barbero
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

  // Separar citas por fecha
  const agruparCitasPorFecha = (citas: Cita[]) => {
    const grupos: { [key: string]: Cita[] } = {};
    
    citas?.forEach(cita => {
      const fecha = new Date(cita.horaInicio).toDateString();
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(cita);
    });

    // Ordenar por fecha y dentro de cada fecha por hora
    Object.keys(grupos).forEach(fecha => {
      grupos[fecha].sort((a, b) => 
        new Date(a.horaInicio).getTime() - new Date(b.horaInicio).getTime()
      );
    });

    return grupos;
  };

  if (loadingBarbero || loadingCitas) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tus citas...</p>
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

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">
          📅 Mis Citas
          {citas && <span className="badge">{citas.length}</span>}
        </h2>
      </div>

      {citas && citas.length === 0 ? (
        <div className="empty-state">
          <p>📅 No tienes citas programadas</p>
          <small>Las nuevas reservas aparecerán aquí</small>
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
                        <span className="hora">🕒 {formatTime(cita.horaInicio)} - {formatTime(cita.horaFin)}</span>
                        <span className={`estado-badge ${getEstadoColor(cita.estado)}`}>
                          {getEstadoIcon(cita.estado)} {cita.estado.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="cliente-info">
                      <h4>👤 {cita.cliente.usuario.nombreCompleto}</h4>
                      {cita.cliente.usuario.telefono && (
                        <p className="telefono">📞 {cita.cliente.usuario.telefono}</p>
                      )}
                    </div>

                    <div className="servicios-info">
                      <h5>Servicios solicitados:</h5>
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
                    </div>

                    {cita.notasCliente && (
                      <div className="notas-cliente">
                        <h5>📝 Notas del cliente:</h5>
                        <p>{cita.notasCliente}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {citas && citas.length > 0 && (
        <div className="stats-section">
          <h3>📊 Resumen</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{citas.length}</span>
              <span className="stat-label">Total Citas</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {citas.filter(c => c.estado === 'PENDIENTE').length}
              </span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {citas.filter(c => c.estado === 'COMPLETADA').length}
              </span>
              <span className="stat-label">Completadas</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                ${citas.reduce((total, cita) => 
                  total + cita.servicios.reduce((subtotal, srv) => 
                    subtotal + parseFloat(srv.servicio.precioBase.toString()), 0
                  ), 0
                ).toLocaleString()}
              </span>
              <span className="stat-label">Ingresos Potenciales</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}