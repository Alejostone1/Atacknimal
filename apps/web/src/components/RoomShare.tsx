import type { RoomMode } from '@atacknimal/protocol';
import { Check, Copy, Share2 } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { RoomQr } from './RoomQr.tsx';
import styles from './RoomShare.module.css';

const MODE_LABEL: Readonly<Record<RoomMode, string>> = { '1v1': '1 vs 1', '2v2': '2 vs 2' };

interface RoomShareProps {
  code: string;
  mode: RoomMode;
  link: string;
  /** La sala espera jugadores: se muestra el QR con su radar. */
  waiting: boolean;
  /** Avisos bajo los botones (caducidad, enlace local…). */
  children?: ReactNode;
}

/**
 * Tarjeta para invitar: el código cae letra a letra, el QR entra con un giro dentro de un marco
 * con esquinas de visor y una línea que lo recorre, y unas ondas de radar indican que la sala
 * busca jugadores. Al llenarse, el QR se retira y queda solo el código.
 */
export function RoomShare({ code, mode, link, waiting, children }: RoomShareProps) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator.share === 'function';

  return (
    <m.section
      className={styles.card}
      aria-labelledby="share-title"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <h2 id="share-title" className={styles.label}>
        Código de la sala
      </h2>
      <p className={styles.code} aria-label={code}>
        {Array.from(code, (char, i) => (
          <m.span
            key={`${String(i)}-${char}`}
            aria-hidden="true"
            initial={{ opacity: 0, y: -28, rotateX: 90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.15 + i * 0.07 }}
          >
            {char}
          </m.span>
        ))}
      </p>

      <AnimatePresence initial={true}>
        {waiting && (
          <m.div
            key="qr"
            className={styles.qrZone}
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.45 }}
          >
            <span className={styles.radar} aria-hidden="true" />
            <span className={styles.radar} aria-hidden="true" />
            <span className={styles.radar} aria-hidden="true" />
            <div className={styles.qr}>
              <RoomQr url={link} label={`Código QR para entrar en la sala ${code}`} />
              <span className={styles.scan} aria-hidden="true" />
              <span className={styles.corners} aria-hidden="true" />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <p className={styles.hint}>
        {waiting
          ? `Escanea el QR o comparte el enlace · ${MODE_LABEL[mode]}`
          : '¡Sala completa! A elegir equipo.'}
      </p>

      <div className={styles.buttons}>
        <m.button
          type="button"
          className="btn btn--ghost"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            void navigator.clipboard.writeText(link).then(() => {
              setCopied(true);
            });
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={copied ? 'copied' : 'copy'}
              className={styles.icon}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              {copied ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Copy size={18} aria-hidden="true" />
              )}
            </m.span>
          </AnimatePresence>
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </m.button>
        {canShare && (
          <m.button
            type="button"
            className="btn btn--primary"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              void navigator
                .share({
                  title: 'ATACKNIMAL',
                  text: `Únete a mi sala ${MODE_LABEL[mode]} de ATACKNIMAL: ${code}`,
                  url: link,
                })
                .catch(() => {
                  // Compartir cancelado por el usuario: no es un error.
                });
            }}
          >
            <Share2 size={18} aria-hidden="true" /> Compartir
          </m.button>
        )}
      </div>
      {children}
    </m.section>
  );
}
