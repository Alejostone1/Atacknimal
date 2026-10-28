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
