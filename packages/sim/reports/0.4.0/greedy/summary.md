# Informe de balance · ruleset 0.4.0 · política `greedy`

> 100.000 partidas 1v1 · 2.431.526 duelos · muestra de 100000 emparejamientos · semilla 1 · 714 s
> Objetivos y umbrales: `packages/content/data/balance/0.4.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- ⚠️ Win rate del primer jugador: 52.6 %
- ⚠️ Duelos por partida (media): 24.3
- ⚠️ Pitón reticulada: win rate 55.6 %
- ⚠️ Búho real: win rate 44.2 %
- ⚠️ Cóndor andino: presente en el 55.0 % de los 20 mejores equipos

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 52.6 % | ⚠️ |
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
| Pitón reticulada | 55.6 % | ⚠️ | 30.0 % | 4.2 % | 89.0 % |
| Hipopótamo | 54.9 % | ✅ | 30.0 % | 3.9 % | 91.5 % |
| Rinoceronte | 53.7 % | ✅ | 10.0 % | 4.4 % | 85.7 % |
| Pingüino | 53.6 % | ✅ | 20.0 % | 4.4 % | 88.4 % |
| Colibrí | 53.4 % | ✅ | 5.0 % | 4.0 % | 88.5 % |
| Oso pardo | 53.2 % | ✅ | 30.0 % | 3.1 % | 92.1 % |
| Oso polar | 52.9 % | ✅ | 15.0 % | 3.8 % | 90.5 % |
| Perezoso | 52.8 % | ✅ | 10.0 % | 4.4 % | 89.3 % |
| Elefante | 52.6 % | ✅ | 5.0 % | 4.4 % | 83.0 % |
| Gorila | 52.4 % | ✅ | 15.0 % | 4.3 % | 87.9 % |
| Murciélago | 51.1 % | ✅ | 20.0 % | 3.6 % | 88.5 % |
| Águila real | 50.0 % | ✅ | 10.0 % | 3.4 % | 88.2 % |
| Halcón peregrino | 49.7 % | ✅ | 10.0 % | 3.8 % | 88.0 % |
| Ballena | 49.5 % | ✅ | 30.0 % | 4.5 % | 87.7 % |
| Tigre | 49.2 % | ✅ | 10.0 % | 3.1 % | 91.2 % |
| Cóndor andino | 48.9 % | ✅ | 55.0 % | 3.5 % | 90.0 % |
| Jaguar | 48.2 % | ✅ | 20.0 % | 3.6 % | 87.5 % |
| Cocodrilo | 47.9 % | ✅ | 20.0 % | 3.7 % | 86.1 % |
| Orca | 47.8 % | ✅ | 0.0 % | 4.2 % | 86.0 % |
| Tiburón blanco | 47.2 % | ✅ | 10.0 % | 4.0 % | 87.7 % |
| Guepardo | 47.2 % | ✅ | 15.0 % | 4.2 % | 83.4 % |
| Ardilla | 46.4 % | ✅ | 0.0 % | 3.4 % | 88.0 % |
| Orangután | 46.0 % | ✅ | 15.0 % | 3.7 % | 89.4 % |
| León | 46.0 % | ✅ | 5.0 % | 3.3 % | 90.4 % |
| Lobo | 45.4 % | ✅ | 0.0 % | 3.6 % | 88.9 % |
| Búho real | 44.2 % | ⚠️ | 10.0 % | 3.3 % | 89.5 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 15.4 % | ✅ | 89.1 % |
| Fuerza | 9.7 % | ✅ | 88.7 % |
| Agilidad | 14.0 % | ✅ | 87.4 % |
| Ataque | 9.8 % | ✅ | 88.7 % |
| Resistencia | 10.5 % | ✅ | 87.8 % |
| Velocidad | 17.4 % | ✅ | 89.1 % |
| Defensa | 17.0 % | ✅ | 87.4 % |
| Percepción | 6.4 % | ✅ | 86.7 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 15.8 % | ✅ | 87.8 % |
| Agua | 32.1 % | ✅ | 89.1 % |
| Tierra | 22.3 % | ✅ | 85.4 % |
| Árboles | 29.8 % | ✅ | 89.5 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Pitón reticulada | 1.4 % (79.5 %) | 11.5 % (91.8 %) | 1.6 % (67.0 %) | 85.5 % (89.2 %) |
| Hipopótamo | 1.9 % (75.1 %) | 84.2 % (92.1 %) | 13.2 % (92.0 %) | 0.7 % (51.9 %) |
| Rinoceronte | 4.3 % (81.3 %) | 12.8 % (96.9 %) | 82.0 % (84.4 %) | 0.9 % (60.6 %) |
| Pingüino | 3.1 % (90.2 %) | 90.5 % (88.2 %) | 4.8 % (90.1 %) | 1.7 % (89.0 %) |
| Colibrí | 68.5 % (89.5 %) | 1.3 % (45.0 %) | 1.8 % (80.7 %) | 28.4 % (88.5 %) |
| Oso pardo | 2.1 % (88.8 %) | 25.8 % (95.9 %) | 55.3 % (91.6 %) | 16.8 % (88.2 %) |
| Oso polar | 0.4 % (42.0 %) | 53.9 % (90.7 %) | 45.5 % (90.9 %) | 0.2 % (0.0 %) |
| Perezoso | 1.5 % (82.0 %) | 11.2 % (90.0 %) | 0.3 % (0.0 %) | 87.0 % (89.6 %) |
| Elefante | 2.6 % (67.8 %) | 22.0 % (93.5 %) | 74.3 % (81.6 %) | 1.1 % (6.6 %) |
| Gorila | 1.7 % (68.5 %) | 1.1 % (81.3 %) | 6.1 % (75.9 %) | 91.1 % (89.2 %) |
| Murciélago | 55.6 % (85.6 %) | 13.7 % (86.2 %) | 1.2 % (70.4 %) | 29.5 % (95.7 %) |
| Águila real | 70.5 % (90.8 %) | 15.0 % (78.4 %) | 3.7 % (66.9 %) | 10.8 % (92.3 %) |
| Halcón peregrino | 83.2 % (88.6 %) | 1.8 % (51.0 %) | 4.7 % (82.0 %) | 10.2 % (92.5 %) |
| Ballena | 3.4 % (84.7 %) | 94.2 % (88.5 %) | 0.6 % (50.0 %) | 1.8 % (64.4 %) |
| Tigre | 1.3 % (75.7 %) | 28.1 % (92.3 %) | 44.1 % (87.8 %) | 26.5 % (96.4 %) |
| Cóndor andino | 72.7 % (87.5 %) | 8.9 % (96.3 %) | 13.0 % (97.2 %) | 5.4 % (95.8 %) |
| Jaguar | 0.5 % (41.2 %) | 23.4 % (92.2 %) | 3.7 % (88.9 %) | 72.4 % (86.3 %) |
| Cocodrilo | 1.9 % (61.3 %) | 85.3 % (86.7 %) | 11.9 % (89.1 %) | 0.9 % (46.5 %) |
| Orca | 3.4 % (78.0 %) | 94.2 % (86.9 %) | 0.6 % (35.6 %) | 1.8 % (72.7 %) |
| Tiburón blanco | 3.6 % (76.2 %) | 93.9 % (88.9 %) | 0.6 % (35.4 %) | 1.9 % (66.6 %) |
| Guepardo | 4.4 % (89.5 %) | 0.3 % (0.0 %) | 83.1 % (81.6 %) | 12.2 % (95.5 %) |
| Ardilla | 3.1 % (89.8 %) | 1.4 % (68.4 %) | 8.2 % (91.3 %) | 87.3 % (87.9 %) |
| Orangután | 1.5 % (76.2 %) | 0.8 % (72.9 %) | 7.3 % (88.3 %) | 90.4 % (89.9 %) |
| León | 1.9 % (71.7 %) | 11.8 % (85.6 %) | 53.6 % (89.5 %) | 32.7 % (94.8 %) |
| Lobo | 1.0 % (71.9 %) | 17.0 % (95.1 %) | 58.3 % (83.7 %) | 23.7 % (97.9 %) |
| Búho real | 33.9 % (92.9 %) | 0.2 % (0.0 %) | 1.9 % (87.1 %) | 64.0 % (88.0 %) |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 88.2 % | 0.4 % | 11.4 % |
| +5 | 85.1 % | 0.3 % | 14.6 % |
| +10 | 81.2 % | 1.0 % | 17.8 % |
| +15 | 74.0 % | 1.8 % | 24.2 % |
| +20 | 65.6 % | 1.5 % | 32.9 % |
| +25 | 58.3 % | 1.1 % | 40.6 % |
| +30 | 50.4 % | 1.0 % | 48.6 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Cóndor andino, Oso pardo, Búho real, Elefante | 100.0 % |
| 2 | Cóndor andino, Oso pardo, Águila real, Jaguar | 100.0 % |
| 3 | Cóndor andino, Guepardo, Pingüino, Rinoceronte | 100.0 % |
| 4 | Cóndor andino, Cocodrilo, Gorila, Colibrí | 100.0 % |
| 5 | Cóndor andino, Cocodrilo, Pitón reticulada, Tigre | 100.0 % |
| 6 | Cóndor andino, Búho real, Jaguar, Perezoso | 100.0 % |
| 7 | Cóndor andino, Murciélago, Hipopótamo, Pitón reticulada | 100.0 % |
| 8 | Cóndor andino, Águila real, Orangután, Pitón reticulada | 100.0 % |
| 9 | Cóndor andino, Hipopótamo, León, Pingüino | 100.0 % |
| 10 | Cóndor andino, Pingüino, Pitón reticulada, Tigre | 100.0 % |
| 11 | Cóndor andino, Halcón peregrino, Pitón reticulada, Rinoceronte | 100.0 % |
| 12 | Ballena, Oso pardo, Cocodrilo, Murciélago | 100.0 % |
| 13 | Ballena, Guepardo, Gorila, Oso polar | 100.0 % |
| 14 | Ballena, Guepardo, Tiburón blanco, Orangután | 100.0 % |
| 15 | Ballena, Cocodrilo, Jaguar, Oso polar | 100.0 % |
| 16 | Ballena, Murciélago, Hipopótamo, Perezoso | 100.0 % |
| 17 | Ballena, Gorila, Oso polar, Pitón reticulada | 100.0 % |
| 18 | Oso pardo, Murciélago, Tiburón blanco, Hipopótamo | 100.0 % |
| 19 | Oso pardo, Hipopótamo, Jaguar, Orangután | 100.0 % |
| 20 | Oso pardo, Hipopótamo, Pingüino, Halcón peregrino | 100.0 % |
