import { Link } from 'react-router';
import { Screen } from '../components/Screen.tsx';

export function NotFoundScreen() {
  return (
    <Screen title="Página no encontrada" back="/">
      <p style={{ color: 'var(--c-lichen)', marginBottom: 'var(--s-4)' }}>
        Esta dirección no existe. Puede que el enlace esté incompleto.
      </p>
      <Link to="/" className="btn btn--primary">
        Ir al inicio
      </Link>
    </Screen>
  );
}
