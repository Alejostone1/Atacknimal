# Informe de balance · ruleset 0.2.0 · política `random`

> 108.900 partidas 1v1 · 3.242.271 duelos · round-robin completo · semilla 1 · 77 s
> Objetivos y umbrales: `packages/content/data/balance/0.2.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- 🔴 Duelos por partida (media): 29.8
- 🔴 Partidas que llegan al límite de duelos: 87.5 %
- ⚠️ Defensas forzadas por partida: 0.1
- ⚠️ Oso pardo: win rate 55.2 %
- 🔴 Oso pardo: presente en el 100.0 % de los 20 mejores equipos
- 🔴 Tigre: presente en el 80.0 % de los 20 mejores equipos

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 50.4 % | ✅ |
| Duelos por partida (media) | 29.8 | 🔴 |
| Partidas que llegan al límite de duelos | 87.5 % | 🔴 |
| Partidas empatadas | 0.1 % | — |
| Win rate del atacante por duelo | 38.3 % | ✅ |
| Duelos empatados | 1.0 % | ✅ |
| Defensas forzadas por partida | 0.1 | ⚠️ |
| Daño medio por duelo | 21.8 | — |

## Animales

| Animal | Win rate | Estado | En los 20 mejores equipos | % de ataques | Win rate atacando |
|---|---|---|---|---|---|
| Oso pardo | 55.2 % | ⚠️ | 100.0 % | 9.6 % | 42.6 % |
| Tigre | 53.1 % | ✅ | 80.0 % | 9.3 % | 40.7 % |
| Lobo | 51.4 % | ✅ | 45.0 % | 9.2 % | 41.2 % |
| Águila real | 51.2 % | ✅ | 40.0 % | 9.1 % | 42.1 % |
| Cocodrilo | 50.9 % | ✅ | 35.0 % | 9.3 % | 36.5 % |
| Elefante | 50.3 % | ✅ | 25.0 % | 9.2 % | 37.9 % |
| Pingüino | 49.5 % | ✅ | 35.0 % | 8.8 % | 41.3 % |
| Ballena | 47.8 % | ✅ | 20.0 % | 8.9 % | 37.3 % |
| Guepardo | 47.1 % | ✅ | 5.0 % | 8.8 % | 35.0 % |
| Rinoceronte | 46.9 % | ✅ | 10.0 % | 8.9 % | 32.6 % |
| Tiburón blanco | 46.5 % | ✅ | 5.0 % | 8.8 % | 33.5 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 12.5 % | ✅ | 40.9 % |
| Fuerza | 12.5 % | ✅ | 36.7 % |
| Agilidad | 12.5 % | ✅ | 39.0 % |
| Ataque | 12.5 % | ✅ | 37.5 % |
| Resistencia | 12.5 % | ✅ | 37.6 % |
| Velocidad | 12.5 % | ✅ | 36.7 % |
| Defensa | 12.5 % | ✅ | 39.7 % |
| Percepción | 12.5 % | ✅ | 38.2 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 25.0 % | ✅ | 37.9 % |
| Agua | 25.0 % | ✅ | 38.3 % |
| Tierra | 25.0 % | ✅ | 38.5 % |
| Árboles | 25.0 % | ✅ | 38.5 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Oso pardo | 25.1 % (36.2 %) | 25.0 % (35.8 %) | 24.9 % (47.2 %) | 25.1 % (51.3 %) |
| Tigre | 25.0 % (34.0 %) | 25.0 % (34.2 %) | 24.9 % (46.0 %) | 25.1 % (48.4 %) |
| Lobo | 25.0 % (38.5 %) | 25.0 % (44.0 %) | 24.9 % (47.6 %) | 25.1 % (34.8 %) |
| Águila real | 25.1 % (55.4 %) | 24.9 % (32.6 %) | 24.9 % (31.8 %) | 25.0 % (48.3 %) |
| Cocodrilo | 25.0 % (34.8 %) | 25.0 % (47.7 %) | 25.0 % (34.5 %) | 25.0 % (28.9 %) |
| Elefante | 25.0 % (37.4 %) | 25.0 % (35.1 %) | 25.0 % (44.9 %) | 25.0 % (34.0 %) |
| Pingüino | 25.0 % (39.6 %) | 24.9 % (48.6 %) | 25.1 % (39.6 %) | 25.0 % (37.4 %) |
| Ballena | 25.0 % (39.8 %) | 24.9 % (46.2 %) | 25.0 % (27.1 %) | 25.1 % (36.1 %) |
| Guepardo | 25.1 % (33.9 %) | 24.9 % (21.5 %) | 25.1 % (42.2 %) | 24.9 % (42.1 %) |
| Rinoceronte | 25.0 % (32.4 %) | 25.0 % (26.5 %) | 24.8 % (42.5 %) | 25.2 % (29.2 %) |
| Tiburón blanco | 25.0 % (34.9 %) | 25.1 % (48.6 %) | 24.9 % (19.0 %) | 25.0 % (31.4 %) |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 38.3 % | 1.0 % | 60.7 % |
| +5 | 31.9 % | 2.5 % | 65.5 % |
| +10 | 27.2 % | 1.0 % | 71.8 % |
| +15 | 22.5 % | 1.5 % | 76.0 % |
| +20 | 19.5 % | 0.7 % | 79.9 % |
| +25 | 15.4 % | 1.2 % | 83.4 % |
| +30 | 12.8 % | 0.4 % | 86.8 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Ballena, Oso pardo, Tigre, Lobo | 65.3 % |
| 2 | Oso pardo, Águila real, Tigre, Lobo | 64.8 % |
| 3 | Oso pardo, Cocodrilo, Pingüino, Tigre | 63.3 % |
| 4 | Oso pardo, Cocodrilo, Tigre, Lobo | 63.1 % |
| 5 | Oso pardo, Pingüino, Tigre, Lobo | 63.0 % |
| 6 | Oso pardo, Cocodrilo, Tiburón blanco, Tigre | 62.7 % |
| 7 | Ballena, Oso pardo, Águila real, Tigre | 62.6 % |
| 8 | Oso pardo, Elefante, Tigre, Lobo | 62.6 % |
| 9 | Oso pardo, Águila real, Pingüino, Tigre | 62.3 % |
| 10 | Oso pardo, Cocodrilo, Águila real, Lobo | 62.2 % |
| 11 | Oso pardo, Guepardo, Águila real, Tigre | 62.0 % |
| 12 | Oso pardo, Águila real, Pingüino, Lobo | 61.5 % |
| 13 | Oso pardo, Águila real, Rinoceronte, Tigre | 61.3 % |
| 14 | Ballena, Oso pardo, Pingüino, Tigre | 61.2 % |
| 15 | Ballena, Oso pardo, Elefante, Tigre | 61.1 % |
| 16 | Oso pardo, Cocodrilo, Elefante, Tigre | 60.8 % |
| 17 | Oso pardo, Cocodrilo, Elefante, Pingüino | 60.7 % |
| 18 | Oso pardo, Rinoceronte, Tigre, Lobo | 60.7 % |
| 19 | Oso pardo, Elefante, Águila real, Tigre | 60.6 % |
| 20 | Oso pardo, Cocodrilo, Pingüino, Lobo | 60.3 % |
