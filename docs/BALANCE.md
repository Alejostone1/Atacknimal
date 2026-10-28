# ATACKNIMAL · Balance

> **Ruleset v0.1** · Estado: método cerrado y perfiles iniciales **sin validar por simulación** (la simulación llega en la Fase 4).
> Las reglas que se equilibran aquí están en [GAME_RULES.md](GAME_RULES.md). El razonamiento completo está en [00-ANALISIS-FASE-0.md](00-ANALISIS-FASE-0.md) §J.

---

## 1. Principios

1. **Datos reales ≠ estadísticas de juego.** Los datos zoológicos (masa, velocidad máxima, etc.) se guardan aparte (`facts`, con su fuente) e inspiran la identidad de cada animal. **Nunca** entran en el cálculo de un duelo. Las estadísticas de juego son valores de diseño.
2. **Ningún animal gana siempre.** El más grande, el más rápido o el más fuerte tienen un camino claro para ganar y varios para perder.
3. **El valor de una carta está en sus picos, no en su suma.** El atacante elige el atributo, así que una carta vale por sus mejores atributos. El defensor elige la mejor respuesta, así que un equipo defiende con su máximo por atributo.
4. **Todo número es un parámetro versionado.** Ninguna estadística ni modificador se escribe en el código de React, Phaser o el motor: vive en `packages/content`.
5. **El balance se mide, no se opina.** Ningún cambio de balance se acepta sin simulación antes y después.

---

## 2. Reglas de presupuesto de un perfil

Todo perfil de animal publicado debe cumplir **todas** estas reglas. Un test automático las validará en la Fase 4.

| Regla | Valor v0.1 | Motivo |
|---|---|---|
| Suma de los 8 atributos | **560 ± 15** (545–575) | Poder total comparable |
| Picos (≥ 88) | **2**, o **3** si tiene un valle ≤ 35 | Identidad clara; un tercer pico se paga con una debilidad profunda |
| Valles (≤ 50) | **≥ 2** | Debilidad explotable: contraestrategia |
| Franja 85–87 | **Prohibida** | Evita "casi especialistas" que distorsionan la cobertura |
| Valor 100 | Como mucho **1 animal por atributo** | Firma del animal sin monopolio |
| Cobertura por atributo | **2–3 animales ≥ 85** en el roster | Ningún atributo sin respuesta ni monopolizado |
| Rango de valores | 10–100 | — |

**Por qué hace falta (correlación física):** Peso, Fuerza, Resistencia y Defensa son altas a la vez en los animales grandes, y Agilidad y Velocidad en los pequeños. Si se copiara la biología, los gigantes acumularían 4 picos. El presupuesto obliga a elegir qué rasgos definen al animal **en el juego**.

---

## 3. Perfiles v0.1

Abreviaturas: PE Peso · FU Fuerza · AG Agilidad · AT Ataque · RE Resistencia · VE Velocidad · DE Defensa · PC Percepción. Los **picos** (≥ 88) van en negrita y los *valles* (≤ 50) en cursiva.

| Animal | PE | FU | AG | AT | RE | VE | DE | PC | Suma | Rol |
|---|---|---|---|---|---|---|---|---|---|---|
| Guepardo | *35* | 58 | **92** | 82 | 62 | **100** | *45* | 82 | 556 | Especialista veloz |
| Águila real | *15* | *45* | **90** | 84 | 70 | **88** | 66 | **100** | 558 | Dominio aéreo |
| Oso pardo | 84 | **92** | *45* | 80 | 80 | *40* | **88** | 60 | 569 | Tanque |
| Tiburón blanco | 80 | 82 | *45* | **96** | 62 | **88** | *50* | 62 | 565 | Depredador acuático |
| Lobo | *45* | 62 | 78 | 76 | **90** | 80 | *50* | **88** | 569 | Versátil |
| Elefante | **100** | **94** | *30* | 72 | 82 | *40* | 80 | 70 | 568 | Coloso |
| Rinoceronte | **90** | 84 | *35* | 80 | 78 | *45* | **100** | *45* | 557 | Muralla |
| Cocodrilo | 78 | 84 | *40* | **90** | 75 | *45* | **90** | 60 | 562 | Emboscador |
| Tigre | 65 | 82 | **88** | **94** | *48* | 80 | *48* | 60 | 565 | Duelista ofensivo |
| Pingüino | *35* | *40* | 82 | *49* | **92** | 82 | 80 | **90** | 550 | Resistencia acuática |
| Ballena | **96** | 84 | *25* | *40* | **100** | 70 | 76 | 75 | 566 | Coloso acuático |

