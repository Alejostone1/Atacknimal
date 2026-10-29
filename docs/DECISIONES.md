# ATACKNIMAL · Registro de decisiones

Las alternativas y el razonamiento de cada decisión están en [00-ANALISIS-FASE-0.md](00-ANALISIS-FASE-0.md) §E.
Cambiar una decisión aceptada exige una entrada nueva aquí que la sustituya; no se reescribe el historial.

| # | Tema | Decisión | Estado | Fecha | Dónde se aplica |
|---|---|---|---|---|---|
| 001 | Fuente de estadísticas | Regenerar con un sistema de presupuesto; las tablas del material sirven como referencia de identidad | ✅ Aceptada | 2026-10-28 | BALANCE §2–3 |
| 002 | León y animales del arte | Roster de 11 para el MVP; León, un arborícola y otra ave en 🧪 Expansiones | ✅ Aceptada | 2026-10-28 | BALANCE §3 |
| 003 | Fórmula de daño | `clamp(round(base + k × margen), min, max)`, parametrizada | ✅ Aceptada | 2026-10-28 | GAME_RULES §7.2 |
| 004 | Pierde el atacante | Contraataque del 50 % del daño | ✅ Aceptada | 2026-10-28 | GAME_RULES §7.3 |
| 005 | Empates | Sin daño, se consume el duelo | ✅ Aceptada | 2026-10-28 | GAME_RULES §7.1 |
| 006 | Modelo de hábitat | Afinidad aditiva simétrica (+10 / +4 / 0 / −15) | ✅ Aceptada | 2026-10-28 | GAME_RULES §6, BALANCE §4 |
| 007 | Hábitat libre | Cualquier animal puede luchar en cualquier hábitat | ✅ Aceptada | 2026-10-28 | GAME_RULES §5.1 |
| 008 | Bloqueo | 1 participación, afecta a atacante y defensor, parametrizado | ✅ Aceptada | 2026-10-28 | GAME_RULES §8 |
| 009 | Sin defensa legal | Defensa forzada con valor 0; el defensor elige la carta | ✅ Aceptada | 2026-10-28 | GAME_RULES §5.3 |
| 010 | Habilidades | Sistema guiado por datos; desactivadas en v0.1; efectos tácticos evaluados uno a uno | ✅ Aceptada | 2026-10-28 | GAME_RULES §15, BALANCE §6 |
| 011 | Rareza | Sin rareza en el MVP; futuro significado = complejidad | ✅ Aceptada | 2026-10-28 | BALANCE §10 |
| 012 | Vitalidad | 100 para todos (`baseHp` en el modelo de datos) | ✅ Aceptada | 2026-10-28 | GAME_RULES §3.2 |
| 013 | Orden 1v1 | Alternancia estricta, primer atacante sorteado | ✅ Aceptada | 2026-10-28 | GAME_RULES §9.1 |
| 014 | Bloqueos rivales | Públicos | ✅ Aceptada | 2026-10-28 | GAME_RULES §11 |
| 015 | 2v2: cartas | 2 cartas por jugador; defiende el designado; relevo si no tiene cartas activas | ✅ Aceptada | 2026-10-28 | GAME_RULES §9.2 |
| 016 | 2v2: jugador sin cartas | Asesor con marcadores; sus turnos se saltan | ✅ Aceptada | 2026-10-28 | GAME_RULES §9.2 |
| 017 | Duración máxima | 30 duelos; desempate por cartas activas y después por vitalidad | ✅ Aceptada | 2026-10-28 | GAME_RULES §10.2 |
| 018 | Cuentas | Invitado con apodo en el MVP; 🔒 autenticación pendiente | ✅ Aceptada | 2026-10-28 | ARCHITECTURE (Fase 2) |
| 019 | IA atacante | Misma política por niveles para atacar y defender | ✅ Aceptada | 2026-10-28 | GAME_RULES §12 |
| 020 | Repeticiones | Sin repetidos en un equipo; espejo permitido | ✅ Aceptada | 2026-10-28 | GAME_RULES §3.1 |
| 021 | Valores > 100 | Permitidos; la escala 1–100 es la base | ✅ Aceptada | 2026-10-28 | GAME_RULES §6 |
| 022 | Tiempos online | 30 s / 20 s, IA Fácil al agotarse, 60 s de gracia | ✅ Aceptada | 2026-10-28 | GAME_RULES §16 |
| 023 | Herramientas | npm workspaces, Vite, Fastify + Socket.IO, Drizzle, Zod, Vitest | ✅ Aceptada | 2026-10-28 | ARCHITECTURE (Fase 2) |
| 024 | Ajustes al plan | Balance inicial en la Fase 4, IA básica antes del MVP, salas + 1v1 juntas en la Fase 8 | ✅ Aceptada | 2026-10-28 | ROADMAP (Fase 2) |

