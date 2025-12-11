import { useState } from 'react';
import ServiciosManagement from './components/ServiciosManagement';
import BarberosManagement from './components/BarberosManagement';
import CitasManagement from './components/CitasManagement';
import ClienteView from './components/ClienteView';
import BarberoView from './components/BarberoView';
import BarberosReadOnly from './components/BarberosReadOnly';
import './Dashboard.css';

type User = {
  id: string;
  email: string;
  nombreCompleto: string;
  rol: 'ADMIN' | 'BARBERO' | 'CLIENTE';
};

type Props = {
  user: User;
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: Props) {
  const [activeSection, setActiveSection] = useState(() => {
    if (user.rol === 'ADMIN') return 'servicios';
    if (user.rol === 'BARBERO') return 'mis-servicios';
    return 'reservar'; // CLIENTE
  });

  const renderNavigation = () => {
    if (user.rol === 'ADMIN') {
      return (
        <nav className="dashboard-nav">
          <button
            className={activeSection === 'servicios' ? 'active' : ''}
            onClick={() => setActiveSection('servicios')}
          >
            ⚙️ Servicios
          </button>
          <button
            className={activeSection === 'barberos' ? 'active' : ''}
            onClick={() => setActiveSection('barberos')}
          >
            👨‍💼 Barberos
          </button>
          <button
            className={activeSection === 'citas' ? 'active' : ''}
            onClick={() => setActiveSection('citas')}
          >
            📅 Todas las Citas
          </button>
        </nav>
      );
    }

    if (user.rol === 'BARBERO') {
      return (
        <nav className="dashboard-nav">
          <button
            className={activeSection === 'mis-citas' ? 'active' : ''}
            onClick={() => setActiveSection('mis-citas')}
          >
            📅 Mis Citas
          </button>
          <button
            className={activeSection === 'mis-servicios' ? 'active' : ''}
            onClick={() => setActiveSection('mis-servicios')}
          >
            ⚙️ Mis Servicios
          </button>
          <button
            className={activeSection === 'mi-horario' ? 'active' : ''}
            onClick={() => setActiveSection('mi-horario')}
          >
            🕒 Mi Horario
          </button>
        </nav>
      );
    }

    // CLIENTE
    return (
      <nav className="dashboard-nav">
        <button
          className={activeSection === 'reservar' ? 'active' : ''}
          onClick={() => setActiveSection('reservar')}
        >
          📅 Reservar Cita
        </button>
        <button
          className={activeSection === 'mis-reservas' ? 'active' : ''}
          onClick={() => setActiveSection('mis-reservas')}
        >
          📋 Mis Reservas
        </button>
        <button
          className={activeSection === 'barberos' ? 'active' : ''}
          onClick={() => setActiveSection('barberos')}
        >
          👨‍💼 Ver Barberos
        </button>
      </nav>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      // ADMIN
      case 'servicios':
        return <ServiciosManagement />;
      case 'barberos':
        if (user.rol === 'ADMIN') {
          return <BarberosManagement />;
        } else {
          // Para CLIENTE - vista de solo lectura
          return <BarberosReadOnly />;
        }
      case 'citas':
        return <CitasManagement userRole="ADMIN" userId={user.id} />;
      
      // BARBERO
      case 'mis-citas':
        return <BarberoView userId={user.id} />;
      case 'mis-servicios':
        return <ServiciosManagement />;
      case 'mi-horario':
        return <div className="coming-soon">🕒 Gestión de horarios - Próximamente</div>;
      
      // CLIENTE
      case 'reservar':
        return <ClienteView userId={user.id} />;
      case 'mis-reservas':
        return <CitasManagement userRole="CLIENTE" userId={user.id} />;
      
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'Administrador';
      case 'BARBERO': return 'Barbero';
      case 'CLIENTE': return 'Cliente';
      default: return rol;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>✂️ Barbería Modern Style</h1>
            <div className="user-info">
              <span className="welcome">Bienvenido, {user.nombreCompleto}</span>
              <span className="role-badge role-{user.rol.toLowerCase()}">
                {getRoleLabel(user.rol)}
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="logout-btn"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
        {renderNavigation()}
      </div>

      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
}