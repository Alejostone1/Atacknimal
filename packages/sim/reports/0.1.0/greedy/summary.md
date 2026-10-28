# Informe de balance · ruleset 0.1.0 · política `greedy`

> 108.900 partidas 1v1 · 2.691.147 duelos · round-robin completo · semilla 1 · 220 s
> Objetivos y umbrales: `packages/content/data/balance/0.1.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- 🔴 Win rate del primer jugador: 62.3 %
- ⚠️ Duelos por partida (media): 24.7
- 🔴 Partidas que llegan al límite de duelos: 11.5 %
- 🔴 Win rate del atacante por duelo: 92.2 %
- ⚠️ Duelos empatados: 7.8 %
- 🔴 Águila real: win rate 69.6 %
- ⚠️ Tiburón blanco: win rate 43.9 %
- ⚠️ Lobo: win rate 43.7 %
- ⚠️ Ballena: win rate 42.4 %
- 🔴 Águila real: presente en el 100.0 % de los 20 mejores equipos
- ⚠️ Oso pardo: presente en el 65.0 % de los 20 mejores equipos

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 62.3 % | 🔴 |
| Duelos por partida (media) | 24.7 | ⚠️ |
| Partidas que llegan al límite de duelos | 11.5 % | 🔴 |
| Partidas empatadas | 0.3 % | — |
| Win rate del atacante por duelo | 92.2 % | 🔴 |
| Duelos empatados | 7.8 % | ⚠️ |
| Defensas forzadas por partida | 1.0 | ✅ |
| Daño medio por duelo | 33.9 | — |

## Animales

| Animal | Win rate | Estado | En los 20 mejores equipos | % de ataques | Win rate atacando |
|---|---|---|---|---|---|
| Águila real | 69.6 % | 🔴 | 100.0 % | 14.3 % | 93.9 % |
| Tigre | 54.3 % | ✅ | 50.0 % | 9.5 % | 93.2 % |
| Oso pardo | 52.2 % | ✅ | 65.0 % | 8.5 % | 94.3 % |
| Elefante | 51.2 % | ✅ | 50.0 % | 9.4 % | 90.1 % |
| Guepardo | 50.3 % | ✅ | 20.0 % | 11.1 % | 91.4 % |
| Rinoceronte | 48.3 % | ✅ | 40.0 % | 8.4 % | 91.4 % |
| Cocodrilo | 48.1 % | ✅ | 30.0 % | 7.2 % | 92.6 % |
| Pingüino | 46.1 % | ✅ | 10.0 % | 7.6 % | 93.6 % |
| Tiburón blanco | 43.9 % | ⚠️ | 15.0 % | 7.9 % | 90.1 % |
| Lobo | 43.7 % | ⚠️ | 10.0 % | 6.3 % | 93.8 % |
| Ballena | 42.4 % | ⚠️ | 10.0 % | 9.5 % | 89.9 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 15.1 % | ✅ | 93.3 % |
| Fuerza | 9.1 % | ✅ | 89.2 % |
| Agilidad | 15.7 % | ✅ | 93.8 % |
| Ataque | 9.9 % | ✅ | 90.3 % |
| Resistencia | 10.6 % | ✅ | 91.0 % |
| Velocidad | 13.7 % | ✅ | 92.6 % |
| Defensa | 12.5 % | ✅ | 92.5 % |
| Percepción | 13.4 % | ✅ | 92.7 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 19.3 % | ✅ | 89.8 % |
| Agua | 31.6 % | ✅ | 93.8 % |
| Tierra | 29.8 % | ✅ | 93.5 % |
| Árboles | 19.2 % | ✅ | 89.9 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Águila real | 96.0 % (97.8 %) | 1.2 % (0.0 %) | 1.2 % (0.0 %) | 1.6 % (0.0 %) |
| Tigre | 1.4 % (9.2 %) | 13.1 % (89.1 %) | 25.9 % (92.2 %) | 59.6 % (96.5 %) |
| Oso pardo | 3.1 % (61.6 %) | 9.4 % (87.9 %) | 36.4 % (96.0 %) | 51.1 % (96.3 %) |
| Elefante | 8.7 % (72.1 %) | 24.7 % (90.1 %) | 64.0 % (95.5 %) | 2.6 % (17.4 %) |
| Guepardo | 3.6 % (43.4 %) | 1.3 % (0.0 %) | 35.1 % (92.8 %) | 60.1 % (95.4 %) |
| Rinoceronte | 12.1 % (81.6 %) | 9.0 % (79.2 %) | 74.6 % (96.3 %) | 4.3 % (60.8 %) |
| Cocodrilo | 4.6 % (61.1 %) | 72.7 % (96.7 %) | 19.9 % (90.8 %) | 2.8 % (50.6 %) |
| Pingüino | 6.9 % (78.0 %) | 72.4 % (97.0 %) | 18.1 % (92.2 %) | 2.6 % (50.6 %) |
| Tiburón blanco | 7.5 % (62.0 %) | 85.0 % (95.9 %) | 2.0 % (28.6 %) | 5.6 % (61.4 %) |
| Lobo | 10.9 % (87.2 %) | 11.3 % (87.3 %) | 74.3 % (97.0 %) | 3.5 % (67.4 %) |
| Ballena | 8.3 % (67.6 %) | 83.7 % (96.2 %) | 2.1 % (18.3 %) | 5.9 % (57.4 %) |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 92.2 % | 7.8 % | 0.0 % |
| +5 | 90.9 % | 0.1 % | 9.0 % |
| +10 | 87.1 % | 1.5 % | 11.4 % |
| +15 | 81.7 % | 0.9 % | 17.4 % |
| +20 | 69.9 % | 3.9 % | 26.3 % |
| +25 | 59.4 % | 2.2 % | 38.4 % |
| +30 | 51.5 % | 2.0 % | 46.5 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Oso pardo, Elefante, Águila real, Tigre | 90.7 % |
| 2 | Ballena, Águila real, Rinoceronte, Tigre | 88.3 % |
| 3 | Elefante, Águila real, Rinoceronte, Tigre | 87.6 % |
| 4 | Cocodrilo, Elefante, Águila real, Tigre | 87.2 % |
| 5 | Oso pardo, Cocodrilo, Águila real, Tigre | 87.0 % |
| 6 | Oso pardo, Águila real, Rinoceronte, Tigre | 86.5 % |
| 7 | Elefante, Águila real, Pingüino, Tigre | 85.7 % |
| 8 | Oso pardo, Guepardo, Elefante, Águila real | 85.6 % |
| 9 | Guepardo, Cocodrilo, Elefante, Águila real | 84.0 % |
| 10 | Oso pardo, Elefante, Águila real, Lobo | 83.9 % |
| 11 | Elefante, Águila real, Tiburón blanco, Rinoceronte | 83.6 % |
| 12 | Oso pardo, Águila real, Rinoceronte, Lobo | 83.5 % |
| 13 | Ballena, Oso pardo, Águila real, Tigre | 83.3 % |
| 14 | Oso pardo, Guepardo, Águila real, Rinoceronte | 82.9 % |
| 15 | Oso pardo, Cocodrilo, Elefante, Águila real | 82.8 % |
| 16 | Oso pardo, Elefante, Águila real, Tiburón blanco | 82.6 % |
| 17 | Cocodrilo, Águila real, Rinoceronte, Tigre | 82.6 % |
| 18 | Oso pardo, Águila real, Pingüino, Tigre | 82.2 % |
| 19 | Oso pardo, Guepardo, Cocodrilo, Águila real | 82.0 % |
| 20 | Oso pardo, Águila real, Tiburón blanco, Rinoceronte | 81.5 % |
