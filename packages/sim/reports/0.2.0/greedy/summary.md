# Informe de balance · ruleset 0.2.0 · política `greedy`

> 108.900 partidas 1v1 · 2.810.722 duelos · round-robin completo · semilla 1 · 279 s
> Objetivos y umbrales: `packages/content/data/balance/0.2.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- ⚠️ Win rate del primer jugador: 52.3 %
- ⚠️ Duelos por partida (media): 25.8
- ⚠️ Guepardo: win rate 56.4 %
- ⚠️ Águila real: win rate 56.2 %
- ⚠️ Tigre: win rate 56.2 %
- ⚠️ Lobo: win rate 45.0 %
- ⚠️ Cocodrilo: win rate 45.0 %
- ⚠️ Guepardo: presente en el 60.0 % de los 20 mejores equipos
- 🔴 Águila real: presente en el 80.0 % de los 20 mejores equipos
- ⚠️ Tigre: presente en el 55.0 % de los 20 mejores equipos
- ⚠️ Elefante: presente en el 60.0 % de los 20 mejores equipos

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 52.3 % | ⚠️ |
| Duelos por partida (media) | 25.8 | ⚠️ |
| Partidas que llegan al límite de duelos | 4.8 % | ✅ |
| Partidas empatadas | 0.2 % | — |
| Win rate del atacante por duelo | 90.5 % | ✅ |
| Duelos empatados | 0.1 % | ✅ |
| Defensas forzadas por partida | 1.0 | ✅ |
| Daño medio por duelo | 31.6 | — |

## Animales

| Animal | Win rate | Estado | En los 20 mejores equipos | % de ataques | Win rate atacando |
|---|---|---|---|---|---|
| Guepardo | 56.4 % | ⚠️ | 60.0 % | 11.7 % | 91.1 % |
| Águila real | 56.2 % | ⚠️ | 80.0 % | 11.1 % | 90.1 % |
| Tigre | 56.2 % | ⚠️ | 55.0 % | 9.6 % | 91.3 % |
| Elefante | 52.4 % | ✅ | 60.0 % | 9.9 % | 87.9 % |
| Rinoceronte | 49.8 % | ✅ | 45.0 % | 9.1 % | 89.3 % |
| Pingüino | 48.8 % | ✅ | 15.0 % | 8.0 % | 91.7 % |
| Oso pardo | 47.4 % | ✅ | 20.0 % | 7.2 % | 92.7 % |
| Ballena | 46.9 % | ✅ | 35.0 % | 9.5 % | 89.7 % |
| Tiburón blanco | 45.8 % | ✅ | 15.0 % | 9.7 % | 90.6 % |
| Lobo | 45.0 % | ⚠️ | 5.0 % | 7.0 % | 93.1 % |
| Cocodrilo | 45.0 % | ⚠️ | 10.0 % | 7.2 % | 89.7 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 18.2 % | ✅ | 92.0 % |
| Fuerza | 6.1 % | ✅ | 87.8 % |
| Agilidad | 17.4 % | ✅ | 92.1 % |
| Ataque | 8.7 % | ✅ | 89.5 % |
| Resistencia | 7.7 % | ✅ | 88.2 % |
| Velocidad | 15.4 % | ✅ | 90.2 % |
| Defensa | 15.2 % | ✅ | 90.5 % |
| Percepción | 11.3 % | ✅ | 90.2 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 13.3 % | ✅ | 87.5 % |
| Agua | 34.0 % | ✅ | 91.3 % |
| Tierra | 34.3 % | ✅ | 90.9 % |
| Árboles | 18.4 % | ✅ | 90.6 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Guepardo | 3.7 % (76.7 %) | 0.6 % (0.0 %) | 59.9 % (90.3 %) | 35.8 % (95.4 %) |
| Águila real | 75.8 % (91.5 %) | 3.1 % (67.4 %) | 2.3 % (62.5 %) | 18.7 % (91.5 %) |
| Tigre | 0.7 % (0.0 %) | 7.3 % (86.5 %) | 20.5 % (93.6 %) | 71.5 % (92.1 %) |
| Elefante | 7.7 % (78.4 %) | 17.0 % (88.4 %) | 72.6 % (89.7 %) | 2.6 % (61.2 %) |
| Rinoceronte | 10.1 % (88.0 %) | 4.6 % (79.8 %) | 81.5 % (90.7 %) | 3.8 % (74.6 %) |
| Pingüino | 5.3 % (84.4 %) | 76.7 % (92.5 %) | 15.7 % (94.0 %) | 2.4 % (68.9 %) |
| Oso pardo | 3.6 % (77.6 %) | 7.8 % (89.3 %) | 41.6 % (94.6 %) | 47.0 % (92.8 %) |
| Ballena | 7.0 % (82.0 %) | 87.2 % (91.9 %) | 1.2 % (37.2 %) | 4.7 % (72.9 %) |
| Tiburón blanco | 5.8 % (77.6 %) | 89.3 % (92.6 %) | 1.1 % (52.4 %) | 3.8 % (73.8 %) |
| Lobo | 6.5 % (89.0 %) | 21.6 % (94.0 %) | 69.9 % (93.9 %) | 2.0 % (68.9 %) |
| Cocodrilo | 4.6 % (75.8 %) | 77.6 % (91.5 %) | 15.2 % (88.9 %) | 2.5 % (65.4 %) |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 90.5 % | 0.1 % | 9.4 % |
| +5 | 85.5 % | 3.1 % | 11.4 % |
| +10 | 78.6 % | 0.8 % | 20.6 % |
| +15 | 61.8 % | 4.5 % | 33.7 % |
| +20 | 51.4 % | 1.5 % | 47.1 % |
| +25 | 39.8 % | 3.3 % | 56.8 % |
| +30 | 34.7 % | 0.9 % | 64.4 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Ballena, Elefante, Águila real, Tigre | 77.1 % |
| 2 | Águila real, Rinoceronte, Tigre, Lobo | 76.5 % |
| 3 | Guepardo, Elefante, Águila real, Tiburón blanco | 75.9 % |
| 4 | Guepardo, Elefante, Tiburón blanco, Pingüino | 75.8 % |
| 5 | Guepardo, Elefante, Águila real, Tigre | 75.2 % |
| 6 | Águila real, Pingüino, Rinoceronte, Tigre | 74.4 % |
| 7 | Ballena, Guepardo, Elefante, Águila real | 74.2 % |
| 8 | Ballena, Oso pardo, Águila real, Tigre | 74.0 % |
| 9 | Guepardo, Cocodrilo, Águila real, Rinoceronte | 73.9 % |
| 10 | Guepardo, Elefante, Águila real, Rinoceronte | 73.9 % |
| 11 | Ballena, Guepardo, Elefante, Tigre | 72.7 % |
| 12 | Elefante, Águila real, Rinoceronte, Tigre | 72.3 % |
| 13 | Oso pardo, Guepardo, Elefante, Tigre | 71.7 % |
| 14 | Cocodrilo, Águila real, Rinoceronte, Tigre | 71.5 % |
| 15 | Ballena, Guepardo, Elefante, Tiburón blanco | 71.4 % |
| 16 | Elefante, Águila real, Pingüino, Tigre | 71.4 % |
| 17 | Ballena, Guepardo, Águila real, Rinoceronte | 71.0 % |
| 18 | Ballena, Águila real, Rinoceronte, Tigre | 70.5 % |
| 19 | Oso pardo, Guepardo, Elefante, Águila real | 70.5 % |
| 20 | Oso pardo, Guepardo, Águila real, Rinoceronte | 70.5 % |
