import { nicknameSchema, roomCodeSchema, type RoomState } from '@atacknimal/protocol';
import { Check, Copy, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { Screen } from '../components/Screen.tsx';
import { TeamSlots } from '../components/TeamSlots.tsx';
import { BALANCE } from '../content/catalog.ts';
import { useMatch } from '../game/matchStore.ts';
import { createRoom, joinRoom, leaveRoom, roomLink, selectTeam, useRoom } from '../game/online.ts';
import { useMatchSetup, useSettings } from '../state/stores.ts';
import { isTeamComplete } from '../state/team.ts';
import { cx } from '../ui/cx.ts';
import styles from './OnlineScreen.module.css';

type EntryMode = 'crear' | 'unirse';

/** Sala online 1 vs 1: crear o unirse con código, esperar al rival y confirmar equipo. */
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
        ? await createRoom(name.data)
        : await joinRoom(roomCode.data ?? '', name.data);
    setBusy(false);
    if (!response.ok) setError(response.error.message);
  };

  return (
    <Screen
      title={mode === 'crear' ? 'Crear sala' : 'Unirse a una sala'}
      eyebrow="Online · 1 vs 1"
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
            placeholder="Cómo te verá tu rival"
            autoComplete="nickname"
            required
            onChange={(event) => {
              setNickname(event.target.value);
            }}
          />
        </label>

        {mode === 'unirse' && (
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
          {mode === 'crear'
            ? 'Recibirás un código de 6 caracteres para compartir con tu rival.'
            : 'Pide el código a quien creó la sala.'}
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

function RoomLobby({ room }: { room: RoomState }) {
  const connection = useRoom((s) => s.connection);
  const team = useMatchSetup((s) => s.team);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const size = BALANCE.ruleset.teamSize;
  const complete = isTeamComplete(team, size);
  const me = room.players.find((p) => p.isYou);
  const rival = room.players.find((p) => !p.isYou);

  const exit = async (): Promise<void> => {
    await leaveRoom();
    void navigate('/');
  };

  return (
    <Screen
      title={`Sala ${room.code}`}
      eyebrow="Online · 1 vs 1"
      footer={
        <div className={styles.actions}>
          {room.status === 'team-select' && me?.teamConfirmed !== true && (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!complete}
              onClick={() => {
                void selectTeam(team).then((response) => {
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
      {room.status === 'closed' ? (
        <p className={styles.notice} role="status">
          La sala se cerró: {rival?.nickname ?? 'tu rival'} salió antes de empezar la partida.
        </p>
      ) : (
        <>
          <section className={styles.share} aria-labelledby="share-title">
            <h2 id="share-title" className={styles.label}>
              Código
            </h2>
            <p className={styles.code}>{room.code}</p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                void navigator.clipboard.writeText(roomLink(room.code)).then(() => {
                  setCopied(true);
                });
              }}
            >
              {copied ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Copy size={18} aria-hidden="true" />
              )}
              {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
          </section>

          <section aria-labelledby="players-title">
            <h2 id="players-title" className={styles.label}>
              Jugadores
            </h2>
            <ul className={styles.players}>
              {room.players.map((player) => (
                <li key={player.playerId} className={styles.player}>
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
                    {room.status === 'waiting'
                      ? 'En la sala'
                      : player.teamConfirmed
                        ? 'Equipo listo'
                        : 'Eligiendo equipo'}
                  </span>
                </li>
              ))}
              {rival === undefined && (
                <li className={cx(styles.player, styles.empty)}>Esperando rival…</li>
              )}
            </ul>
          </section>

          {room.status === 'team-select' && (
            <section className={styles.team} aria-labelledby="team-title">
              <div className={styles.row}>
                <h2 id="team-title" className={styles.label}>
                  Tu equipo
                </h2>
                {me?.teamConfirmed !== true && (
                  <Link to="/jugar/equipo?volver=sala" className={styles.edit}>
                    {team.length > 0 ? 'Cambiar' : 'Elegir'}
                  </Link>
                )}
              </div>
              <TeamSlots team={team} size={size} />
              <p className={styles.help}>
                <EyeOff size={16} aria-hidden="true" />
                {me?.teamConfirmed === true
                  ? `Equipo confirmado. Esperando a ${rival?.nickname ?? 'tu rival'}…`
                  : 'Tu rival no verá tus animales hasta que entren en combate.'}
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
    </Screen>
  );
}