Rango de sumas: 550–569 (±1,7 % sobre 560). En la tabla del documento maestro era 520–688 (±16 %).

### 3.1 Cobertura por atributo (verificada)

| Atributo | Especialistas (≥ 85) | 100 |
|---|---|---|
| Peso | Elefante 100, Ballena 96, Rinoceronte 90 | Elefante |
| Fuerza | Elefante 94, Oso 92 | — |
| Agilidad | Guepardo 92, Águila 90, Tigre 88 | — |
| Ataque | Tiburón 96, Tigre 94, Cocodrilo 90 | — |
| Resistencia | Ballena 100, Pingüino 92, Lobo 90 | Ballena |
| Velocidad | Guepardo 100, Tiburón 88, Águila 88 | Guepardo |
| Defensa | Rinoceronte 100, Cocodrilo 90, Oso 88 | Rinoceronte |
| Percepción | Águila 100, Pingüino 90, Lobo 88 | Águila |

Fuerza solo tiene 2 especialistas, pero hay 5 animales con 82–84 que la vuelven disputada. Es aceptable y lo vigilaremos.

### 3.2 Cambios respecto al material original

| Animal | Cambio principal | Motivo |
|---|---|---|
| Ballena | De 688 a 566. Ataque de 80 a 40 y Percepción de 90 a 75 | No tenía debilidad real. La ballena azul se alimenta por filtración, así que un Ataque bajo es coherente con su identidad |
| Tiburón blanco | De 678 a 565. Percepción de 85 a 62, Defensa de 75 a 50 | No tenía valles |
| Tigre | De 669 a 565. Resistencia y Defensa en 48 | Superaba al Guepardo en casi todo |
| Pingüino | De 520 a 550, perfil de Resistencia, Percepción y movilidad media | Era la carta más débil en ambas tablas |
| Lobo | Picos de Resistencia y Percepción | Su "versatilidad" lo hacía irrelevante (ver §8) |
| Águila real | Tres picos (AG, VE, PC) pagados con Peso 15 | Identidad aérea completa con una debilidad profunda |
| Elefante / Rinoceronte | Peso 100 solo para el Elefante; Defensa 100 para el Rinoceronte | Había dos animales con Peso 100 |

---

## 4. Afinidad de hábitat v0.1

Modificadores ([GAME_RULES.md](GAME_RULES.md) §6.1): **N** Nativo +10 · **A** Adaptado +4 · **0** Neutral · **H** Hostil −15.

| Animal | Aire | Agua | Tierra | Árboles |
|---|---|---|---|---|
| Guepardo | H | H | **N** | A |
| Águila real | **N** | 0 | 0 | A |
| Oso pardo | H | A | **N** | 0 |
| Tiburón blanco | H | **N** | H | H |
| Lobo | H | 0 | **N** | H |
| Elefante | H | A | **N** | H |
| Rinoceronte | H | 0 | **N** | H |
| Cocodrilo | H | **N** | A | H |
| Tigre | H | A | **N** | A |
| Pingüino | H | **N** | A | H |
| Ballena | H | **N** | H | H |

| Hábitat | Nativos | Adaptados | Lectura |
|---|---|---|---|
| Aire | Águila | — | **Arena del Águila**: +25 relativos contra cualquier rival. Vigilar (§8) |
| Agua | Tiburón, Cocodrilo, Pingüino, Ballena | Oso, Elefante, Tigre | Hábitat disputado |
| Tierra | 7 animales | Cocodrilo, Pingüino | Terreno "neutro" de facto: casi todos +10 |
| Árboles | — | Guepardo, Águila, Tigre | Favorece la agilidad felina; castiga a los pesados |

### 4.1 Por qué este sistema es equilibrable

