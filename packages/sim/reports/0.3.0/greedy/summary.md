# Informe de balance · ruleset 0.3.0 · política `greedy`

> 100.000 partidas 1v1 · 2.598.152 duelos · muestra de 100000 emparejamientos · semilla 1 · 588 s
> Objetivos y umbrales: `packages/content/data/balance/0.3.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- 🔴 Win rate del primer jugador: 54.0 %
- ⚠️ Duelos por partida (media): 26.0
- ⚠️ Tigre: presente en el 60.0 % de los 20 mejores equipos
- ⚠️ Atributo Ataque: uso 5.4 %

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 54.0 % | 🔴 |
| Duelos por partida (media) | 26.0 | ⚠️ |
| Partidas que llegan al límite de duelos | 3.7 % | ✅ |
| Partidas empatadas | 0.1 % | — |
| Win rate del atacante por duelo | 93.4 % | ✅ |
| Duelos empatados | 1.0 % | ✅ |
| Defensas forzadas por partida | 1.2 | ✅ |
| Daño medio por duelo | 31.8 | — |

## Animales

| Animal | Win rate | Estado | En los 20 mejores equipos | % de ataques | Win rate atacando |
|---|---|---|---|---|---|
| Ballena | 54.4 % | ✅ | 30.0 % | 5.9 % | 94.0 % |
| Tigre | 53.4 % | ✅ | 60.0 % | 4.6 % | 92.9 % |
| Gorila | 53.3 % | ✅ | 30.0 % | 6.6 % | 94.0 % |
| Halcón peregrino | 53.3 % | ✅ | 40.0 % | 5.7 % | 93.9 % |
| Guepardo | 52.1 % | ✅ | 25.0 % | 5.7 % | 94.2 % |
| Elefante | 52.0 % | ✅ | 45.0 % | 5.5 % | 93.1 % |
| Pingüino | 51.8 % | ✅ | 25.0 % | 4.7 % | 94.7 % |
| Rinoceronte | 51.2 % | ✅ | 40.0 % | 5.7 % | 92.2 % |
| Águila real | 51.1 % | ✅ | 10.0 % | 4.9 % | 95.4 % |
| Búho real | 50.6 % | ✅ | 15.0 % | 6.3 % | 95.4 % |
| Jaguar | 49.7 % | ✅ | 20.0 % | 4.8 % | 91.2 % |
| Pitón reticulada | 49.3 % | ✅ | 0.0 % | 5.4 % | 95.2 % |
| Oso pardo | 48.9 % | ✅ | 10.0 % | 3.9 % | 94.0 % |
| León | 48.6 % | ✅ | 5.0 % | 3.8 % | 93.9 % |
| Tiburón blanco | 48.0 % | ✅ | 15.0 % | 5.5 % | 92.8 % |
| Hipopótamo | 47.6 % | ✅ | 5.0 % | 4.4 % | 88.6 % |
| Orca | 47.1 % | ✅ | 20.0 % | 4.3 % | 92.0 % |
| Lobo | 47.1 % | ✅ | 5.0 % | 4.5 % | 96.1 % |
| Oso polar | 45.4 % | ✅ | 0.0 % | 3.4 % | 93.6 % |
| Cocodrilo | 45.3 % | ✅ | 0.0 % | 4.5 % | 88.7 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 17.4 % | ✅ | 94.1 % |
| Fuerza | 8.5 % | ✅ | 90.5 % |
| Agilidad | 14.7 % | ✅ | 93.7 % |
| Ataque | 5.4 % | ⚠️ | 89.8 % |
| Resistencia | 9.6 % | ✅ | 92.4 % |
| Velocidad | 17.9 % | ✅ | 93.9 % |
| Defensa | 15.5 % | ✅ | 94.1 % |
| Percepción | 10.9 % | ✅ | 94.8 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 15.3 % | ✅ | 92.8 % |
| Agua | 33.2 % | ✅ | 93.2 % |
| Tierra | 25.7 % | ✅ | 93.3 % |
| Árboles | 25.9 % | ✅ | 94.0 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Ballena | 6.3 % (90.6 %) | 89.1 % (94.9 %) | 0.8 % (61.7 %) | 3.8 % (86.3 %) |
| Tigre | 0.7 % (40.3 %) | 20.4 % (90.5 %) | 34.8 % (93.2 %) | 44.0 % (94.6 %) |
| Gorila | 1.5 % (70.6 %) | 0.2 % (0.0 %) | 1.5 % (75.4 %) | 96.8 % (94.9 %) |
| Halcón peregrino | 82.2 % (94.9 %) | 0.8 % (51.5 %) | 3.5 % (81.8 %) | 13.6 % (93.4 %) |
| Guepardo | 3.4 % (86.0 %) | 0.3 % (0.0 %) | 73.0 % (94.1 %) | 23.3 % (97.0 %) |
| Elefante | 4.4 % (79.9 %) | 20.6 % (93.4 %) | 73.3 % (94.4 %) | 1.7 % (67.8 %) |
| Pingüino | 4.3 % (91.6 %) | 82.3 % (95.0 %) | 11.2 % (95.2 %) | 2.2 % (85.7 %) |
| Rinoceronte | 6.0 % (84.7 %) | 8.5 % (94.6 %) | 83.5 % (92.9 %) | 2.0 % (78.9 %) |
| Águila real | 74.4 % (96.3 %) | 10.2 % (93.2 %) | 1.8 % (77.4 %) | 13.6 % (94.6 %) |
| Búho real | 64.3 % (95.3 %) | 0.2 % (2.5 %) | 0.3 % (3.8 %) | 35.2 % (97.0 %) |
| Jaguar | 0.8 % (59.1 %) | 14.8 % (94.7 %) | 0.9 % (58.0 %) | 83.4 % (91.2 %) |
| Pitón reticulada | 0.5 % (36.8 %) | 8.6 % (94.9 %) | 0.7 % (45.6 %) | 90.2 % (95.9 %) |
| Oso pardo | 1.8 % (81.3 %) | 18.1 % (95.5 %) | 52.1 % (93.6 %) | 28.0 % (94.4 %) |
| León | 3.4 % (70.7 %) | 8.7 % (92.2 %) | 53.6 % (94.5 %) | 34.4 % (95.7 %) |
| Tiburón blanco | 5.7 % (89.5 %) | 90.2 % (93.4 %) | 0.7 % (65.4 %) | 3.4 % (87.5 %) |
| Hipopótamo | 4.4 % (67.1 %) | 77.7 % (90.8 %) | 15.4 % (89.0 %) | 2.5 % (56.4 %) |
| Orca | 6.5 % (82.0 %) | 88.8 % (93.4 %) | 0.8 % (59.9 %) | 3.9 % (82.2 %) |
| Lobo | 4.2 % (91.7 %) | 22.1 % (96.9 %) | 71.9 % (96.3 %) | 1.8 % (86.4 %) |
| Oso polar | 0.7 % (57.0 %) | 55.3 % (94.5 %) | 43.7 % (93.4 %) | 0.3 % (23.2 %) |
| Cocodrilo | 3.8 % (72.7 %) | 82.7 % (89.9 %) | 11.5 % (88.3 %) | 2.0 % (70.4 %) |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 93.4 % | 1.0 % | 5.6 % |
| +5 | 89.6 % | 0.2 % | 10.2 % |
| +10 | 77.5 % | 4.8 % | 17.7 % |
| +15 | 67.2 % | 0.5 % | 32.2 % |
| +20 | 52.3 % | 5.1 % | 42.6 % |
| +25 | 44.1 % | 0.3 % | 55.6 % |
| +30 | 34.1 % | 2.7 % | 63.2 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Ballena, Elefante, Jaguar, Lobo | 88.0 % |
| 2 | Búho real, Elefante, Gorila, Tigre | 87.8 % |
| 3 | Ballena, Jaguar, Halcón peregrino, Rinoceronte | 87.0 % |
| 4 | Ballena, Gorila, Rinoceronte, Tigre | 86.7 % |
| 5 | Guepardo, Orca, Halcón peregrino, Rinoceronte | 86.0 % |
| 6 | Guepardo, Elefante, Gorila, Orca | 85.7 % |
| 7 | Elefante, Águila real, Gorila, Tigre | 85.3 % |
| 8 | Elefante, Orca, Halcón peregrino, Tigre | 84.8 % |
| 9 | Águila real, Halcón peregrino, Rinoceronte, Tigre | 84.8 % |
| 10 | Ballena, Elefante, Halcón peregrino, Tigre | 84.4 % |
| 11 | Búho real, Pingüino, Rinoceronte, Tigre | 84.4 % |
| 12 | Oso pardo, Guepardo, Tiburón blanco, Pingüino | 83.8 % |
| 13 | Oso pardo, Gorila, Pingüino, Tigre | 83.8 % |
| 14 | Búho real, Gorila, Rinoceronte, Tigre | 83.7 % |
| 15 | Ballena, Guepardo, Hipopótamo, Orca | 83.3 % |
| 16 | Guepardo, Elefante, Tiburón blanco, Pingüino | 83.3 % |
| 17 | Elefante, Tiburón blanco, Halcón peregrino, Tigre | 83.3 % |
| 18 | Ballena, Jaguar, Pingüino, Rinoceronte | 82.9 % |
| 19 | Jaguar, Halcón peregrino, Rinoceronte, Tigre | 82.1 % |
| 20 | Elefante, León, Halcón peregrino, Tigre | 81.8 % |
