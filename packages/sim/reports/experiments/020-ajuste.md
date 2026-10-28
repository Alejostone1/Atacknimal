# Experimento: Ajuste de la versión 0.2.0 (ronda 4)

> Base: balance 0.2.0 · política `greedy` · 20.000 partidas por variante · semilla 1 · 81 s
> Leyenda de variantes: **A+n** ventaja defensiva +n · **Bn** el atributo del atacante queda bloqueado para su equipo n ataques · **Cn** el equipo no repite hábitat en n ataques · **aire neutral** los no voladores pasan de Hostil a Neutral en Aire.
> **Criterio**: ninguna alerta en primer jugador, animales (42–58 %), duración, empates ni partidas que llegan al límite — #029. Además, la variante debe respetar el presupuesto de BALANCE §2.

| Variante | Gana el atacante | Primer jugador | Duelos | Llegan al límite | Empates | Águila | Más débil | Más fuerte | Animales fuera de 45–55 % | Presupuesto | Criterio |
|---|---|---|---|---|---|---|---|---|---|---|---|
| base 0.2.0 | 90.5 % | 52.8 % | 25.0 | 3.0 % | 0.1 % | 66.0 % | Lobo 41.4 % | Águila real 66.0 % | 5 | ✅ | — |
| ronda 3 | 90.8 % | 52.1 % | 25.8 | 4.4 % | 0.1 % | 58.4 % | Cocodrilo 45.1 % | Águila real 58.4 % | 2 | ✅ | — |
| r3 + águila 3 | 90.6 % | 52.2 % | 25.8 | 4.7 % | 0.1 % | 56.0 % | Cocodrilo 45.1 % | Tigre 56.6 % | 3 | ✅ | ✅ |
| r3 + águila 3 + cocodrilo | 90.6 % | 52.4 % | 25.8 | 4.7 % | 0.1 % | 56.2 % | Cocodrilo 45.2 % | Tigre 56.5 % | 3 | ✅ | ✅ |
| r3 + águila 3 + cocodrilo + daño plano | 90.7 % | 52.6 % | 25.7 | 3.7 % | 0.1 % | 56.0 % | Cocodrilo 44.4 % | Guepardo 56.4 % | 4 | ✅ | ✅ |

## Win rate por animal

| Animal | base 0.2.0 | ronda 3 | r3 + águila 3 | r3 + águila 3 + cocodrilo | r3 + águila 3 + cocodrilo + daño plano |
|---|---|---|---|---|---|
| Guepardo | 60.3 % | 56.7 % | 56.2 % | 56.1 % | 56.4 % |
| Águila real | 66.0 % | 58.4 % | 56.0 % | 56.2 % | 56.0 % |
| Oso pardo | 48.8 % | 47.0 % | 46.7 % | 46.7 % | 46.2 % |
| Tiburón blanco | 41.8 % | 45.7 % | 45.8 % | 45.3 % | 46.6 % |
| Lobo | 41.4 % | 45.2 % | 45.7 % | 45.4 % | 45.5 % |
| Elefante | 50.5 % | 52.4 % | 52.1 % | 52.4 % | 52.9 % |
| Rinoceronte | 49.3 % | 49.6 % | 49.8 % | 49.8 % | 49.9 % |
| Cocodrilo | 43.9 % | 45.1 % | 45.1 % | 45.2 % | 44.4 % |
| Tigre | 54.2 % | 53.9 % | 56.6 % | 56.5 % | 56.3 % |
| Pingüino | 47.3 % | 48.7 % | 49.3 % | 49.6 % | 48.4 % |
| Ballena | 46.6 % | 47.5 % | 46.8 % | 46.9 % | 47.5 % |