1. **Un valle nunca supera a un pico solo por el hábitat.** La oscilación máxima es 10 − (−15) = **25**, y la distancia mínima entre un pico (≥ 88) y un valle (≤ 50) es **38**. El hábitat solo decide entre medios, o entre pico y medio, que es justo donde debe decidir.
2. **Es relativo, no plano.** La ventaja del atacante es `afinidad(su carta) − afinidad(mejor defensor rival)`. Agua con el Tiburón contra una Ballena: 0. Contra un equipo terrestre: +25.
3. **Es aditivo.** Un multiplicador favorecería a quien ya tiene números altos.
4. **Genera faroles.** Declarar Aire sugiere al Águila, pero cualquier animal puede atacar en Aire. Atacar en Aire con otro animal deja a ambos en −15: es un cebo legítimo.
5. **Es un parámetro.** La simulación mide el uso por hábitat y el win rate condicionado por hábitat.

---

## 5. Daño, vitalidad y duración

### 5.1 Parámetros v0.1

`daño = clamp(round(20 + 0,5 × margen), 20, 45)` · contraataque = 50 % · vitalidad 100.

| Margen | 0 (empate) | 5 | 10 | 20 | 30 | 40 | ≥ 50 |
|---|---|---|---|---|---|---|---|
| Daño al defensor | 0 | 23 | 25 | 30 | 35 | 40 | 45 |
| Contraataque al atacante | 0 | 12 | 13 | 15 | 18 | 20 | 23 |

### 5.2 Modelo de duración (estimación previa a la simulación)

- Una carta cae tras unas **3–4 derrotas** como defensora.
- Para ganar, un equipo pierde de media ~2–3 cartas además de las 4 que elimina al rival. Eso son ~20 derrotas totales, más empates y contraataques, es decir, unos **18–26 duelos**.
- A ~25 s por duelo (decidir + animación), son **8–11 minutos**.

**Corrección respecto al análisis:** el análisis fijaba como objetivo 14–22 duelos y "3 derrotas por carta", y ambas cosas no son compatibles. El objetivo queda en **16–24 duelos**, con el límite en 30. Si la simulación da más, se sube primero `damage.base` y después `damage.min`.

### 5.3 Valor de una carta dañada o bloqueada

- El daño **no** reduce atributos, así que no hay espiral de muerte.
- **Valor de una carta dañada** = sus atributos × "derrotas que le quedan" (`ceil(vitalidad / daño medio)`). La IA Difícil y el registro de estadísticas lo usarán.
- **Valor de una carta bloqueada** = su valor sin el atributo bloqueado durante su siguiente participación. La simulación medirá la **pérdida media por bloqueo** de cada atributo (si bloquear Peso apenas cuesta y bloquear Velocidad cuesta mucho, se nota aquí).

---

## 6. Habilidades

- Desactivadas en v0.1.
- Cada habilidad candidata ([GAME_RULES.md](GAME_RULES.md) §15) se evalúa **sola**, con simulación antes y después.
- **Límite:** como mucho **+3 puntos** de win rate para su animal, y no puede sacar ninguna métrica global de su rango objetivo (§7).
- Tipos preferidos: efectos sobre bloqueo, daño o información. Se evitan las bonificaciones planas condicionadas por hábitat, porque duplican el sistema de afinidad.

---

## 7. Simulación (`packages/sim`, Fase 4)

### 7.1 Diseño

- **Espacio completo:** C(11,4) = **330 equipos**. *Round-robin* de 330 × 330 = **108 900 partidas** por emparejamiento de políticas, cada equipo como primer y como segundo jugador.
- **Políticas de bot:**
  - `random`: acción legal aleatoria (línea base y control de errores).
  - `greedy`: maximiza el margen inmediato.
  - `lookahead`: considera sus bloqueos, la vitalidad y la respuesta probable del rival.
- **Reproducibilidad:** semilla fija por partida. El informe indica `rulesetVersion`, la versión del contenido y las semillas.
- **Muestreo de duelos aislados** para medir atributos y hábitats sin el ruido de la partida completa.
- **Salida:** `packages/sim/reports/<rulesetVersion>/` con un resumen en Markdown y CSV, más la comparación con la versión anterior.

