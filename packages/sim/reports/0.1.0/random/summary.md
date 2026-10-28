# Informe de balance · ruleset 0.1.0 · política `random`

> 108.900 partidas 1v1 · 3.236.947 duelos · round-robin completo · semilla 1 · 65 s
> Objetivos y umbrales: `packages/content/data/balance/0.1.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- 🔴 Duelos por partida (media): 29.7
- 🔴 Partidas que llegan al límite de duelos: 86.7 %
- ⚠️ Win rate del atacante por duelo: 43.9 %
- 🔴 Duelos empatados: 12.3 %
- ⚠️ Defensas forzadas por partida: 0.1
- ⚠️ Águila real: win rate 57.7 %
- ⚠️ Oso pardo: win rate 56.0 %
- ⚠️ Tiburón blanco: win rate 43.8 %
- 🔴 Águila real: presente en el 100.0 % de los 20 mejores equipos
- 🔴 Oso pardo: presente en el 90.0 % de los 20 mejores equipos

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 50.2 % | ✅ |
| Duelos por partida (media) | 29.7 | 🔴 |
| Partidas que llegan al límite de duelos | 86.7 % | 🔴 |
| Partidas empatadas | 0.2 % | — |
| Win rate del atacante por duelo | 43.9 % | ⚠️ |
| Duelos empatados | 12.3 % | 🔴 |
| Defensas forzadas por partida | 0.1 | ⚠️ |
| Daño medio por duelo | 21.5 | — |

## Animales

| Animal | Win rate | Estado | En los 20 mejores equipos | % de ataques | Win rate atacando |
|---|---|---|---|---|---|
| Águila real | 57.7 % | ⚠️ | 100.0 % | 9.6 % | 53.0 % |
| Oso pardo | 56.0 % | ⚠️ | 90.0 % | 9.7 % | 50.2 % |
| Tigre | 53.3 % | ✅ | 45.0 % | 9.4 % | 45.9 % |
| Elefante | 50.5 % | ✅ | 30.0 % | 9.3 % | 44.9 % |
| Cocodrilo | 49.3 % | ✅ | 25.0 % | 9.2 % | 42.2 % |
| Pingüino | 49.1 % | ✅ | 30.0 % | 8.8 % | 44.2 % |
| Lobo | 48.9 % | ✅ | 30.0 % | 9.1 % | 42.8 % |
| Rinoceronte | 47.8 % | ✅ | 20.0 % | 9.0 % | 40.9 % |
| Guepardo | 47.3 % | ✅ | 25.0 % | 8.7 % | 40.7 % |
| Ballena | 46.2 % | ✅ | 5.0 % | 8.7 % | 40.2 % |
| Tiburón blanco | 43.8 % | ⚠️ | 0.0 % | 8.5 % | 36.6 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 12.5 % | ✅ | 44.1 % |
| Fuerza | 12.5 % | ✅ | 43.4 % |
| Agilidad | 12.5 % | ✅ | 44.3 % |
| Ataque | 12.5 % | ✅ | 44.3 % |
| Resistencia | 12.5 % | ✅ | 44.8 % |
| Velocidad | 12.5 % | ✅ | 43.0 % |
| Defensa | 12.5 % | ✅ | 44.0 % |
| Percepción | 12.5 % | ✅ | 43.6 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 25.0 % | ✅ | 43.3 % |
| Agua | 25.0 % | ✅ | 43.6 % |
| Tierra | 25.0 % | ✅ | 44.4 % |
| Árboles | 25.0 % | ✅ | 44.3 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Águila real | 25.1 % (70.4 %) | 25.0 % (42.3 %) | 24.9 % (41.4 %) | 25.0 % (57.9 %) |
| Oso pardo | 25.0 % (41.5 %) | 25.0 % (41.5 %) | 24.9 % (54.8 %) | 25.1 % (63.1 %) |
| Tigre | 25.0 % (35.0 %) | 25.0 % (40.6 %) | 24.9 % (51.0 %) | 25.1 % (56.9 %) |
| Elefante | 25.0 % (43.9 %) | 25.0 % (45.2 %) | 25.0 % (52.7 %) | 25.0 % (37.8 %) |
| Cocodrilo | 25.0 % (39.0 %) | 25.0 % (53.4 %) | 25.0 % (44.2 %) | 25.0 % (32.0 %) |
| Pingüino | 25.0 % (41.4 %) | 24.9 % (53.9 %) | 25.1 % (41.5 %) | 25.0 % (40.3 %) |
| Lobo | 25.0 % (40.3 %) | 25.0 % (40.5 %) | 24.9 % (56.0 %) | 25.1 % (34.6 %) |
| Rinoceronte | 25.0 % (40.4 %) | 24.9 % (35.9 %) | 24.9 % (52.4 %) | 25.1 % (34.8 %) |
| Guepardo | 25.1 % (36.7 %) | 24.9 % (21.3 %) | 25.0 % (49.4 %) | 25.0 % (55.2 %) |
| Ballena | 24.9 % (44.0 %) | 25.0 % (50.6 %) | 25.0 % (26.9 %) | 25.1 % (39.4 %) |
| Tiburón blanco | 25.0 % (43.0 %) | 25.1 % (55.2 %) | 24.9 % (15.5 %) | 25.0 % (32.6 %) |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 43.9 % | 12.3 % | 43.7 % |
| +5 | 38.0 % | 1.4 % | 60.6 % |
| +10 | 32.4 % | 2.0 % | 65.6 % |
| +15 | 27.6 % | 1.2 % | 71.1 % |
| +20 | 23.2 % | 1.4 % | 75.4 % |
| +25 | 19.6 % | 0.9 % | 79.5 % |
| +30 | 16.1 % | 1.3 % | 82.5 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Oso pardo, Águila real, Pingüino, Tigre | 74.2 % |
| 2 | Oso pardo, Elefante, Águila real, Tigre | 72.8 % |
| 3 | Oso pardo, Águila real, Rinoceronte, Tigre | 71.8 % |
| 4 | Ballena, Oso pardo, Águila real, Tigre | 71.7 % |
| 5 | Oso pardo, Guepardo, Águila real, Tigre | 70.8 % |
| 6 | Oso pardo, Cocodrilo, Águila real, Tigre | 69.7 % |
| 7 | Oso pardo, Águila real, Tigre, Lobo | 69.0 % |
| 8 | Oso pardo, Águila real, Pingüino, Lobo | 68.1 % |
| 9 | Oso pardo, Guepardo, Elefante, Águila real | 67.7 % |
| 10 | Oso pardo, Elefante, Águila real, Pingüino | 67.6 % |
| 11 | Oso pardo, Águila real, Rinoceronte, Lobo | 67.1 % |
| 12 | Oso pardo, Elefante, Águila real, Rinoceronte | 66.8 % |
| 13 | Cocodrilo, Águila real, Tigre, Lobo | 66.3 % |
| 14 | Oso pardo, Cocodrilo, Elefante, Águila real | 66.1 % |
| 15 | Elefante, Águila real, Pingüino, Tigre | 66.1 % |
| 16 | Oso pardo, Guepardo, Águila real, Pingüino | 66.0 % |
| 17 | Oso pardo, Cocodrilo, Águila real, Lobo | 65.5 % |
| 18 | Oso pardo, Guepardo, Cocodrilo, Águila real | 65.2 % |
| 19 | Oso pardo, Águila real, Pingüino, Rinoceronte | 65.2 % |
| 20 | Oso pardo, Guepardo, Águila real, Lobo | 64.7 % |
