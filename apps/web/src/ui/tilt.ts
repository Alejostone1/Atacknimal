import type { PointerEvent } from 'react';

/** Inclinación máxima de una carta bajo el ratón, en grados. */
const MAX_TILT_DEG = 8;

/** El usuario pidió menos movimiento (ajuste de la app o del sistema). */
export function prefersReducedMotion(): boolean {
  const setting = document.documentElement.dataset['motion'];
  if (setting === 'reduce') return true;
  if (setting === 'full') return false;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Inclinación 3D y brillo que siguen al ratón. Escribe variables CSS en el propio elemento
 * (--rx, --ry, --mx, --my) sin pasar por el estado de React. En pantallas táctiles no hace nada:
 * allí la respuesta es la pulsación (:active).
 */
export const tiltHandlers = {
  onPointerMove(event: PointerEvent<HTMLElement>): void {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--ry', `${((x - 0.5) * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - y) * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  },
  onPointerLeave(event: PointerEvent<HTMLElement>): void {
    const el = event.currentTarget;
    for (const name of ['--rx', '--ry', '--mx', '--my']) el.style.removeProperty(name);
  },
};
