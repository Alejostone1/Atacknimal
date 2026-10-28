# Informe de balance · ruleset 0.1.0 · política `blind`

> 20.000 partidas 1v1 · 567.796 duelos · muestra de 20000 emparejamientos · semilla 1 · 17 s
> Objetivos y umbrales: `packages/content/data/balance/0.1.0.json` (docs/BALANCE.md §7.2).
> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.

## Alertas

- ⚠️ Win rate del primer jugador: 53.7 %
- 🔴 Duelos por partida (media): 28.4
- 🔴 Partidas que llegan al límite de duelos: 49.5 %
- ⚠️ Win rate del atacante por duelo: 62.8 %
- 🔴 Duelos empatados: 36.4 %
- ⚠️ Defensas forzadas por partida: 0.0
- 🔴 Elefante: win rate 64.1 %
- 🔴 Águila real: win rate 61.5 %
- ⚠️ Ballena: win rate 55.9 %
- ⚠️ Rinoceronte: win rate 55.9 %
- ⚠️ Oso pardo: win rate 44.5 %
- ⚠️ Tigre: win rate 42.9 %
- ⚠️ Lobo: win rate 42.6 %
- 🔴 Tiburón blanco: win rate 42.0 %
- 🔴 Elefante: presente en el 90.0 % de los 20 mejores equipos
- 🔴 Águila real: presente en el 80.0 % de los 20 mejores equipos
- ⚠️ Ballena: presente en el 65.0 % de los 20 mejores equipos
- ⚠️ Rinoceronte: presente en el 60.0 % de los 20 mejores equipos
- ⚠️ Atributo Peso: uso 23.0 %
- ⚠️ Hábitat Tierra: uso 52.7 %
- 🔴 Hábitat Árboles: uso 0.0 %

## Partida

| Métrica | Valor | Estado |
|---|---|---|
| Win rate del primer jugador | 53.7 % | ⚠️ |
| Duelos por partida (media) | 28.4 | 🔴 |
| Partidas que llegan al límite de duelos | 49.5 % | 🔴 |
| Partidas empatadas | 2.2 % | — |
| Win rate del atacante por duelo | 62.8 % | ⚠️ |
| Duelos empatados | 36.4 % | 🔴 |
| Defensas forzadas por partida | 0.0 | ⚠️ |
| Daño medio por duelo | 20.8 | — |

## Animales

| Animal | Win rate | Estado | En los 20 mejores equipos | % de ataques | Win rate atacando |
|---|---|---|---|---|---|
| Elefante | 64.1 % | 🔴 | 90.0 % | 18.2 % | 53.1 % |
| Águila real | 61.5 % | 🔴 | 80.0 % | 10.2 % | 68.2 % |
| Ballena | 55.9 % | ⚠️ | 65.0 % | 23.2 % | 49.1 % |
| Rinoceronte | 55.9 % | ⚠️ | 60.0 % | 9.1 % | 80.5 % |
| Guepardo | 49.0 % | ✅ | 20.0 % | 15.2 % | 58.6 % |
| Cocodrilo | 45.8 % | ✅ | 15.0 % | 3.2 % | 76.0 % |
| Pingüino | 45.8 % | ✅ | 15.0 % | 4.7 % | 67.5 % |
| Oso pardo | 44.5 % | ⚠️ | 25.0 % | 3.7 % | 71.2 % |
| Tigre | 42.9 % | ⚠️ | 10.0 % | 5.0 % | 84.5 % |
| Lobo | 42.6 % | ⚠️ | 15.0 % | 1.6 % | 81.2 % |
| Tiburón blanco | 42.0 % | 🔴 | 5.0 % | 6.0 % | 81.1 % |

## Atributos (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Peso | 23.0 % | ⚠️ | 52.6 % |
| Fuerza | 10.0 % | ✅ | 48.8 % |
| Agilidad | 8.5 % | ✅ | 45.3 % |
| Ataque | 11.1 % | ✅ | 84.7 % |
| Resistencia | 17.6 % | ✅ | 59.6 % |
| Velocidad | 10.6 % | ✅ | 65.6 % |
| Defensa | 9.5 % | ✅ | 83.7 % |
| Percepción | 9.6 % | ✅ | 73.6 % |

