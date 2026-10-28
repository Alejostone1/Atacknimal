// Solo el subconjunto latino (cubre el español): sin cirílico ni vietnamita en el build.
// Sin extensión: los paquetes de fontsource mapean "./*" a "./*.css".
import '@fontsource/barlow/latin-400';
import '@fontsource/barlow/latin-400-italic';
import '@fontsource/barlow/latin-500';
import '@fontsource/barlow/latin-600';
import '@fontsource/big-shoulders-display/latin-700';
import '@fontsource/big-shoulders-display/latin-800';
import '@fontsource/big-shoulders-display/latin-900';
import '@fontsource/ibm-plex-mono/latin-400';
import '@fontsource/ibm-plex-mono/latin-500';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.tsx';

const root = document.getElementById('root');
if (root === null) throw new Error('Falta el elemento #root en index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
