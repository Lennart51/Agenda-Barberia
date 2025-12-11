import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useState, useEffect } from 'react';

type Barbero = {
  id: string;
  nombre: string;
  anosExperiencia?: number;
  biografia?: string;
  disponible: boolean;
  usuario: {
    telefono?: string;
  };
};

type Servicio = {
  id: string;
  nombre: string;
  categoria: string;
  precioBase: number | string;
  duracionMinutos: number;
  activo: boolean;
};

type Props = {
  userId: string;
};

export default function ClienteView({ userId }: Props) {
  const qc = useQueryClient();
  const [selectedBarbero, setSelectedBarbero] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notasCliente, setNotasCliente] = useState('');

  // Limpiar barbero seleccionado cuando cambia la fecha
  useEffect(() => {
    setSelectedBarbero('');
    setSelectedTime(''); // También resetear la hora
  }, [selectedDate]);

  // Limpiar hora seleccionada cuando cambia el barbero
  useEffect(() => {
    setSelectedTime('');
  }, [selectedBarbero]);

  const { data: barberos, isLoading: loadingBarberos } = useQuery<Barbero[]>({
    queryKey: selectedDate ? ['barberos', 'disponibles', selectedDate] : ['barberos'],
    queryFn: async () => {
      if (selectedDate) {
        return (await api.get(`/barberos/disponibles/${selectedDate}`)).data;
      } else {
        return (await api.get('/barberos')).data;
      }
    },
  });

  const { data: servicios, isLoading: loadingServicios } = useQuery<Servicio[]>({
    queryKey: ['servicios'],
    queryFn: async () => (await api.get('/servicios')).data,
  });

  // Obtener horarios ocupados cuando se selecciona barbero y fecha
  const { data: horariosOcupados } = useQuery({
    queryKey: ['horarios-ocupados', selectedBarbero, selectedDate],
    queryFn: async () => {
      if (!selectedBarbero || !selectedDate) return [];
      const response = await api.get(`/citas/horarios-ocupados/${selectedBarbero}/${selectedDate}`);
      return response.data;
    },
    enabled: !!(selectedBarbero && selectedDate),
  });

  const createCita = useMutation({
    mutationFn: async () => {
      const horaInicio = new Date(`${selectedDate}T${selectedTime}:00`);
      const selectedSrv = servicios?.find(s => s.id === selectedServicio);
      const horaFin = new Date(horaInicio.getTime() + (selectedSrv?.duracionMinutos || 30) * 60000);

      return api.post('/citas', {
        clienteId: userId,
        barberoId: selectedBarbero,
        horaInicio: horaInicio.toISOString(),
        horaFin: horaFin.toISOString(),
        servicios: [selectedServicio],
        notasCliente: notasCliente || undefined,
      });
    },
    onSuccess: () => {
      setSelectedBarbero('');
      setSelectedServicio('');
      setSelectedDate('');
      setSelectedTime('');
      setNotasCliente('');
      qc.invalidateQueries({ queryKey: ['mis-citas'] });
      alert('¡Cita reservada exitosamente!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Error al reservar la cita');
    },
  });

  // Generar horarios disponibles excluyendo los ocupados
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    if (!horariosOcupados || !selectedDate) {
      return slots;
    }

    // Filtrar horarios ocupados
    return slots.filter(slot => {
      const slotDateTime = new Date(`${selectedDate}T${slot}:00`);
      
      return !horariosOcupados.some((ocupado: any) => {
        const inicio = new Date(ocupado.inicio);
        const fin = new Date(ocupado.fin);
        
        // Verificar si el slot está dentro de un rango ocupado
        return slotDateTime >= inicio && slotDateTime < fin;
      });
    });
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleReservar = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBarbero && selectedServicio && selectedDate && selectedTime) {
      createCita.mutate();
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

  if (loadingBarberos || loadingServicios) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">📅 Reservar Cita</h2>
      </div>

      {/* Formulario de reserva */}
      <form onSubmit={handleReservar} className="reservation-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Fecha *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              required
            />
            <small className="form-hint">Selecciona primero la fecha para ver barberos disponibles</small>
          </div>

          <div className="form-group">
            <label>Barbero *</label>
            <select
              value={selectedBarbero}
              onChange={(e) => setSelectedBarbero(e.target.value)}
              required
              disabled={!selectedDate}
            >
              <option value="">{!selectedDate ? "Primero selecciona una fecha" : "Selecciona un barbero"}</option>
              {barberos?.filter(b => b.disponible).map(barbero => (
                <option key={barbero.id} value={barbero.id}>
                  {barbero.nombre} {barbero.anosExperiencia && `(${barbero.anosExperiencia} años exp.)`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Servicio *</label>
            <select
              value={selectedServicio}
              onChange={(e) => setSelectedServicio(e.target.value)}
              required
            >
              <option value="">Selecciona un servicio</option>
              {servicios?.filter(s => s.activo).map(servicio => (
                <option key={servicio.id} value={servicio.id}>
                  {getCategoriaIcon(servicio.categoria)} {servicio.nombre} - ${parseFloat(servicio.precioBase.toString()).toLocaleString()} ({servicio.duracionMinutos}min)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hora *</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">Selecciona una hora</option>
              {generateTimeSlots().map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label>Notas adicionales (opcional)</label>
            <textarea
              value={notasCliente}
              onChange={(e) => setNotasCliente(e.target.value)}
              placeholder="Instrucciones especiales, preferencias, etc."
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={createCita.isPending}
          >
            {createCita.isPending ? 'Reservando...' : '📅 Reservar Cita'}
          </button>
        </div>
      </form>

      {/* Información de barberos */}
      <div className="section-header" style={{ marginTop: '3rem' }}>
        <h2 className="section-title">👨‍💼 Nuestros Barberos</h2>
      </div>

      {barberos && barberos.length === 0 ? (
        <div className="empty-state">
          <p>👨‍💼 No hay barberos disponibles en este momento</p>
        </div>
      ) : (
        <div className="barberos-grid">
          {barberos?.map(barbero => (
            <div key={barbero.id} className="barbero-card">
              <div className="barbero-header">
                <h3>{barbero.nombre}</h3>
                <span className={`availability-badge ${barbero.disponible ? 'available' : 'unavailable'}`}>
                  {barbero.disponible ? '✅ Disponible' : '🚫 No disponible'}
                </span>
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

                {barbero.biografia && (
                  <p className="biografia">
                    <strong>Sobre mí:</strong> {barbero.biografia}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}