## Hábitats (elegidos por el atacante)

| | Uso | Estado | Win rate del atacante |
|---|---|---|---|
| Aire | 10.2 % | ✅ | 68.2 % |
| Agua | 37.1 % | ✅ | 58.9 % |
| Tierra | 52.7 % | ⚠️ | 64.4 % |
| Árboles | 0.0 % | 🔴 | 0.0 % |

## Hábitat elegido por cada animal al atacar

Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Elefante | — | — | 100.0 % (53.1 %) | — |
| Águila real | 100.0 % (68.2 %) | — | — | — |
| Ballena | — | 100.0 % (49.1 %) | — | — |
| Rinoceronte | — | — | 100.0 % (80.5 %) | — |
| Guepardo | — | — | 100.0 % (58.6 %) | — |
| Cocodrilo | — | 100.0 % (76.0 %) | — | — |
| Pingüino | — | 100.0 % (67.5 %) | — | — |
| Oso pardo | — | — | 100.0 % (71.2 %) | — |
| Tigre | — | — | 100.0 % (84.5 %) | — |
| Lobo | — | — | 100.0 % (81.2 %) | — |
| Tiburón blanco | — | 100.0 % (81.1 %) | — | — |

## Márgenes de los duelos

Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta
simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.

| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |
|---|---|---|---|
| +0 | 62.8 % | 36.4 % | 0.9 % |
| +5 | 61.6 % | 0.0 % | 38.4 % |
| +10 | 53.7 % | 4.1 % | 42.2 % |
| +15 | 46.7 % | 0.4 % | 52.9 % |
| +20 | 32.6 % | 6.0 % | 61.4 % |
| +25 | 25.7 % | 1.1 % | 73.2 % |
| +30 | 20.4 % | 1.1 % | 78.4 % |

## Los 20 mejores equipos

| # | Equipo | Win rate |
|---|---|---|
| 1 | Elefante, Águila real, Pingüino, Rinoceronte | 94.3 % |
| 2 | Ballena, Oso pardo, Elefante, Águila real | 91.7 % |
| 3 | Ballena, Elefante, Águila real, Rinoceronte | 91.5 % |
| 4 | Cocodrilo, Elefante, Águila real, Rinoceronte | 90.5 % |
| 5 | Ballena, Cocodrilo, Elefante, Águila real | 89.9 % |
| 6 | Ballena, Guepardo, Elefante, Águila real | 88.1 % |
| 7 | Elefante, Águila real, Rinoceronte, Tigre | 86.2 % |
| 8 | Guepardo, Elefante, Águila real, Rinoceronte | 86.0 % |
| 9 | Ballena, Cocodrilo, Águila real, Rinoceronte | 85.0 % |
| 10 | Ballena, Elefante, Águila real, Tigre | 85.0 % |
| 11 | Elefante, Águila real, Rinoceronte, Lobo | 84.3 % |
| 12 | Ballena, Elefante, Águila real, Pingüino | 84.1 % |
| 13 | Ballena, Elefante, Águila real, Lobo | 84.1 % |
| 14 | Oso pardo, Elefante, Águila real, Pingüino | 83.8 % |
| 15 | Ballena, Guepardo, Elefante, Rinoceronte | 83.8 % |
| 16 | Ballena, Oso pardo, Guepardo, Elefante | 82.7 % |
| 17 | Ballena, Elefante, Rinoceronte, Lobo | 82.5 % |
| 18 | Ballena, Oso pardo, Águila real, Rinoceronte | 82.1 % |
| 19 | Ballena, Elefante, Tiburón blanco, Rinoceronte | 81.7 % |
| 20 | Oso pardo, Elefante, Águila real, Rinoceronte | 81.7 % |
