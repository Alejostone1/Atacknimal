# ATACKNIMAL · Reglas del juego

> **Ruleset vigente: 0.2.0** (equipos ocultos, ventaja defensiva +5, Hostil −10; decisiones #028 y #029). Validado por simulación: [BALANCE.md](BALANCE.md) §13.
> El ruleset 0.1.0 se conserva para comparar. Los ejemplos de §18 y los tests del motor usan 0.1.0.
> Este documento es la **fuente de verdad** del motor de reglas (`packages/engine`). Si el código y este documento no coinciden, es un error de uno de los dos y se corrige explícitamente.
> Los valores numéricos no se escriben en el código: viven en el *ruleset* versionado (ver §14 y [BALANCE.md](BALANCE.md)).
> Las decisiones que originan cada regla se citan como `#NNN` (ver [DECISIONES.md](DECISIONES.md)).

---

## 1. Glosario

| Término | Definición |
|---|---|
| **Partida** | Enfrentamiento completo entre dos equipos, de la preparación a la victoria, la derrota o el empate |
| **Duelo** | Una resolución atacante contra defensor. En la interfaz se llama "Turno N"; en estas reglas, **turno = duelo** |
| **Atacante / Defensor** | Jugadores con el rol de atacar o defender en el duelo actual |
| **Carta** | Instancia de un animal dentro de una partida, con su vitalidad y sus bloqueos |
| **Carta activa** | Carta con vitalidad > 0 |
| **Carta eliminada** | Carta con vitalidad = 0. No puede seleccionarse nunca más en la partida |
| **Vitalidad (HP)** | Puntos de vida de la carta. En la interfaz siempre se dice "vitalidad", nunca "sangre" |
| **Atributo** | Uno de los 8 ejes de comparación: Peso, Fuerza, Agilidad, Ataque, Resistencia, Velocidad, Defensa, Percepción |
| **Hábitat** | Contexto del duelo: Aire, Agua, Tierra o Árboles |
| **Afinidad** | Relación de un animal con un hábitat: Nativo, Adaptado, Neutral u Hostil |
| **Declaración** | Elección sellada del atacante: hábitat + carta + atributo |
| **Valor base** | Valor del atributo en el perfil del animal (1–100) |
| **Valor efectivo** | Valor base + modificadores (§6). Puede ser > 100 y nunca < 0 |
| **Margen** | Valor efectivo del ganador − valor efectivo del perdedor |
| **Participación** | Cada duelo en que una carta interviene, como atacante o como defensora |
| **Bloqueo** | Restricción que impide a una carta usar un atributo durante sus próximas participaciones (§8) |
| **Defensa forzada** | Defensa con una carta que no puede usar el atributo declarado (§5.3) |
| **Ruleset** | Conjunto versionado de parámetros numéricos con el que se juega una partida |

---

## 2. Modos de juego

| Modo | Jugadores | Cartas por jugador | Cartas por equipo |
|---|---|---|---|
| **1 vs IA** | 1 humano contra 1 IA (Fácil, Normal o Difícil) | 4 | 4 |
| **1 vs 1** | 2 humanos | 4 | 4 |
| **2 vs 2** | 2 equipos de 2 humanos | 2 | 4 |

El 1 vs IA usa exactamente las mismas reglas que el 1 vs 1. La IA es un jugador más que solo recibe la información que tendría un humano (§12).

---

## 3. Preparación

### 3.1 Formación de equipos

1. El roster v0.1 tiene **11 animales** (ver [BALANCE.md](BALANCE.md) §3).
2. Cada equipo forma **4 cartas**. En 1v1 las elige un jugador; en 2v2 **cada jugador elige 2**.
3. **No se permiten animales repetidos dentro de un equipo**, tampoco entre compañeros en 2v2 (#020).
4. **Sí se permite** que ambos equipos lleven el mismo animal (espejo) (#020).
5. La elección de equipo es **secreta** hasta que ambos equipos confirman. Después, los dos equipos son públicos.

### 3.2 Estado inicial de cada carta

- `vitalidad = vitalidadMáxima = ruleset.baseHp` (100 en v0.1, igual para todos) (#012).
- Sin bloqueos.
- Activa.

### 3.3 Primer atacante

- Se sortea con la **semilla de la partida** (RNG determinista).
- En 2v2, el sorteo decide qué equipo actúa como "A" en el orden de §9.2.

---

## 4. Secuencia de un duelo

Estados del motor (amplía la máquina de estados del documento maestro):

```text
SETUP ──► DECLARE ──► DEFEND ──► RESOLVE ──► (FINISHED | DECLARE del siguiente duelo)
```

En el motor, `RESOLVE` no es un estado de espera: se ejecuta dentro de la acción de defensa, que devuelve directamente el duelo resuelto. Las fases del estado son `setup`, `declare`, `defend` y `finished`.

| Fase | Quién actúa | Acción válida | Información nueva para el defensor |
|---|---|---|---|
| `SETUP` | Todos | Confirmar equipo | — |
| `DECLARE` | Atacante | `Declare { hábitat, carta, atributo }` en una sola acción atómica | — |
| `DEFEND` | Defensor | `Defend { carta }` | **Solo hábitat + atributo** |
| `RESOLVE` | Motor | Ninguna (automática) | Todo el duelo (§11) |
| `FINISHED` | — | Ninguna | Resultado final |

**Reglas de la secuencia:**

1. La interfaz guía al atacante por tres pasos (hábitat → carta → atributo), pero **al motor solo llega una acción `Declare` completa** tras el botón de confirmación. Antes de confirmar puede cambiar lo que quiera; después ya no (confirmación obligatoria, análisis §A.2).
2. El defensor **no recibe la carta atacante** en ninguna forma (ni oculta, ni cifrada, ni en un campo omitido por la interfaz) hasta que su `Defend` se ha aceptado.
3. `RESOLVE` es una función pura y determinista: los mismos estado, declaración y defensa dan siempre el mismo resultado.
4. La animación (Phaser) ocurre **después** de que el motor haya resuelto. La animación nunca puede cambiar el resultado.

---

## 5. Legalidad de las acciones

### 5.1 Declaración del atacante

Una `Declare { hábitat, carta, atributo }` es legal si:

- La fase es `DECLARE` y quien la envía es el atacante del duelo.
- `hábitat` ∈ {Aire, Agua, Tierra, Árboles}. **Se permite cualquier hábitat para cualquier animal** (#007). La afinidad Hostil penaliza, no prohíbe.
- `carta` pertenece al atacante y está **activa**.
- `atributo` ∈ los 8 atributos y **no está bloqueado** en esa carta.

Con `lockDuration = 1`, una carta tiene como mucho un atributo bloqueado, así que **el atacante siempre tiene al menos 7 atributos legales con cada carta activa** (#008).

### 5.2 Defensa

Una `Defend { carta }` es legal si:

- La fase es `DEFEND` y quien la envía es el defensor designado (§9).
- `carta` pertenece al defensor y está **activa**.
- Si el defensor tiene **al menos una** carta activa sin el atributo declarado bloqueado, `carta` debe ser una de ellas (**defensa normal**).
- Si **ninguna** de sus cartas activas puede usar el atributo, cualquier carta activa es legal (**defensa forzada**, §5.3).

### 5.3 Defensa forzada (#009)

- Se produce solo cuando el defensor no tiene ninguna carta activa con el atributo declarado libre.
- El defensor **elige igualmente** qué carta activa recibe el golpe. Esa decisión importa: puede sacrificar la carta más dañada o la menos valiosa.
- La carta forzada lucha con **valor efectivo = 0** (no se aplican modificadores).
- El duelo se resuelve con normalidad (§6–§8). El daño queda limitado por `damage.max`.
- La interfaz lo comunica claramente: «¡Sin defensa en {atributo}! Elige qué carta recibe el golpe».

### 5.4 Acciones ilegales

El motor **rechaza** toda acción ilegal con un error tipado (`RuleError`) y **no modifica el estado**. Ejemplos: fuera de turno, carta eliminada, atributo bloqueado, carta ajena, fase incorrecta o acción duplicada. En el modo online, el servidor ejecuta el mismo motor, así que estas reglas son también la validación del servidor.

---

## 6. Valor efectivo

Para cada carta del duelo, en este **orden fijo**:

```text
valorEfectivo = max(0,
    valorBase(atributo)
  + modHábitat(afinidad del animal con el hábitat)
  + modHabilidad          // 0: habilidades desactivadas (#010)
  + modEstado             // 0: reservado para estados futuros
  + modDefensor           // solo la carta defensora: ruleset.defenderBonus (+5 en 0.2.0, 0 en 0.1.0)
)
```

- Los modificadores son **enteros** y se suman: nunca se multiplican (#006).
- **El modificador de hábitat se aplica a ambas cartas**, cada una según su propia afinidad (#006).
- Ambos valores pueden superar 100 (#021). La interfaz muestra el desglose, por ejemplo `110 = 100 + 10 (Tierra · Nativo)`.
- En una defensa forzada, el valor efectivo de la carta defensora es 0 y no se calculan sus modificadores (tampoco la ventaja del defensor).
- La ventaja del defensor (`roleModifier` en el desglose) compensa en parte que el atacante elija el eje del duelo (#025, #029).

### 6.1 Modificador de hábitat

| Afinidad | 0.2.0 (vigente) | 0.1.0 |
|---|---|---|
| Nativo | **+10** | +10 |
| Adaptado | **+4** | +4 |
| Neutral | **0** | 0 |
| Hostil | **−10** | −15 |

La tabla de afinidades por animal está en [BALANCE.md](BALANCE.md) §4.

---

## 7. Resultado y daño

### 7.1 Ganador

- Mayor valor efectivo gana.
- **Empate** (valores iguales): nadie recibe daño, los bloqueos se aplican igualmente (§8) y el duelo cuenta para el límite de duración (#005).

### 7.2 Daño base

```text
daño = clamp( round(damage.base + damage.k × margen), damage.min, damage.max )
```

- `round` redondea al entero más cercano y las mitades hacia arriba (todos los valores son positivos).
- Ruleset v0.1: `base = 20`, `k = 0.5`, `min = 20`, `max = 45` (#003).

### 7.3 Quién recibe el daño (#004)

| Resultado | Recibe daño | Cantidad |
|---|---|---|
| Gana el atacante | Carta defensora | `daño` |
| Gana el defensor | Carta atacante (**contraataque**) | `round(daño × damage.counterRatio)` con `counterRatio = 0.5` |
| Empate | Nadie | 0 |

- La vitalidad nunca baja de 0. El daño sobrante se pierde (no pasa a otras cartas).
- **El daño no reduce los atributos**: solo la vitalidad.

### 7.4 Eliminación

- Si la vitalidad llega a 0, la carta queda **eliminada** al final del duelo.
- Una carta eliminada no puede atacar, defender ni ser elegida en defensa forzada.
- En cada duelo solo una carta recibe daño, así que **nunca se eliminan cartas de ambos equipos en el mismo duelo**.

---

## 8. Bloqueos de atributo (#008)

### 8.1 Regla

> **Una carta no puede usar el mismo atributo en su siguiente participación.** (Storyboard, panel 8)

- Tras **todo** duelo resuelto, incluidos empates y defensas forzadas, **ambas cartas** (atacante y defensora) quedan bloqueadas en el atributo comparado.
- Un bloqueo tiene una cuenta `restante` de **participaciones** (`ruleset.lockDuration`, 1 en v0.1).

### 8.2 Algoritmo, en este orden, al final de `RESOLVE` y para cada carta participante

1. **Consumir:** a cada bloqueo que la carta ya tenía **antes** de este duelo se le resta 1 a `restante`. Los que llegan a 0 desaparecen.
2. **Aplicar:** se añade un bloqueo nuevo `{ atributo comparado, restante = lockDuration }`. Si ya existía uno en ese atributo (solo posible tras una defensa forzada), se reemplaza.
3. Si la carta quedó eliminada en este duelo, sus bloqueos se descartan.

Las cartas que **no** participan conservan sus bloqueos intactos. Un bloqueo solo se consume participando.

### 8.3 Consecuencias que el diseño busca

- **Atacar tiene coste:** usar la Velocidad del Guepardo ahora la deja fuera en su siguiente participación.
- **Defender tiene coste:** responder con tu mejor carta la bloquea en ese atributo, y el rival puede explotarlo atacando de nuevo en ese atributo. Esto es lo que da valor a la información oculta (análisis, riesgo R-01).
- **Leer los bloqueos rivales es estrategia:** atacar en un atributo que el rival tiene bloqueado en sus mejores defensores. Por eso los bloqueos son **públicos** (#014).

### 8.4 Casos límite

| Caso | Resultado |
|---|---|
| Carta con todos los atributos bloqueados | Imposible con `lockDuration = 1` (máximo 1 bloqueo por carta). Si un ruleset futuro lo permitiera, esa carta no puede atacar; para defender aplica la defensa forzada |
| Atacante sin ninguna declaración legal | Imposible mientras tenga una carta activa (§5.1) |
| Defensor sin carta legal | Defensa forzada (§5.3) |
| Bloqueo sobre una carta que no vuelve a jugar | Permanece; no tiene efecto |

### 8.5 Representación

- **En el estado:** `carta.bloqueos: [{ atributo, restante }]`. Forma parte del estado real y se valida en cada acción.
- **En la interfaz:** candado + nombre del atributo en la carta («Bloqueado: Velocidad»), atributo atenuado y no seleccionable en el panel de atributos, y visible también en las cartas del rival.

---

## 9. Orden de turnos

### 9.1 1 vs 1 y 1 vs IA (#013)

- **Alternancia estricta:** el atacante del duelo N+1 es el defensor del duelo N.
- El primer atacante se sortea (§3.3).
- Si la simulación da al primer jugador más de un 54 % de victorias, se activará la compensación prevista en [BALANCE.md](BALANCE.md) §7.

### 9.2 2 vs 2 (#015, #016)

Cada jugador controla sus 2 cartas. Ciclo de 4 duelos, repetido:

| Paso del ciclo | Ataca | Defiende |
|---|---|---|
| 1 | A1 | B1 |
| 2 | B2 | A2 |
| 3 | A2 | B2 |
| 4 | B1 | A1 |

- **Atacante sin cartas activas:** se salta su paso y se pasa al siguiente del ciclo.
- **Defensor designado sin cartas activas (relevo):** defiende su compañero.
- **Defensor designado con cartas activas pero ninguna legal:** defensa forzada con **sus propias** cartas. No hay relevo, porque el relevo solo se da cuando el defensor no tiene cartas activas.
- **Jugador sin cartas:** sigue en la partida como asesor de su equipo (puede usar marcadores rápidos) y no actúa.
- **Comunicación en el MVP de 2v2:** solo marcadores rápidos predefinidos, sin chat libre: «¡Bien jugado!», «¡Cuidado!», «Guarda tu {carta}», «Usa tu {carta}» y «Ataca en {hábitat}» (#037). «Yo defiendo» se descartó: el defensor lo designa el orden de turnos, no se elige.
- **Información entre compañeros:** cada jugador ve las cartas y los bloqueos de su compañero, como los del rival. La declaración del atacante es visible para su compañero.

---

## 10. Fin de la partida

### 10.1 Victoria

Un equipo gana cuando, al final de un duelo, **todas las cartas del equipo rival están eliminadas** (4 de 4; en 2v2 cuenta el equipo).

### 10.2 Límite de duración (#017)

Si al terminar el duelo número `ruleset.maxDuels` (**30** en v0.1) nadie ha ganado:

1. Gana el equipo con **más cartas activas**.
2. Si empatan, gana el equipo con **más vitalidad total** en sus cartas activas.
3. Si siguen empatados, la partida termina en **empate**.

La interfaz muestra el contador de duelos a partir del duelo 25 («Quedan 5 duelos»).

### 10.3 Abandono

Un jugador que abandona voluntariamente pierde. En 2v2 pierde todo su equipo.

---

## 11. Información visible

| Información | Jugador propio | Compañero (2v2) | Rival | Cuándo |
|---|---|---|---|---|
| Animales del equipo, vitalidad y eliminadas | ✅ | ✅ | **Solo las cartas reveladas** (0.2.0) | Una carta se revela al participar en su primer duelo. En 0.1.0, todas desde el fin de `SETUP` |
| Número de cartas rivales aún ocultas | ✅ | ✅ | ✅ | Siempre (`hiddenCards` en la vista) |
| Atributos base y afinidades de cada animal | ✅ | ✅ | ✅ | Siempre (son datos públicos del roster) |
| Bloqueos de cada carta | ✅ | ✅ | ✅ (de las cartas reveladas) | Siempre (#014) |
| Equipo durante `SETUP` | ✅ | ✅ | ❌ | Hasta que ambos confirman |
| Hábitat + atributo declarados | ✅ | ✅ | ✅ | Desde la declaración |
| **Carta atacante** | ✅ | ✅ (compañero del atacante) | ❌ | Hasta que se acepta la defensa |
| Carta defensora | ✅ | ✅ (compañero del defensor) | ❌ | Hasta `RESOLVE` |
| Resolución completa (§13) | ✅ | ✅ | ✅ | Tras `RESOLVE` |
| Semilla de la partida y estado del RNG | ❌ | ❌ | ❌ | Nunca (hasta el final, si se habilita una repetición) |

**Implementación obligatoria:** el motor expone `getPlayerView(estado, jugador)`, que **elimina** los datos ocultos. El servidor solo envía vistas por jugador, nunca el estado completo. Hay tests que verifican que la vista del defensor durante `DEFEND` no contiene la carta atacante y que, con equipos ocultos, la vista del rival es idéntica elijas los animales que elijas.

**Equipos ocultos (0.2.0):** el evento `matchStarted` llega a cada jugador sin los equipos rivales. Las cartas ocultas del rival no aparecen en la vista, ni siquiera sus ids: un id como `p2/wolf` delataría al animal. La interfaz muestra siluetas "?" por cada carta oculta.

---

## 12. Inteligencia artificial (#019)

- La IA es un jugador más: recibe **la misma `PlayerView`** que recibiría un humano y produce acciones que el motor valida igual que las de un humano. **Es imposible que vea la carta atacante por construcción**, no por disciplina.
- Usa el RNG de la partida (determinista) para su aleatoriedad.
- La IA **ataca y defiende**:

| Nivel | Al defender | Al atacar |
|---|---|---|
| **Fácil** | Razona como Normal, pero valora cada opción con un error de hasta ±20 puntos | Igual: razona como Normal con ese mismo error |
| **Normal** | Mayor valor efectivo legal (incluida la ventaja del defensor). En defensa forzada, la carta con más vitalidad | Maximiza el margen frente a la **mejor defensa estimada** del rival: sus cartas visibles legales y, si tiene ocultas, el máximo esperado entre los animales que podrían ser |
| **Difícil** | Estima el valor del atacante (sus cartas visibles que pueden usar el atributo y el máximo esperado de las ocultas). Gana con la carta cuyo bloqueo cueste menos. Si va a perder, minimiza el daño, evita eliminaciones y sacrifica a la carta con menos vitalidad | Calcula el intercambio de daño esperado (daño causado o contraataque recibido), penaliza arriesgar una eliminación propia y el coste de bloquear su mejor carta en ese atributo |

- La dificultad **nunca** se basa en hacer trampa ni en modificar estadísticas.
- Implementación: `packages/engine/src/ai/` (`decideAI(vista, nivel, rng)`). La usan la web, el simulador y, más adelante, el servidor.
- Calibración (balance 0.2.0, 4 000 partidas por emparejamiento): Difícil gana el **63 %** a Normal y el **81 %** a Fácil; Normal gana el **68 %** a Fácil ([BALANCE.md](BALANCE.md) §14).
- Los "cebos" (atacar para forzar que el rival bloquee sus mejores defensores) quedan para una futura IA más profunda.

---

## 13. Resolución de un duelo: datos que produce el motor

Cada duelo produce un `CombatResolution` (datos puros) que consumen Phaser, React, la persistencia y la simulación:

| Campo | Contenido |
|---|---|
| `duelNumber` | Número de duelo |
| `attacker`, `defender` | Jugador y carta de cada rol |
| `habitat`, `attribute` | Declaración |
| `forcedDefense` | `true` / `false` |
| `attackerBreakdown`, `defenderBreakdown` | `{ base, affinity, habitatModifier, abilityModifier, statusModifier, roleModifier, effective }` (`null` en defensa forzada) |
| `outcome` | `ATTACKER_WINS` / `DEFENDER_WINS` / `TIE` |
| `margin` | Diferencia de valores efectivos |
| `damage` | `{ target, amount, isCounter }` o `null` |
| `hpAfter` | Vitalidad resultante de ambas cartas |
| `locksApplied`, `locksExpired` | Bloqueos aplicados y expirados |
| `eliminated` | Carta eliminada o `null` |
| *(siguiente turno)* | No va en la resolución: lo anuncia el evento `turnStarted` o `matchFinished` que la sigue |

Con estos datos, la pantalla de resultado y el **registro del combate** pueden explicar siempre **por qué** ganó una carta (pilar "Transparencia").

---

## 14. Parámetros del ruleset

Valores de la versión vigente **0.2.0**. Las diferencias con 0.1.0 se indican entre paréntesis.

| Parámetro | Valor | Regla |
|---|---|---|
| `teamSize` | 4 | §3.1 |
| `baseHp` | 100 | §3.2 |
| `habitatModifiers` | Nativo +10, Adaptado +4, Neutral 0, Hostil **−10** (0.1.0: −15) | §6.1 |
| `damage.base` | 20 | §7.2 |
| `damage.k` | 0.5 | §7.2 |
| `damage.min` | 20 | §7.2 |
| `damage.max` | 45 | §7.2 |
| `damage.counterRatio` | 0.5 | §7.3 |
| `lockDuration` | 1 (participaciones) | §8 |
| `maxDuels` | 30 | §10.2 |
| `abilitiesEnabled` | `false` | §15 |
| `defenderBonus` | **5** (0.1.0: 0): ventaja fija del defensor fuera de defensa forzada | §6, #029 |
| `hiddenTeams` | **`true`** (0.1.0: `false`): las cartas rivales no se ven hasta que participan en un duelo | §11, #028 |
| `teamAttributeLock` | 0 (*disponible, sin usar*: ataques propios en que el atributo usado queda bloqueado para todo el equipo) | #025 B |
| `habitatCooldown` | 0 (*disponible, sin usar*: ataques propios en que el equipo no puede repetir hábitat; error `HABITAT_LOCKED`) | #025 C |
| `turnTimers.declareSeconds` | 30 (solo online) | §16 |
| `turnTimers.defendSeconds` | 20 (solo online) | §16 |
| `reconnectGraceSeconds` | 60 (solo online) | §16 |

Toda partida guarda su `rulesetVersion`. Cambiar un número crea una versión nueva del ruleset; nunca se edita una versión publicada.

---

## 15. Habilidades (#010)

- **Desactivadas en el ruleset v0.1** para medir el balance base.
- El motor tendrá desde el principio un **sistema de habilidades guiado por datos**: disparador + condiciones + efecto, sin código específico por animal.
- Candidatas aprobadas para evaluar después del balance base, **una a una** y con simulación antes y después:

| Animal | Habilidad candidata | Efecto propuesto |
|---|---|---|
| Rinoceronte | Embestida | Si gana como atacante, el perdedor recibe además un bloqueo en Defensa |
| Lobo | Manada | +5 al valor efectivo por cada otra carta activa de su equipo |
| Cocodrilo | Emboscada | +10 al defender en Agua |
| Elefante | Memoria | Sus bloqueos duran 1 participación menos (mínimo 0) |
| Pingüino | Colonia | Recibe −25 % de daño en Agua |
| Águila real | Vista aguda | Al defender, conoce la afinidad del atacante con el hábitat declarado (nunca la carta) |
| Guepardo, Oso pardo, Tiburón blanco, Tigre, Ballena | *por definir en la Fase 12* | — |

- Límite de diseño: una habilidad no puede subir el win rate de su animal más de **+3 puntos** ([BALANCE.md](BALANCE.md) §6).
- Las habilidades de los mockups ("+15 de Velocidad en Tierra", etc.) **se descartan**, porque duplican el sistema de hábitat (#010).

---

## 16. Partidas online (#022)

Estas reglas no afectan al motor; las aplica el servidor alrededor de él:

- **Temporizador:** 30 s para declarar y 20 s para defender. Al agotarse, el servidor genera la acción con la **política de IA Fácil** en nombre del jugador y la pasa por el motor como cualquier otra.
- **Desconexión:** 60 s de gracia. Mientras dure, sus temporizadores siguen corriendo (actúa la IA Fácil por él). Si no vuelve dentro de la gracia, cuenta como **abandono** (§10.3).
- **Acciones duplicadas:** cada acción lleva un identificador. El servidor ignora los duplicados (idempotencia), lo que permite reintentar tras una reconexión sin aplicar dos veces la misma jugada.
- **Antes de empezar:** si alguien sale de la sala o no vuelve dentro de la gracia mientras se espera rival o se eligen equipos, la sala se cierra sin resultado.
- **Elección de equipo:** por ahora no tiene límite de tiempo (pendiente; ARCHITECTURE §10).

Detalle técnico en [API.md](API.md) §6.

---

## 17. Vocabulario de interfaz (corrige las inconsistencias I-04 e I-15 del material)

| Usar | No usar |
|---|---|
| «Hábitat: Tierra · Atributo: Velocidad» | «Mismo atributo: Tierra», «Atributo utilizado: Tierra» |
| En la carta defensora: «Tierra · Velocidad» (el atributo comparado) | «Tierra · Fuerza» cuando se compara Velocidad |
| «Pierde 18 de vitalidad» | «Pierde 18 de sangre» |
| «Bloqueado: Velocidad» | «Usado» sin indicar duración |
| Sala 1v1: 2 asientos; sala 2v2: 4 asientos | 4 asientos en 1v1 |

---

## 18. Ejemplos resueltos (ruleset 0.1.0 y perfiles de [BALANCE.md](BALANCE.md) §3)

> Estos ejemplos documentan la mecánica con 0.1.0 y son los que comprueban los tests del motor. Con 0.2.0 cambian los números (por ejemplo, el defensor suma +5 y algunos perfiles cambian), pero no el procedimiento.

### Ejemplo 1: gana el atacante

- Declaración: **Tierra + Velocidad**, Guepardo (VE 100, Tierra Nativo).
- Defensa: Lobo (VE 80, Tierra Nativo).
- Valores: Guepardo 100 + 10 = **110**; Lobo 80 + 10 = **90**. Margen 20.
- Daño: round(20 + 0,5 × 20) = **30**, entre 20 y 45, así que queda en 30. El Lobo pasa a **70/100**.
- Bloqueos: Guepardo y Lobo quedan bloqueados en Velocidad durante su siguiente participación.

### Ejemplo 2: contraataque

- Declaración: **Agua + Ataque**, Tigre (AT 94, Agua Adaptado).
- Defensa: Cocodrilo (AT 90, Agua Nativo).
- Valores: Tigre 94 + 4 = **98**; Cocodrilo 90 + 10 = **100**. Gana el defensor por 2.
- Daño: round(20 + 0,5 × 2) = 21. Contraataque: round(21 × 0,5) = round(10,5) = **11**. El Tigre pasa a **89/100**.
- Bloqueos: Tigre y Cocodrilo bloqueados en Ataque.
- Lectura: el hábitat (Agua) decidió un duelo igualado sin invertir una diferencia de identidad.

### Ejemplo 3: defensa forzada

- Declaración: **Tierra + Velocidad**, Guepardo (110 efectivo).
- Al defensor solo le quedan Oso y Rinoceronte, ambos con **Velocidad bloqueada**, así que no tiene defensa legal.
- El defensor elige sacrificar al Oso (más dañado): valor efectivo **0**.
- Margen 110 → round(20 + 55) = 75 → limitado al máximo: **45**.
- Bloqueos: el Guepardo queda bloqueado en Velocidad. El Oso consume su bloqueo anterior de Velocidad y recibe uno nuevo en Velocidad (§8.2).

### Ejemplo 4: empate

- Espejo: Guepardo contra Guepardo, **Tierra + Velocidad**: 110 contra 110.
- Sin daño. Ambos quedan bloqueados en Velocidad. El duelo cuenta para el límite de 30.

### Ejemplo 5: el duelo de los mockups, con las reglas definitivas

- Los mockups muestran «Guepardo 115 contra Elefante 68, el Elefante pierde 18». Con las reglas v0.1, el Elefante solo puede defender Velocidad con su propio valor: 40 + 10 (Tierra Nativo) = **50**.
- Margen 110 − 50 = 60 → round(20 + 30) = 50 → limitado al máximo: **45**.
- Un defensor sensato no respondería con el Elefante a una Velocidad salvo para "absorber" el golpe con una carta sana. Esa es una decisión legítima que la pantalla de resultado debe explicar.

---

## 19. Detalles derivados (no estaban en las decisiones; revisables)

Para cerrar la especificación tomé estas decisiones menores. Ninguna cambia una regla importante, pero quedan visibles para tu revisión:

| # | Detalle | Elegido | Alternativa |
|---|---|---|---|
| D-01 | Un empate también aplica bloqueos | Sí (§7.1) | Sin bloqueos en empate |
| D-02 | La carta de una defensa forzada lucha con valor 0 y sin modificadores | Sí (§5.3) | Que conserve su modificador de hábitat |
| D-03 | Redondeo del daño | Al entero más cercano, mitades hacia arriba (§7.2) | Truncar |
| D-04 | El equipo es secreto hasta que ambos confirman | Sí (§3.1) | Selección visible (*draft*) |
| D-05 | En 2v2, la defensa forzada no activa el relevo | Sí (§9.2) | Relevo también sin cartas legales |
| D-06 | Al agotarse el tiempo, actúa la IA Fácil | Sí (§16) | Pérdida automática del duelo |
| D-07 | Desconexión más allá de la gracia = abandono | Sí (§16) | La IA juega el resto de la partida |
| D-08 | Abandonar en 2v2 hace perder al equipo | Sí (§10.3) | El compañero sigue solo |
| D-09 | El compañero del atacante ve la declaración completa | Sí (§11) | Solo ve hábitat + atributo |
