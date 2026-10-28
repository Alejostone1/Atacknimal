import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router';
import { AnimalScreen } from '../screens/AnimalScreen.tsx';
import { CollectionScreen } from '../screens/CollectionScreen.tsx';
import { CreditsScreen } from '../screens/CreditsScreen.tsx';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { hasActiveRoom } from '../game/session.ts';
import { NotFoundScreen } from '../screens/NotFoundScreen.tsx';
import { PlayScreen } from '../screens/PlayScreen.tsx';
import { ReadyScreen } from '../screens/ReadyScreen.tsx';
import { SettingsScreen } from '../screens/SettingsScreen.tsx';
import { TeamSelectScreen } from '../screens/TeamSelectScreen.tsx';
import { useSettings } from '../state/stores.ts';

/** La partida incluye Phaser: se descarga solo al entrar en ella. */
const MatchScreen = lazy(() => import('../match/MatchScreen.tsx'));
/** La sala online incluye el cliente Socket.IO: tampoco pesa en la carga inicial. */
const OnlineScreen = lazy(() =>
  import('../screens/OnlineScreen.tsx').then((m) => ({ default: m.OnlineScreen })),
);

function Loading({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Suspense fallback={<p style={{ padding: 'var(--s-6) var(--gutter)' }}>{label}</p>}>
      {children}
    </Suspense>
  );
}

/** Raíz común: restaura el scroll, aplica la preferencia de animaciones y retoma la sala online. */
function Root() {
  const motion = useSettings((state) => state.motion);
  useEffect(() => {
    document.documentElement.dataset['motion'] = motion;
  }, [motion]);
  // Si esta pestaña estaba en una sala online (por ejemplo, tras recargar), vuelve a ella.
  useEffect(() => {
    if (hasActiveRoom()) {
      void import('../game/online.ts').then((online) => {
        online.resumeOnline();
      });
    }
  }, []);
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <HomeScreen /> },
      { path: '/jugar', element: <PlayScreen /> },
      { path: '/jugar/equipo', element: <TeamSelectScreen /> },
      { path: '/jugar/listo', element: <ReadyScreen /> },
      {
        path: '/sala',
        element: (
          <Loading label="Conectando…">
            <OnlineScreen />
          </Loading>
        ),
      },
      {
        path: '/sala/:code',
        element: (
          <Loading label="Conectando…">
            <OnlineScreen />
          </Loading>
        ),
      },
      {
        path: '/partida',
        element: (
          <Loading label="Preparando el duelo…">
            <MatchScreen />
          </Loading>
        ),
      },
      { path: '/coleccion', element: <CollectionScreen /> },
      { path: '/coleccion/:animalId', element: <AnimalScreen /> },
      { path: '/creditos', element: <CreditsScreen /> },
      { path: '/ajustes', element: <SettingsScreen /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
