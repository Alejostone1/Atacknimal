# Informe de balance · ruleset 0.4.0 · política `greedy`

> 30.000 partidas 1v1 · 729.350 duelos · muestra de 30000 emparejamientos · semilla 1 · 203 s
> Objetivos y umbrales: `packages/content/data/balance/0.4.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- ⚠️ Win rate del primer jugador: 52.5 %
- ⚠️ Duelos por partida (media): 24.3
- ⚠️ Pitón reticulada: win rate 55.5 %
- ⚠️ Búho real: win rate 44.2 %
- 🔴 Ballena: presente en el 100.0 % de los 20 mejores equipos
- 🔴 Cóndor andino: presente en el 100.0 % de los 20 mejores equipos

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 52.5 % | ⚠️ |
| Duelos por partida (media) | 24.3 | ⚠️ |
| Partidas que llegan al límite de duelos | 1.0 % | ✅ |
| Partidas empatadas | 0.0 % | — |
| Win rate del atacante por duelo | 88.2 % | ✅ |
| Duelos empatados | 0.4 % | ✅ |
| Defensas forzadas por partida | 0.7 | ✅ |
| Daño medio por duelo | 33.7 | — |

## Animales

| Animal | Win rate | Estado | En los 20 mejores equipos | % de ataques | Win rate atacando |
|---|---|---|---|---|---|
| Pitón reticulada | 55.5 % | ⚠️ | 10.0 % | 4.2 % | 89.0 % |
| Hipopótamo | 54.4 % | ✅ | 10.0 % | 3.9 % | 91.6 % |
| Colibrí | 53.6 % | ✅ | 5.0 % | 4.0 % | 88.9 % |
| Rinoceronte | 53.5 % | ✅ | 0.0 % | 4.4 % | 85.4 % |
| Pingüino | 53.1 % | ✅ | 0.0 % | 4.4 % | 88.7 % |
| Oso pardo | 52.9 % | ✅ | 15.0 % | 3.2 % | 91.9 % |
| Oso polar | 52.8 % | ✅ | 0.0 % | 3.8 % | 90.2 % |
| Gorila | 52.8 % | ✅ | 15.0 % | 4.3 % | 88.0 % |
| Elefante | 52.7 % | ✅ | 15.0 % | 4.5 % | 82.7 % |
| Perezoso | 51.5 % | ✅ | 10.0 % | 4.4 % | 89.4 % |
| Murciélago | 50.7 % | ✅ | 35.0 % | 3.6 % | 88.5 % |
| Ballena | 50.1 % | ✅ | 100.0 % | 4.6 % | 87.9 % |
| Halcón peregrino | 50.0 % | ✅ | 10.0 % | 3.8 % | 88.2 % |
| Tigre | 49.9 % | ✅ | 5.0 % | 3.0 % | 91.5 % |
| Águila real | 49.7 % | ✅ | 0.0 % | 3.4 % | 88.2 % |
| Cóndor andino | 49.7 % | ✅ | 100.0 % | 3.5 % | 90.3 % |
| Cocodrilo | 49.0 % | ✅ | 5.0 % | 3.7 % | 86.0 % |
| Jaguar | 47.8 % | ✅ | 5.0 % | 3.6 % | 87.4 % |
| Tiburón blanco | 47.7 % | ✅ | 0.0 % | 4.0 % | 87.9 % |
| Orca | 47.5 % | ✅ | 5.0 % | 4.1 % | 86.2 % |
| Guepardo | 47.1 % | ✅ | 20.0 % | 4.3 % | 83.5 % |
| Ardilla | 46.5 % | ✅ | 10.0 % | 3.4 % | 87.8 % |
| Orangután | 46.2 % | ✅ | 5.0 % | 3.6 % | 89.5 % |
| León | 45.7 % | ✅ | 10.0 % | 3.3 % | 90.6 % |
| Lobo | 45.0 % | ✅ | 5.0 % | 3.7 % | 88.9 % |
| Búho real | 44.2 % | ⚠️ | 5.0 % | 3.3 % | 89.5 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 15.4 % | ✅ | 89.0 % |
| Fuerza | 9.7 % | ✅ | 88.9 % |
| Agilidad | 14.0 % | ✅ | 87.5 % |
| Ataque | 9.7 % | ✅ | 88.7 % |
| Resistencia | 10.5 % | ✅ | 88.1 % |
| Velocidad | 17.4 % | ✅ | 89.1 % |
| Defensa | 17.0 % | ✅ | 87.4 % |
| Percepción | 6.4 % | ✅ | 86.5 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 15.8 % | ✅ | 88.0 % |
| Agua | 32.1 % | ✅ | 89.3 % |
| Tierra | 22.4 % | ✅ | 85.2 % |
| Árboles | 29.7 % | ✅ | 89.5 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Pitón reticulada | 1.3 % (77.5 %) | 11.3 % (92.2 %) | 1.6 % (67.3 %) | 85.7 % (89.2 %) |
| Hipopótamo | 1.8 % (75.3 %) | 83.7 % (92.1 %) | 13.8 % (92.2 %) | 0.7 % (53.6 %) |
| Colibrí | 68.4 % (89.7 %) | 1.1 % (47.6 %) | 1.8 % (82.1 %) | 28.8 % (88.9 %) |
| Rinoceronte | 4.3 % (80.9 %) | 12.9 % (97.0 %) | 81.9 % (84.1 %) | 0.9 % (60.3 %) |
| Pingüino | 3.2 % (92.2 %) | 90.3 % (88.5 %) | 4.7 % (89.5 %) | 1.8 % (88.7 %) |
| Oso pardo | 2.1 % (86.7 %) | 26.5 % (96.0 %) | 55.3 % (91.2 %) | 16.0 % (88.2 %) |
| Oso polar | 0.3 % (38.6 %) | 53.7 % (90.5 %) | 45.8 % (90.6 %) | 0.2 % (0.0 %) |
| Gorila | 1.7 % (69.9 %) | 1.2 % (80.6 %) | 5.9 % (77.2 %) | 91.2 % (89.2 %) |
| Elefante | 2.7 % (67.1 %) | 21.7 % (94.2 %) | 74.4 % (81.2 %) | 1.2 % (7.0 %) |
| Perezoso | 1.6 % (82.4 %) | 11.5 % (90.2 %) | 0.3 % (0.0 %) | 86.6 % (89.7 %) |
| Murciélago | 55.4 % (85.7 %) | 13.7 % (85.8 %) | 1.2 % (71.4 %) | 29.7 % (95.9 %) |
| Ballena | 3.5 % (84.5 %) | 94.2 % (88.6 %) | 0.6 % (52.1 %) | 1.7 % (68.5 %) |
| Halcón peregrino | 83.1 % (88.9 %) | 1.7 % (52.4 %) | 5.0 % (80.9 %) | 10.2 % (92.3 %) |
| Tigre | 1.4 % (80.5 %) | 27.9 % (92.6 %) | 43.9 % (88.3 %) | 26.9 % (96.2 %) |
| Águila real | 71.1 % (90.7 %) | 14.5 % (78.3 %) | 3.6 % (64.7 %) | 10.9 % (92.7 %) |
| Cóndor andino | 73.0 % (87.9 %) | 8.9 % (96.1 %) | 12.6 % (97.3 %) | 5.5 % (95.9 %) |
| Cocodrilo | 2.0 % (61.0 %) | 85.3 % (86.7 %) | 11.9 % (88.7 %) | 0.9 % (39.7 %) |
| Jaguar | 0.5 % (35.5 %) | 23.4 % (92.0 %) | 3.8 % (88.2 %) | 72.3 % (86.3 %) |
| Tiburón blanco | 3.6 % (75.3 %) | 94.0 % (89.1 %) | 0.6 % (41.0 %) | 1.9 % (67.4 %) |
| Orca | 3.5 % (79.2 %) | 94.1 % (87.1 %) | 0.6 % (33.7 %) | 1.8 % (74.1 %) |
| Guepardo | 4.3 % (91.1 %) | 0.2 % (0.0 %) | 83.0 % (81.5 %) | 12.5 % (95.7 %) |
| Ardilla | 3.1 % (89.6 %) | 1.4 % (64.9 %) | 8.3 % (91.2 %) | 87.2 % (87.7 %) |
| Orangután | 1.5 % (75.2 %) | 0.8 % (73.8 %) | 7.3 % (89.7 %) | 90.4 % (89.8 %) |
| León | 1.7 % (76.3 %) | 11.4 % (84.8 %) | 53.8 % (89.5 %) | 33.2 % (94.9 %) |
| Lobo | 1.0 % (70.2 %) | 16.8 % (95.2 %) | 58.2 % (83.6 %) | 24.0 % (98.0 %) |
| Búho real | 34.2 % (93.2 %) | 0.2 % (0.0 %) | 1.9 % (84.6 %) | 63.7 % (87.9 %) |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 88.2 % | 0.4 % | 11.3 % |
| +5 | 85.2 % | 0.3 % | 14.6 % |
| +10 | 81.3 % | 1.0 % | 17.8 % |
| +15 | 74.1 % | 1.8 % | 24.1 % |
| +20 | 65.7 % | 1.5 % | 32.8 % |
| +25 | 58.4 % | 1.1 % | 40.4 % |
| +30 | 50.5 % | 1.1 % | 48.5 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Cóndor andino, Ballena, Oso pardo, Guepardo | 100.0 % |
| 2 | Cóndor andino, Ballena, Oso pardo, Murciélago | 100.0 % |
| 3 | Cóndor andino, Ballena, Oso pardo, Ardilla | 100.0 % |
| 4 | Cóndor andino, Ballena, Guepardo, Gorila | 100.0 % |
| 5 | Cóndor andino, Ballena, Guepardo, León | 100.0 % |
| 6 | Cóndor andino, Ballena, Guepardo, Perezoso | 100.0 % |
| 7 | Cóndor andino, Ballena, Cocodrilo, León | 100.0 % |
| 8 | Cóndor andino, Ballena, Búho real, Halcón peregrino | 100.0 % |
| 9 | Cóndor andino, Ballena, Elefante, Halcón peregrino | 100.0 % |
| 10 | Cóndor andino, Ballena, Elefante, Tigre | 100.0 % |
| 11 | Cóndor andino, Ballena, Elefante, Lobo | 100.0 % |
| 12 | Cóndor andino, Ballena, Murciélago, Hipopótamo | 100.0 % |
| 13 | Cóndor andino, Ballena, Murciélago, Colibrí | 100.0 % |
| 14 | Cóndor andino, Ballena, Murciélago, Jaguar | 100.0 % |
| 15 | Cóndor andino, Ballena, Murciélago, Orangután | 100.0 % |
| 16 | Cóndor andino, Ballena, Murciélago, Pitón reticulada | 100.0 % |
| 17 | Cóndor andino, Ballena, Murciélago, Perezoso | 100.0 % |
| 18 | Cóndor andino, Ballena, Gorila, Orca | 100.0 % |
| 19 | Cóndor andino, Ballena, Gorila, Ardilla | 100.0 % |
| 20 | Cóndor andino, Ballena, Hipopótamo, Pitón reticulada | 100.0 % |