## Detalles derivados pendientes de revisión

Decisiones menores tomadas al cerrar la especificación de la Fase 1. Se consideran vigentes salvo objeción: ver [GAME_RULES.md](GAME_RULES.md) §19 (D-01 a D-09) y la corrección del objetivo de duración en [BALANCE.md](BALANCE.md) §5.2.

## ⚠️ Decisiones pendientes tras la primera simulación (Fase 4a)

Datos en [BALANCE.md](BALANCE.md) §12.

### DECISIÓN PENDIENTE #025: el atacante gana el 92 % de los duelos

**Problema:** el atacante elige hábitat, carta y atributo viendo el equipo rival completo, y casi siempre encuentra una debilidad. La información oculta pierde su función y el primer jugador gana el 62 %.

- **A. Ventaja defensiva fija** (+X al valor del defensor). Es simple, pero según la tabla de márgenes necesita un +25 para llegar al objetivo. Eso aplana los perfiles: un defensor mediocre ganaría a picos.
- **B. Agotamiento de atributos del atacante:** el atributo con el que ataca un jugador queda bloqueado **para todo su equipo** durante sus próximos N ataques. No toca la regla central y obliga a salir de las combinaciones óptimas.
- **C. Hábitat sin repetir:** un jugador no puede declarar el mismo hábitat en dos ataques seguidos. Recorta las opciones de los especialistas de un hábitat (también ayuda con P-3).
- **D. Atributos enfrentados:** el defensor compara un atributo **opuesto** (Ataque contra Defensa, Velocidad contra Percepción…). Cambia la regla central y la información oculta pasaría a importar, pero es un rediseño grande.

**Recomendación:** implementar A, B y C como parámetros desactivados por defecto, simular combinaciones (por ejemplo, B + C + A con +5 o +10) y elegir la más simple que deje al atacante entre el 55 % y el 62 %. D queda en reserva si B y C no bastan. Ninguna opción cambia la regla fundamental (hábitat → carta → atributo; el defensor solo conoce hábitat y atributo).

### DECISIÓN PENDIENTE #026: Águila en Aire

- **A.** Que los animales no voladores pasen de Hostil a **Neutral** en Aire. El Águila queda con +10 relativos, como cualquier nativo en su hábitat.
- **B.** Rebajar el modificador Hostil global de −15 a −10. Afecta a todos los hábitats.
- **C.** Mantener el Aire y bajar las estadísticas del Águila. No ataca la causa.

**Recomendación: A**, en una versión de balance 0.2.0. Es coherente con "Aire = altura y espacio abierto", donde un mamífero no está en su elemento pero tampoco es imposible.

### DECISIÓN PENDIENTE #027: orden de ajustes

**Recomendación:** primero #025 (estructura), después #026 (Aire) y por último el ajuste fino de Ballena, Lobo, Tiburón y empates. Cada paso en una versión de balance nueva, con su informe comparativo.

### Resultado de #025: candidatas A, B y C descartadas por datos (2026-10-28)

Ninguna combinación alcanza el criterio acordado. Ver [BALANCE.md](BALANCE.md) §12.5. Los parámetros quedan en el motor **desactivados** (valor 0) por si sirven como ajuste fino más adelante.

### ⚠️ DECISIÓN PENDIENTE #028: cómo resolver el dominio del atacante

**Problema:** el atacante gana porque ve el equipo rival completo (cartas, vitalidad y bloqueos) y apunta siempre a su debilidad. Ocultar solo la carta atacante no compensa esa ventaja.

- **A. Equipo rival oculto hasta que se revela ("niebla").** No ves qué animales tiene el rival hasta que cada uno aparece en un duelo. Desde ese momento es público (vitalidad y bloqueos incluidos). Ambos jugadores juegan con información parcial, lo que refuerza el pilar central sin tocar la regla del turno. El diagnóstico `blind` apunta a un atacante de ~60–70 %. Cambio de interfaz: el HUD muestra siluetas "?" para las cartas rivales no reveladas.
- **B. Atributos enfrentados** (Ataque contra Defensa, Velocidad contra Percepción…). Cambia la regla central y no ataca la causa: el atacante seguiría buscando la debilidad del rival en el atributo opuesto.
- **C. Aceptar que el atacante gana casi siempre** y corregir solo el ritmo (B2+C1+A5 deja al primer jugador en 54,7 %). Es lo más simple, pero defender se reduce a elegir qué carta recibe el golpe y el pilar de información parcial pierde peso.

