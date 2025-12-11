import Dashboard from './Dashboard';

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

export default function App({ user, onLogout }: Props) {
  return <Dashboard user={user} onLogout={onLogout} />;
}
