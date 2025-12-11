import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

type Barbero = {
  id: string;
  nombre: string;
  anosExperiencia?: number;
  biografia?: string;
  disponible: boolean;
  imagenPerfil?: string;
  usuario: {
    telefono?: string;
  };
};

export default function BarberosReadOnly() {
  const { data: barberos, isLoading } = useQuery<Barbero[]>({
    queryKey: ['barberos'],
    queryFn: async () => (await api.get('/barberos')).data,
  });

  if (isLoading) return <div className="loading">Cargando barberos...</div>;

  return (
    <div className="barberos-readonly">
      <div className="section-header">
        <h2>👨‍💼 Nuestros Barberos</h2>
        <p>Conoce a nuestro equipo profesional</p>
      </div>

      {!barberos?.length ? (
        <div className="empty-state">
          <p>No hay barberos disponibles en este momento.</p>
        </div>
      ) : (
        <div className="barberos-grid">
          {barberos.map((barbero) => (
            <div key={barbero.id} className="barbero-card">
              <div className="barbero-avatar">
                {barbero.imagenPerfil ? (
                  <img src={barbero.imagenPerfil} alt={barbero.nombre} />
                ) : (
                  <div className="avatar-placeholder">👨‍💼</div>
                )}
              </div>
              
              <div className="barbero-info">
                <h3>{barbero.nombre}</h3>
                
                {barbero.anosExperiencia && (
                  <div className="experiencia">
                    <span className="experience-badge">
                      {barbero.anosExperiencia} año{barbero.anosExperiencia !== 1 ? 's' : ''} de experiencia
                    </span>
                  </div>
                )}
                
                {barbero.biografia && (
                  <p className="biografia">{barbero.biografia}</p>
                )}
                
                {barbero.usuario.telefono && (
                  <div className="contact-info">
                    <span>📞 {barbero.usuario.telefono}</span>
                  </div>
                )}
                
                <div className="availability">
                  <span className={`status-badge ${barbero.disponible ? 'available' : 'unavailable'}`}>
                    {barbero.disponible ? '✅ Disponible' : '❌ No disponible'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .barberos-readonly {
          padding: 1rem;
        }

        .section-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .section-header h2 {
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .section-header p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .barberos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .barbero-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .barbero-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .barbero-avatar {
          text-align: center;
          margin-bottom: 1rem;
        }

        .barbero-avatar img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto;
        }

        .barbero-info h3 {
          text-align: center;
          color: #1f2937;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .experiencia {
          text-align: center;
          margin-bottom: 1rem;
        }

        .experience-badge {
          background: #ddd6fe;
          color: #7c3aed;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .biografia {
          color: #4b5563;
          line-height: 1.5;
          margin-bottom: 1rem;
          text-align: center;
          font-style: italic;
        }

        .contact-info {
          text-align: center;
          margin-bottom: 1rem;
          color: #6b7280;
        }

        .availability {
          text-align: center;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .status-badge.available {
          background: #dcfce7;
          color: #15803d;
        }

        .status-badge.unavailable {
          background: #fef2f2;
          color: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}