**Recomendación: A.** Es la única opción que ataca la causa medida. Además, hace que la elección secreta de equipo (§3.1 de GAME_RULES) importe durante toda la partida y da sentido a "leer" al rival. Antes de adoptarla la validaría con un bot que **recuerde** solo las cartas reveladas (ni `blind` ni `greedy`), con el mismo criterio: atacante entre 55 % y 62 %. #026 (Aire neutral más ajuste del Águila) se mediría después, sobre la regla elegida.

### Resultado de #028 A: equipos ocultos (2026-10-28)

Corrige la ventaja del primer jugador (62,8 % → 51,4 % con A5) pero no el éxito del atacante por duelo (~90 %). Ver [BALANCE.md](BALANCE.md) §12.6. El parámetro `hiddenTeams` queda implementado y probado, desactivado en 0.1.0.

### ⚠️ DECISIÓN PENDIENTE #029: qué objetivo de balance usamos

**Problema:** el objetivo "atacante entre 55 % y 62 % por duelo" lo propuse yo en el análisis (§J.8). Los datos indican que no es alcanzable sin romper uno de los pilares del juego.

- **A. Cambiar el objetivo y adoptar "ocultos + A5 + aire neutral" como base de 0.2.0.** Se acepta que atacar suele ganar el duelo (identidad: "golpeas en tu turno") y el equilibrio se mide con lo que decide partidas: primer jugador 48–52 %, animales 45–55 %, duración, empates y límite de duelos. La información oculta da sentido a revelar cartas y a "leer" al rival. Después se ajustan el Águila (sigue en 66 %) y los animales débiles.
- **B. Revisar la regla fundamental:** el defensor conocería el **hábitat y la carta atacante, pero no el atributo**. Defender pasaría a ser una apuesta real: eliges una carta robusta frente a los picos del atacante. Probablemente acercaría el duelo al 50–65 %, pero **no está medido** y cambia el paso 4 de tu regla principal.
- **C. Ventaja defensiva grande (~+30) o perfiles más planos.** Cumple el objetivo numérico, pero los animales pierden identidad. No lo recomiendo.

**Recomendación: A.** Respeta tu regla del turno y la identidad de los animales, y los datos muestran una partida justa entre jugadores. Si quieres explorar B, se puede medir como experimento sin adoptarla.

### ✅ #029 aceptada: opción A (2026-10-28)

