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