### 7.2 Métricas y umbrales

| Métrica | Objetivo | Alerta (revisión obligatoria) |
|---|---|---|
| Win rate por animal (partidas de equipos que lo incluyen; `greedy` y `lookahead`) | 45–55 % | < 42 % o > 58 % |
| Presencia en los 20 mejores equipos | ≤ 50 % por animal | > 70 % |
| Win rate del primer jugador | 48–52 % | > 54 % |
| Uso de cada atributo por el atacante | 6–22 % | < 4 % (atributo muerto) o > 30 % |
| Uso de cada hábitat | 10–40 % | < 6 % |
| Win rate del atacante en un duelo | 50–62 % | > 68 % (atacar es demasiado seguro) |
| Tasa de empate en duelos | < 5 % | > 8 % |
| Duración de partida | 16–24 duelos | > 28, o > 10 % de partidas que llegan al límite |
| Defensas en que la óptima (`lookahead`) ≠ la de mayor valor efectivo | ≥ 25 % | < 10 % (la información oculta no importa: riesgo R-01) |
| Defensas forzadas por partida | 0,5–2 | > 4 |
| IA Difícil contra Normal | 60–70 % | < 55 % |
| Delta de una habilidad | ≤ +3 pp | > +5 pp |

Los umbrales no son un dogma: el modo, la composición de equipos y el primer turno introducen asimetrías. Cuando una métrica sale de su rango, se **revisa**, no se corrige automáticamente.

### 7.3 Compensación del primer jugador (si supera el 54 %)

Se probarán en este orden, una a una:

1. El primer duelo de la partida no aplica bloqueo al defensor.
2. El segundo jugador empieza con +10 de vitalidad en una carta a su elección.
3. El primer atacante no puede usar su atributo de valor 100 en el primer duelo.

---

## 8. Lista de vigilancia para la primera simulación

| Riesgo | Hipótesis | Qué miramos |
|---|---|---|
| **Águila en Aire** | +25 relativos contra todos en Aire puede ser demasiado | Win rate del Águila, uso de Aire, win rate condicionado a Aire. Solución posible: rebajar la afinidad Hostil en Aire a −10 |
| **Pingüino** | Tres valores de 80–82 además de sus picos pueden hacerlo demasiado flexible | Win rate y presencia en los mejores equipos |
| **Lobo** | Con picos en Resistencia y Percepción compite con Ballena, Pingüino y Águila | Que no sea irrelevante (< 42 %) |
| **Tierra como default** | 7 nativos: el hábitat podría no importar en Tierra | Uso de Tierra > 40 % |
| **Árboles vacío** | Sin nativos, puede ser un hábitat muerto | Uso de Árboles < 6 % |
| **Fuerza** | Solo 2 especialistas | Uso del atributo y win rate en Fuerza |
| **Defensa forzada** | Atacar el atributo bloqueado puede ser demasiado rentable | Defensas forzadas por partida > 4 |

---

## 9. Proceso para cambiar el balance

1. Abrir una propuesta de cambio con la hipótesis ("el Águila supera el 58 % por Aire").
2. Crear una versión nueva del ruleset o del contenido (`v0.2`). **Nunca** se edita una versión publicada.
3. Ejecutar la simulación completa y comparar con la versión anterior.
4. Aceptar el cambio solo si arregla la métrica objetivo **sin sacar otra de su rango**.
5. Registrarlo en el *changelog* de balance con el informe adjunto.

---

## 10. Rareza (#011)

No hay rareza en el MVP. El modelo de datos incluye un campo `complexity` (1–3) que en el futuro podría mostrarse como rareza, entendida como **dificultad de uso y especialización**, nunca como poder. Todos los perfiles respetan el mismo presupuesto (§2), sea cual sea su `complexity`.

---

## 11. Datos reales (`facts`)

Cada animal tendrá una ficha de datos reales **separada** de su perfil de juego: masa típica, velocidad máxima, distribución, estado de conservación y la **fuente de cada dato**. Se rellenará en la Fase 4 con fuentes citables, no de memoria. Sirve para la pantalla de Colección y para justificar la identidad del animal; **el motor nunca la lee**.
