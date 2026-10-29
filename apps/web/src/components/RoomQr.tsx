import { useMemo } from 'react';
import { encode } from 'uqr';

/**
 * Código QR de un enlace, generado en el navegador (no se envía a ningún servicio externo).
 * Módulos oscuros sobre fondo claro siempre, también en el tema oscuro: así lo leen todas las
 * cámaras. Corrección de errores M (15 %) para tolerar reflejos de pantalla.
 */
export function RoomQr({ url, label }: { url: string; label: string }) {
  const { path, size } = useMemo(() => {
    const qr = encode(url, { ecc: 'M', border: 2 });
    // Un único trazado con un cuadrado por módulo oscuro: ligero y nítido a cualquier escala.
    const squares = qr.data.flatMap((row, y) =>
      row.flatMap((dark, x) => (dark ? [`M${String(x)} ${String(y)}h1v1h-1z`] : [])),
    );
    return { path: squares.join(''), size: qr.size };
  }, [url]);

  return (
    <svg
      viewBox={`0 0 ${String(size)} ${String(size)}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      style={{ display: 'block', width: '100%', height: 'auto', background: '#ffffff' }}
    >
      <path d={path} fill="#0e1411" />
    </svg>
  );
}
