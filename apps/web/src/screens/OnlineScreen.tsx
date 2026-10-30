import {
  nicknameSchema,
  roomCodeSchema,
  type CloseReason,
  type RoomMode,
  type RoomPlayer,
  type RoomState,
} from '@atacknimal/protocol';
import { ArrowLeftRight, EyeOff, Hourglass, TriangleAlert, Wifi, WifiOff } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { RoomShare } from '../components/RoomShare.tsx';
import { Screen } from '../components/Screen.tsx';
import { TeamSlots } from '../components/TeamSlots.tsx';
import { BALANCE, findEntry } from '../content/catalog.ts';
import { useMatch } from '../game/matchStore.ts';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  linkIsLocalOnly,
  lookupRoom,
  roomLink,
  type RoomLookup,
  selectTeam,
  switchTeam,
  useRoom,
} from '../game/online.ts';
import { DUO_SIZE, useMatchSetup, useSettings } from '../state/stores.ts';
import { isTeamComplete } from '../state/team.ts';
import { cx } from '../ui/cx.ts';
import styles from './OnlineScreen.module.css';

type EntryMode = 'crear' | 'unirse';

const MODE_LABEL: Readonly<Record<RoomMode, string>> = { '1v1': '1 vs 1', '2v2': '2 vs 2' };

const CLOSE_REASON: Readonly<Record<CloseReason, string>> = {
  abandoned: 'alguien salió antes de empezar la partida.',
  expired: 'nadie la completó a tiempo.',
  'team-select-timeout': 'alguien no confirmó su equipo a tiempo.',
};

/** Cuenta atrás en minutos y segundos. Se monta de nuevo (`key`) con cada dato del servidor. */
function Countdown({ ms }: { ms: number }) {
  const [deadline] = useState(() => Date.now() + ms);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const left = Math.max(0, Math.ceil((deadline - now) / 1000));
  const minutes = Math.floor(left / 60);
  const seconds = String(left % 60).padStart(2, '0');
  return <span className="mono">{`${String(minutes)}:${seconds}`}</span>;
}

/** Lo que se sabe de una sala antes de entrar, al abrir su enlace o su QR. */
function RoomPreview({ code }: { code: string }) {
  const [lookup, setLookup] = useState<RoomLookup | null>(null);
  useEffect(() => {
    let active = true;
    void lookupRoom(code).then((result) => {
      if (active) setLookup(result);
    });
    return () => {
      active = false;
    };
  }, [code]);

  if (lookup === null) {
    return (
      <p className={styles.notice} role="status">
        Buscando la sala {code}… Si tarda, el servidor se está despertando (hasta un minuto).
      </p>
    );
  }
  if (lookup.kind === 'not-found') {
    return (
      <p className={styles.error} role="alert">
        La sala {code} ya no existe: caducó o se cerró. Pide un código nuevo o crea tu propia sala.
      </p>
    );
  }
  if (lookup.kind === 'error') {
    return (
      <p className={styles.error} role="alert">
        No se pudo consultar la sala. Comprueba tu conexión e inténtalo de nuevo.
      </p>
    );
  }
  const { room } = lookup;
  return (
    <p className={room.joinable ? styles.notice : styles.error} role="status">
      Sala {room.code} · {MODE_LABEL[room.mode]} · {room.players}/{room.capacity} jugadores
      {room.joinable ? '. ¡Hay sitio!' : '. Ya empezó o está completa.'}
    </p>
  );
}

/** Sala online (1 vs 1 o 2 vs 2): crear o unirse con código, esperar y confirmar equipo. */
export function OnlineScreen() {
  const { code: linkCode } = useParams();
  const [params] = useSearchParams();
  const room = useRoom((s) => s.room);
  const hasView = useMatch((s) => s.view !== null);
  const navigate = useNavigate();

  // Cuando el servidor da la partida por empezada, se pasa al combate.
  const started = room !== null && room.status !== 'closed' && room.status !== 'waiting';
  const inMatch = started && room.status !== 'team-select' && hasView;
  useEffect(() => {
    if (inMatch) void navigate('/partida');
  }, [inMatch, navigate]);

  if (room === null) {
    const mode: EntryMode =
      linkCode !== undefined || params.get('modo') === 'unirse' ? 'unirse' : 'crear';
    return <RoomEntry key={mode} initialMode={mode} initialCode={linkCode ?? ''} />;
  }
  return <RoomLobby room={room} />;
}

