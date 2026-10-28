import { useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router';
import { AnimalScreen } from '../screens/AnimalScreen.tsx';
import { CollectionScreen } from '../screens/CollectionScreen.tsx';
import { CreditsScreen } from '../screens/CreditsScreen.tsx';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { NotFoundScreen } from '../screens/NotFoundScreen.tsx';
import { PlayScreen } from '../screens/PlayScreen.tsx';
import { ReadyScreen } from '../screens/ReadyScreen.tsx';
import { SettingsScreen } from '../screens/SettingsScreen.tsx';
import { TeamSelectScreen } from '../screens/TeamSelectScreen.tsx';
import { useSettings } from '../state/stores.ts';

/** Raíz común: restaura el scroll y aplica la preferencia de animaciones al documento. */
function Root() {
  const motion = useSettings((state) => state.motion);
  useEffect(() => {
    document.documentElement.dataset['motion'] = motion;
  }, [motion]);
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