- La base de la versión de balance **0.2.0** es: equipos ocultos (`hiddenTeams`), ventaja defensiva +5 (`defenderBonus`) y Aire neutral para los no voladores (resuelve también **#026**, opción A).
- **Nuevo objetivo de balance:** que atacar gane la mayoría de los duelos se considera parte de la identidad del juego. El indicador "win rate del atacante por duelo" pasa a ser **solo informativo**, con alerta únicamente si supera el 95 %. El equilibrio se mide con: primer jugador 48–52 %, animales 45–55 %, duración, empates y partidas que llegan al límite.
- **#027** queda resuelta: después de la estructura se ajustan el Águila y los animales débiles, en 0.2.0.

### ✅ Versión de balance 0.2.0 publicada (2026-10-28)

Composición final, elegida con el criterio de #029 (ninguna métrica que decide partidas en alerta, con la variante más simple que lo cumple):

- **Reglas:** equipos ocultos, ventaja defensiva +5, Aire neutral para no voladores y Hostil −10.
- **Perfiles:** ajustes de Águila, Guepardo, Lobo, Tiburón y Cocodrilo.

Detalle y resultados en [BALANCE.md](BALANCE.md) §13. GAME_RULES.md describe 0.2.0 como ruleset vigente.

## Fase 8 · Servidor y 1 vs 1 online (2026-10-28)

Decisiones técnicas tomadas durante la fase. Ninguna cambia las reglas del juego; todas son revisables.

### #030 PGlite en desarrollo y tests, PostgreSQL en producción

En esta máquina no hay PostgreSQL ni Docker. PGlite es PostgreSQL compilado a WebAssembly: se instala con npm y corre dentro del proceso. El mismo código Drizzle y las mismas migraciones funcionan con `pg` cuando se define `DATABASE_URL`.
**Riesgo:** pequeñas diferencias con un PostgreSQL real. **Mitigación:** ejecutar la suite contra PostgreSQL antes del despliegue (Fase 14). Ver [DATABASE.md](DATABASE.md).

### #031 La partida se guarda como semilla + acciones

El análisis proponía "eventos + instantáneas". Como el motor es determinista, basta con la semilla y las acciones aceptadas para reconstruir la partida exacta, con sus eventos. Es menos dato, no puede desincronizarse y un test lo comprueba. Las acciones guardan su origen: jugador, tiempo agotado o abandono.

### #032 El reloj del turno viaja como tiempo restante

El servidor envía cuántos milisegundos le quedan al turno (`turnEndsInMs`), no una hora absoluta. Así el reloj no depende de que el móvil tenga la hora bien puesta.

### #033 Sesión de invitado por pestaña

El token de sesión se guarda en `sessionStorage`: cada pestaña es un jugador (útil para probar) y la partida sobrevive a recargar la página.
**Contrapartida:** cerrar la pestaña y abrir otra no recupera la partida. Si en la Fase 10 (enlace y QR en el móvil) resulta molesto, se puede pasar a `localStorage` con una sesión por dispositivo.

### #034 Antes de empezar, abandonar cierra la sala

Si alguien sale (o no vuelve a tiempo) mientras se espera rival o se eligen equipos, la sala pasa a `closed` sin resultado. Durante la partida, salir cuenta como abandono (GAME_RULES §10.3).

### ⚠️ DECISIÓN PENDIENTE #035: dónde y cuándo desplegar (enlace público)

**Objetivo del usuario:** compartir el enlace de una sala con amigos fuera de casa. Hoy solo funciona en la red local.

**Problema:** Vercel ejecuta funciones *serverless* de corta duración y no puede mantener conexiones WebSocket. Sirve para la web, pero **no para el servidor de juego**.

- **A. Vercel (web) + Render (servidor) + Supabase o Neon (PostgreSQL), todo en planes gratuitos.** Render mantiene el proceso Node con WebSockets. Contrapartida: en el plan gratuito el servidor se duerme sin tráfico y tarda alrededor de un minuto en despertar.
- **B. Vercel + Railway o Fly.io.** No se duerme, pero normalmente pide tarjeta o un pago pequeño mensual.
- **C. Todo en un solo servicio (Render sirve también la web).** Un despliegue menos, sin CDN de Vercel.

**Recomendación: A**, y **adelantar el despliegue antes del 2 vs 2**: el 1 vs 1 online ya funciona y compartir el enlace es el objetivo. Cambios de código necesarios: URL del servidor configurable en la web (`VITE_GAME_SERVER_URL`), CORS con el dominio de Vercel y un `Dockerfile` o comando de arranque para el servidor. Las cuentas de Vercel, Render y la base de datos las crea el usuario.

### ✅ #035 aceptada: opción A, desplegando antes del 2 vs 2 (2026-10-28)

Vercel (web) + Render (servidor) + Neon (PostgreSQL, opcional al principio). Para la base de datos se elige **Neon** en lugar de Supabase: su conexión directa funciona con el driver `pg` y `sslmode=require` sin configurar certificados, y Render (plan gratuito, solo IPv4) llega a ella sin *pooler*. Guía en [DEPLOY.md](DEPLOY.md). El despliegue completo de producción (entornos, observabilidad, copias de seguridad) sigue en la Fase 14.

### #036 Almacén en memoria en Render (2026-10-28)

El primer despliegue en Render falló por memoria: PGlite ocupa unos 530 MB y el plan gratuito da 512 MB. Sin `DATABASE_URL`, Render usa ahora un almacén en memoria (`DB_DRIVER=memory`, ~126 MB el servidor completo). PGlite sigue siendo lo predeterminado en desarrollo y tests. Al añadir Neon (`DATABASE_URL`), el servidor pasa solo a PostgreSQL.

## Fase 9 · 2 vs 2 (2026-10-29)

### #037 Asientos, cambio de equipo y marcadores rápidos

- **Asientos:** por orden de llegada, alternando equipos (A1, B1, A2, B2). Mientras se espera, cada jugador puede pasarse a un asiento libre del otro equipo, para que los amigos elijan con quién jugar. Al empezar la elección de equipos los asientos quedan fijos.
- **Animales:** cada jugador elige 2, distintos de los de su compañero. La web guarda esta selección aparte del equipo de 4 del 1 vs 1 y bloquea en pantalla los animales que el compañero ya confirmó. La validación definitiva es del motor.
- **Marcadores:** «¡Bien jugado!», «¡Cuidado!», «Guarda tu {carta}», «Usa tu {carta}» y «Ataca en {hábitat}». Se descarta «Yo defiendo» del borrador de GAME_RULES: el defensor lo designa el orden de turnos. Solo llegan al equipo de quien los envía, como mucho uno por segundo por jugador (🔒 límite básico contra el abuso).
- **Pantalla:** tiras de cada rival y del compañero con su apodo; el texto de espera distingue «Tu compañero X elige…» de los rivales; el resumen final cuenta el daño por equipo.

**Revisable:** elegir asiento concreto (no solo «cambiar de equipo»), señales durante la elección de equipo y la IA en 2 vs 2 contra la máquina (hoy el 2 vs 2 es solo online).