function RoomEntry({ initialMode, initialCode }: { initialMode: EntryMode; initialCode: string }) {
  const { nickname, setNickname } = useSettings();
  const [mode, setMode] = useState<EntryMode>(initialMode);
  const [roomMode, setRoomMode] = useState<RoomMode>('1v1');
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<void> => {
    // Las mismas reglas que aplica el servidor (paquete protocol), para avisar antes de enviar.
    const name = nicknameSchema.safeParse(nickname);
    if (!name.success) {
      setError(name.error.issues[0]?.message ?? 'Apodo inválido');
      return;
    }
    const roomCode = roomCodeSchema.safeParse(code);
    if (mode === 'unirse' && !roomCode.success) {
      setError('El código tiene 6 caracteres, por ejemplo 7F3K2J.');
      return;
    }
    setBusy(true);
    setError(null);
    const response =
      mode === 'crear'
        ? await createRoom(name.data, roomMode)
        : await joinRoom(roomCode.data ?? '', name.data);
    setBusy(false);
    if (!response.ok) setError(response.error.message);
  };

  return (
    <Screen
      title={mode === 'crear' ? 'Crear sala' : 'Unirse a una sala'}
      eyebrow="Online"
      back="/"
      footer={
        <button
          type="submit"
          form="room-entry"
          className="btn btn--primary btn--block"
          disabled={busy}
        >
          {busy ? 'Conectando…' : mode === 'crear' ? 'Crear sala' : 'Entrar en la sala'}
        </button>
      }
    >
      {initialCode !== '' && mode === 'unirse' && <RoomPreview code={initialCode} />}
      <form
        id="room-entry"
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className={styles.tabs} role="tablist" aria-label="Cómo quieres jugar">
          {(['crear', 'unirse'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={mode === option}
              className={styles.tab}
              onClick={() => {
                setMode(option);
                setError(null);
              }}
            >
              {option === 'crear' ? 'Crear sala' : 'Tengo un código'}
            </button>
          ))}
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Tu apodo</span>
          <input
            className={styles.input}
            value={nickname}
            maxLength={20}
            placeholder="Cómo te verán los demás"
            autoComplete="nickname"
            required
            onChange={(event) => {
              setNickname(event.target.value);
            }}
          />
        </label>

        {mode === 'crear' ? (
          <fieldset className={styles.field}>
            <legend className={styles.label}>Modo</legend>
            <div className={styles.tabs} role="radiogroup" aria-label="Modo de juego">
              {(['1v1', '2v2'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={roomMode === option}
                  className={styles.tab}
                  onClick={() => {
                    setRoomMode(option);
                  }}
                >
                  {MODE_LABEL[option]}
                </button>
              ))}
            </div>
          </fieldset>
        ) : (
          <label className={styles.field}>
            <span className={styles.label}>Código de la sala</span>
            <input
              className={cx(styles.input, styles.codeInput)}
              value={code}
              maxLength={6}
              placeholder="7F3K2J"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              required
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
              }}
            />
          </label>
        )}

        <p className={styles.help}>
          {mode === 'unirse'
            ? 'Pide el código a quien creó la sala.'
            : roomMode === '2v2'
              ? 'Dos equipos de dos: cada jugador aporta 2 animales. Comparte el código con los otros tres.'
              : 'Recibirás un código de 6 caracteres para compartir con tu rival.'}
        </p>
        {error !== null && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </Screen>
  );
}

function PlayerRow({ player, status }: { player: RoomPlayer; status: RoomState['status'] }) {
  return (
    <m.li
      layout
      className={cx(styles.player, styles.joined)}
      initial={{ opacity: 0, x: -40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      {player.connected ? (
        <Wifi size={18} aria-label="Conectado" />
      ) : (
        <WifiOff size={18} aria-label="Desconectado" />
      )}
      <span className={styles.nickname}>
        {player.nickname}
        {player.isYou && <span className={styles.you}> (tú)</span>}
      </span>
      <span className={styles.state}>
        {status === 'waiting'
          ? 'En la sala'
          : player.teamConfirmed
            ? 'Equipo listo'
            : 'Eligiendo equipo'}
      </span>
    </m.li>
  );
}

function RoomLobby({ room }: { room: RoomState }) {
  const connection = useRoom((s) => s.connection);
  const { team, duo } = useMatchSetup();
  const view = useMatch((s) => s.view);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const duoMode = room.mode === '2v2';
  const size = duoMode ? DUO_SIZE : BALANCE.ruleset.teamSize;
  const picks = duoMode ? duo : team;
  const complete = isTeamComplete(picks, size);
  const capacity = duoMode ? 4 : 2;
  const perTeam = capacity / 2;
  const me = room.players.find((p) => p.isYou);
  const partner = room.players.find((p) => !p.isYou && p.team === me?.team);
  const others = room.players.filter((p) => !p.isYou);

  // Animales que ya confirmó tu compañero: no se pueden repetir dentro del equipo (#020).
  const partnerAnimals =
    view === null || partner === undefined
      ? []
      : (view.players.find((p) => p.id === partner.playerId)?.cardIds ?? []).flatMap((id) => {
          const animalId = view.cards[id]?.animalId;
          return animalId === undefined ? [] : [animalId];
        });
  const clash = picks.filter((id) => partnerAnimals.includes(id));

  const exit = async (): Promise<void> => {
    await leaveRoom();
    void navigate('/');
  };

  const waitingFor = others.filter((p) => !p.teamConfirmed).map((p) => p.nickname);
  const link = roomLink(room.code);
  const localOnly = linkIsLocalOnly(room.code);

  return (
    <Screen
      title={`Sala ${room.code}`}
      eyebrow={`Online · ${MODE_LABEL[room.mode]}`}
      footer={
        <div className={styles.actions}>
          {room.status === 'team-select' && me?.teamConfirmed !== true && (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!complete || clash.length > 0}
              onClick={() => {
                void selectTeam(picks).then((response) => {
                  setError(response.ok ? null : response.error.message);
                });
              }}
            >
              {complete ? 'Confirmar equipo' : `Elige ${String(size)} animales`}
            </button>
          )}
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => {
              void exit();
            }}
          >
            {room.status === 'closed' ? 'Volver al inicio' : 'Salir de la sala'}
          </button>
        </div>
      }
    >
      <div className={styles.lobby}>
        {room.status === 'closed' ? (
          <p className={styles.notice} role="status">
            La sala se cerró: {CLOSE_REASON[room.closeReason ?? 'abandoned']}
          </p>
        ) : (
          <>
            <RoomShare
              code={room.code}
              mode={room.mode}
              link={link}
              waiting={room.status === 'waiting'}
            >
              {localOnly && (
                <p className={styles.help}>
                  <TriangleAlert size={16} aria-hidden="true" />
                  Este enlace apunta a este equipo (localhost) y no funcionará en otro dispositivo.
                  Para probar con el celular, abre la web con la IP de tu PC o define
                  VITE_PUBLIC_APP_URL.
                </p>
              )}
              {room.phaseEndsInMs !== null && (
                <p className={styles.help}>
                  <Hourglass size={16} aria-hidden="true" />
                  {room.status === 'waiting' ? 'La sala caduca en ' : 'Quedan '}
                  <Countdown
                    key={`${room.status}-${String(room.phaseEndsInMs)}`}
                    ms={room.phaseEndsInMs}
                  />
                  {room.status === 'waiting' ? ' si no se llena.' : ' para confirmar los equipos.'}
                </p>
              )}
            </RoomShare>

            <section aria-labelledby="players-title">
              <h2 id="players-title" className={styles.label}>
                Jugadores · {room.players.length}/{capacity}
              </h2>
              <div className={duoMode ? styles.teams : undefined}>
                {(['A', 'B'] as const).map((teamId) => {
                  const members = room.players.filter((p) => p.team === teamId);
                  const empty = perTeam - members.length;
                  return (
                    <div key={teamId}>
                      {duoMode && (
                        <h3 className={styles.teamName}>
                          Equipo {teamId}
                          {me?.team === teamId && <span className={styles.you}> (el tuyo)</span>}
                        </h3>
                      )}
                      <ul className={styles.players}>
                        <AnimatePresence initial={false}>
                          {members.map((player) => (
                            <PlayerRow key={player.playerId} player={player} status={room.status} />
                          ))}
                        </AnimatePresence>
                        {Array.from({ length: empty }, (_, i) => (
                          <li
                            key={`libre-${String(i)}`}
                            className={cx(styles.player, styles.empty)}
                          >
                            {duoMode ? 'Asiento libre' : 'Esperando rival'}
                            <span className={styles.dots} aria-hidden="true">
                              <span />
                              <span />
                              <span />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {duoMode && room.status === 'waiting' && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    void switchTeam().then((response) => {
                      setError(response.ok ? null : response.error.message);
                    });
                  }}
                >
                  <ArrowLeftRight size={18} aria-hidden="true" /> Cambiar de equipo
                </button>
              )}
            </section>

            {room.status === 'team-select' && (
              <section className={styles.team} aria-labelledby="team-title">
                <div className={styles.row}>
                  <h2 id="team-title" className={styles.label}>
                    {duoMode ? 'Tus 2 animales' : 'Tu equipo'}
                  </h2>
                  {me?.teamConfirmed !== true && (
                    <Link
                      to={`/jugar/equipo?volver=${duoMode ? 'sala2' : 'sala'}`}
                      className={styles.edit}
                    >
                      {picks.length > 0 ? 'Cambiar' : 'Elegir'}
                    </Link>
                  )}
                </div>
                <TeamSlots team={picks} size={size} />
                {duoMode && partner !== undefined && (
                  <p className={styles.help}>
                    {partnerAnimals.length > 0
                      ? `${partner.nickname} lleva: ${partnerAnimals.map((id) => findEntry(id)?.name ?? id).join(' y ')}.`
                      : `${partner.nickname} aún no ha confirmado sus animales.`}
                  </p>
                )}
                {clash.length > 0 && (
                  <p className={styles.error} role="alert">
                    Tu compañero ya lleva {clash.map((id) => findEntry(id)?.name ?? id).join(' y ')}
                    . Un equipo no puede repetir animales: cámbialo.
                  </p>
                )}
                <p className={styles.help}>
                  <EyeOff size={16} aria-hidden="true" />
                  {me?.teamConfirmed === true
                    ? `Confirmado. Esperando a ${waitingFor.join(', ') || 'los demás'}…`
                    : 'Los rivales no verán tus animales hasta que entren en combate.'}
                </p>
              </section>
            )}
          </>
        )}

        {connection === 'offline' && (
          <p className={styles.error} role="alert">
            Sin conexión con el servidor. Reconectando…
          </p>
        )}
        {error !== null && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </Screen>
  );
}
