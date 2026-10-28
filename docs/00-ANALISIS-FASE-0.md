# ATACKNIMAL · Fase 0: análisis del material de diseño

> Estado: **cerrado**. Todas las recomendaciones fueron aceptadas el 2026-10-28 (ver [DECISIONES.md](DECISIONES.md)).
> Documento histórico: donde difiera de [GAME_RULES.md](GAME_RULES.md) o [BALANCE.md](BALANCE.md), mandan estos últimos (por ejemplo, el umbral del primer jugador es 54 % y el objetivo de duración es 16–24 duelos).
> Fecha: 2026-10-28.
> Material analizado (en `docs/diseno/`):
>
> | Id | Archivo | Qué es |
> |---|---|---|
> | **[DM]** | `ATACKNIMAL_Documento_Maestro_Completo_v1.pdf` | Documento maestro, 36 págs. (portada dice "Versión 4.0") |
> | **[SB]** | `Storyboard de interfaz de ATACKNIMAL.png` | Storyboard de 9 pantallas (formato escritorio) |
> | **[PJ]** | `Paneles de juego ATACKNIMAL_ Jungla estratégica.png` | 10 paneles de flujo (formato más móvil) |
> | **[GDD]** | `Infografía GDD de ATACKNIMAL.png` | Infografía resumen del GDD "Versión 1.0" |
> | **[CT]** | `Infografía de cartas de animales salvajes.png` | Estructura de carta, rarezas y 11 cartas de ejemplo |
> | **[DU]** | `Duelo de Guepardo contra Elefante.png` | Mockup detallado de una resolución de duelo |
> | **[HO]** | `Atacknimal_ El instinto decide.png` | Mockup de home "aspiracional" (con tienda, misiones, etc.) |
>
> Convenciones: ⚠️ **DECISIÓN PENDIENTE #NNN** · 🔒 **SEGURIDAD PENDIENTE** · 🧪 **EXPANSIONES FUTURAS** ·
> Clasificación de elementos: **[OBL]** obligatorio · **[REC]** recomendado · **[PROV]** provisional · **[MEJ]** susceptible de mejora.

---

## A. Análisis del material

### A.1 Pantallas identificadas

| # | Pantalla | Fuentes | Elementos | Clasificación |
|---|---|---|---|---|
| P01 | **Inicio** | SB1, PJ1, DM p.16, HO | Logo, lema, "Jugar en línea" / "Jugar" / "Jugar contra IA" (varía), "Crear cuenta / Iniciar sesión", "Crear sala privada", "Unirse a sala con código", accesos a Colección, Perfil, Ajustes | [OBL] núcleo · [PROV] login |
| P02 | **Selección de equipo** | SB2, PJ2, DM p.16 | "Tu equipo" 4 ranuras (4/4), colección con buscador, filtros por hábitat (Todos/Tierra/Agua/Aire/Árboles), "Confirmar equipo" | [OBL] |
| P03 | **Sala privada** | SB3, PJ3, GDD7, DM p.16/19 | Código `7F3K2J`, enlace (copiar), QR, "Compartir enlace/sala", selector de modo 1v1 / 2v2, "Esperando jugadores… 1/4" con 4 ranuras, "Volver" | [OBL] |
| P04 | **Elección del atacante** | SB4, PJ4, PJ5, DM p.17 | "Turno N", HUD de ambos jugadores con mini-cartas, 4 botones de hábitat, "Selecciona tu carta atacante", panel de atributos de la carta, habilidad especial, "Siguiente" | [OBL] |
| P05 | **Respuesta del rival** | SB5, PJ6, DM p.17 | Mensaje "El hábitat es Tierra y el atributo es Velocidad", solo cartas legales, carta atacante oculta, "Esperando respuesta del rival…" | [OBL] |
| P06 | **Combate / revelación** | PJ7, DU, DM p.17 | Ambas cartas, "VS", valores efectivos con desglose (`115 = 100 + 15`), animación | [OBL] |
| P07 | **Resultado del duelo** | SB6, PJ8, DU, DM p.18 | "¡Ganaste!", valores efectivos, "El Elefante pierde 18 de vitalidad", HP actualizada, **registro del combate** (DU), "Continuar" | [OBL] · registro [REC] |
| P08 | **Detalle de carta** | SB7 | Atributos, "Atributos utilizados" con candado, "Disponibles", habilidad especial | [REC] |
| P09 | **Estado del equipo** | SB8, PJ9, DM p.18 | Turno, HP por carta, "Bloqueado: Velocidad", marcas ✓/✗, equipo rival, recordatorio de la regla de bloqueo | [OBL] |
| P10 | **Victoria / derrota** | SB9, PJ10, DM p.18 | "¡VICTORIA! Has eliminado las 4 cartas del rival", "Volver al menú", "Ver estadísticas". **No existe mockup de derrota** | [OBL] · derrota falta |
| P11 | **Colección** | PJ1, HO | Navegación hacia colección. Sin economía, la colección = enciclopedia de los 11 animales | [REC] |
| P12 | **Perfil / Ajustes** | SB3, PJ1 | Solo aparece como acceso, sin mockup | [PROV] |
| — | **Home aspiracional** | HO | Tienda, Misiones (+50 monedas, +100 gemas), Nivel 12, "Modo clásico Súper Triunfo Animal", "Modo arena", "Desafíos", "Noticias", "Jugadores en línea", "más de 100 animales" | **Fuera de alcance** (ver A.9) |

Pantallas que **faltan** y habrá que diseñar: derrota, empate (si existe), desconexión/reconexión del rival, unirse con código (formulario), sala 2v2 con asignación de equipos, selección de dificultad de IA, créditos de fotografías, abandono de partida, tutorial o primera partida guiada.

### A.2 Botones y controles

Jugar / Jugar en línea / Jugar contra IA · Crear cuenta / Iniciar sesión · Crear sala privada · Unirse con código · Colección · Perfil · Ajustes · Buscar animal · Filtros de hábitat · Confirmar equipo · Copiar código · Copiar enlace · Compartir enlace/sala · Compartir QR · Modo 1v1 / 2v2 (radio) · Volver · Aire / Agua / Tierra / Árboles · Selección de carta · Selección de atributo · Siguiente · Continuar · Volver al menú · Ver estadísticas · Cerrar sesión (HO).

[MEJ] El [DM] p.27 pide **confirmación antes de una elección irreversible**. El storyboard no la muestra. Recomiendo un botón "Confirmar ataque" o "Confirmar defensa" que resuma *Hábitat + Carta + Atributo*.

### A.3 Animales

**Roster oficial ([DM] p.8): 11 especies.** Las especies concretas salen de [CT]:

| # | Animal | Especie en [CT] | Hábitat principal ([DM]) |
|---|---|---|---|
| 1 | Guepardo | *Acinonyx jubatus* | Tierra / Árboles (situacional) |
| 2 | Águila real | *Aquila chrysaetos* | Aire |
| 3 | Oso pardo | *Ursus arctos* | Tierra |
| 4 | Tiburón blanco | *Carcharodon carcharias* | Agua |
| 5 | Lobo (gris) | *Canis lupus* | Tierra |
| 6 | Elefante (africano) | *Loxodonta africana* | Tierra |
| 7 | Rinoceronte (blanco) | *Ceratotherium simum* | Tierra |
| 8 | Cocodrilo (del Nilo) | *Crocodylus niloticus* | Agua / Tierra |
| 9 | Tigre | *Panthera tigris* | Tierra / Árboles (situacional) |
| 10 | Pingüino (emperador) | *Aptenodytes forsteri* | Agua / Tierra (limitado) |
| 11 | Ballena (azul) | *Balaenoptera musculus* | Agua |

**Animales que aparecen en el arte pero NO están en el roster:**

- **León**: aparece en la portada de [SB], [PJ], [GDD] y [HO], en la mano del rival en [SB5] y en la victoria de [SB9]/[PJ10]. Es casi la mascota visual del juego.
- **Zorro, Jirafa, Hipopótamo** (colección en [PJ2]); **Oso polar, Leopardo/Jaguar** ([HO]); primates ([GDD] hábitat Árboles).
- [HO] promete "más de 100 animales".

> ⚠️ **DECISIÓN PENDIENTE #002**: ver sección E.

### A.4 Atributos

Hay 8 atributos oficiales: **Peso, Fuerza, Agilidad, Ataque, Resistencia, Velocidad, Defensa, Percepción**, en escala de 1 a 100 ([DM] p.6). [GDD] define un icono y un color para cada uno:

| Atributo | Icono [GDD] | Color [GDD] |
|---|---|---|
| Peso | pesa | gris |
| Fuerza | bíceps | rojo |
| Agilidad | rayo | amarillo |
| Ataque | garras | naranja |
| Resistencia | corazón | verde |
| Velocidad | chevrons | azul |
| Defensa | escudo | violeta |
| Percepción | ojo | magenta |

[MEJ] El rojo y el verde se usan a la vez para atributos y para estados (HP baja o eliminada, ganador). Por accesibilidad, el [DM] p.27 pide no usar el color como único indicador. Siempre irán icono y texto.

### A.5 Hábitats

Aire, Agua, Tierra y Árboles. [GDD] describe ventajas y desventajas:

| Hábitat | Ventaja | Desventaja | Atributos relevantes ([DM]) | Especialistas en el roster |
|---|---|---|---|---|
| Aire | aves | grandes mamíferos | Velocidad, Agilidad, Percepción | **Solo Águila real** |
| Agua | especies acuáticas | terrestres | Velocidad, Resistencia, Ataque | Tiburón, Ballena, Pingüino, Cocodrilo |
| Tierra | mamíferos terrestres | acuáticos puros | Peso, Fuerza, Velocidad, Ataque | 7 animales |
| Árboles | primates, felinos arborícolas | animales muy pesados | Agilidad, Percepción, Defensa | **Ninguno** (Tigre y Guepardo, "situacional") |

**Problema estructural:** de 11 animales, 7 son de Tierra, ninguno es arborícola y solo uno vuela. Ver el riesgo R-03.

### A.6 Reglas deducibles del material

1. Cada equipo tiene 4 animales y cada carta empieza con 100 de HP en todas las pantallas, salvo el Elefante de [HO], que tiene 120/120.
2. El atacante elige hábitat, carta y atributo. El defensor solo conoce hábitat y atributo.
3. El defensor compara **el mismo atributo** con su carta ([PJ6]: "el hábitat es Tierra y el atributo es Velocidad").
4. Valor efectivo = base + hábitat + habilidad + estado ([DM] p.12).
5. Gana el valor efectivo mayor y el perdedor pierde HP ([DU]: "El Elefante pierde 18 de vitalidad").
6. **Bloqueo:** "Una carta no puede usar el mismo atributo en su siguiente enfrentamiento" ([SB8]).
7. Una carta se elimina con HP = 0 y queda fuera de la partida ([DM] p.13).
8. La partida termina al eliminar las 4 cartas rivales ([DM] p.14). En 2v2 cuenta el conjunto del equipo.
9. Las habilidades son pasivas condicionadas por hábitat, por ejemplo "En hábitat de Tierra: +15 de Velocidad" ([CT], [DU]).
10. La IA nunca conoce la carta atacante ([DM] p.15).
11. Hay una máquina de estados: `WAITING → READY → TURN_START → ATTACK_SETUP → DEFENSE → RESOLVE → RESULT → TURN_START | FINISH` ([DM] p.22).
12. La sala se comparte por código, enlace y QR. El QR lleva un identificador o token temporal y el servidor decide ([DM] p.19).
13. 2v2 sigue el orden A1→B1, B2→A2, A2→B2, B1→A1 ([DM] p.31, marcado como propuesta).

### A.7 Estados de carta

| Estado | Definición ([DM] p.13) | Observaciones |
|---|---|---|
| Disponible | lista | — |
| Dañada | HP < máx., sigue jugando | Recomiendo que **no** sea un estado aparte, sino que se derive de la HP |
| Bloqueada | un atributo no disponible durante "la ventana definida" | La ventana no está definida (#008). Es un estado **por atributo**, no de carta |
| Eliminada | fuera de partida | — |

Recomiendo modelar `status` (activa o eliminada) y `locks[]` (atributo y duración restante) por separado. "Dañada" sería solo un dato derivado para la interfaz.

### A.8 Información visible y oculta

| Información | Atacante | Defensor | Momento |
|---|---|---|---|
| Equipo rival (animales, HP, eliminadas) | ✅ | ✅ | siempre (HUD [DU], [SB4]) |
| Bloqueos del rival | ✅ propuesto | ✅ propuesto | ⚠️ #014 |
| Hábitat y atributo declarados | ✅ | ✅ | tras cerrar la declaración |
| **Carta atacante** | ✅ | ❌ | hasta que el defensor confirma |
| Carta defensora | ❌ hasta revelar | ✅ | revelación |
| Valores efectivos y desglose | ✅ | ✅ | revelación |
| Semilla RNG y estado interno | ❌ | ❌ | nunca (solo el servidor o motor) |

**Consecuencia técnica [OBL]:** el servidor nunca debe enviar la carta atacante al cliente del defensor, ni siquiera "oculta en el JSON". El motor debe ofrecer una **vista redactada por jugador**.

### A.9 Inconsistencias detectadas en el material

| # | Inconsistencia | Fuentes | Impacto |
|---|---|---|---|
| I-01 | **Hay dos tablas de estadísticas distintas.** Por ejemplo, Guepardo en [DM]: 30/55/98/82/65/100/50/80; en [CT], [SB] y [DU]: 45/60/90/75/70/100/50/65. Lobo, Pingüino (Peso 35 frente a 70), Águila y el resto también difieren | DM p.8 vs CT | **Alto**: no hay una fuente canónica (#001) |
| I-02 | Los valores efectivos del mismo duelo cambian: 92 vs 68 en [SB6] y [PJ8], 115 vs 68 en [DU]. El 68 del Elefante en Velocidad (base 40) no se explica con ninguna habilidad | SB, PJ, DU | **Alto**: no existe una fórmula real |
| I-03 | El daño es 18 tanto con margen 24 como con margen 47 | SB6, DU | Alto: falta la fórmula de daño (#003) |
| I-04 | Se confunden atributo y hábitat: "Mismo atributo: Tierra" [SB5], "Atributo utilizado: Tierra" [SB6]. El Elefante aparece como "Tierra · Fuerza" defendiendo contra Velocidad [SB6], [DU] | SB, DU | Medio: hay que fijar el vocabulario de interfaz |
| I-05 | Bloqueo: el texto dice "siguiente enfrentamiento" (1 bloqueo), pero el detalle de [SB7] muestra 2 atributos bloqueados a la vez | SB7 vs SB8 | Alto (#008) |
| I-06 | En [SB6] el Elefante sigue con 100/100 HP tras perder 18. En [PJ8] y [DU] tiene 82/100 | SB6 | Bajo |
| I-07 | HP 100 para todos, pero el Elefante tiene 120/120 en [HO]. Las cartas de [SB2] muestran **dos barras** (¿HP y energía?) | HO, SB2 | Medio (#012) |
| I-08 | La habilidad del Elefante es "+10 Defensa" en [DU] y "+10 Resistencia" en [CT] | DU vs CT | Bajo |
| I-09 | El arte muestra un **pigargo americano** (cabeza blanca) llamado "Águila real". Los tiburones de la colección de [PJ2] están etiquetados como "Ballena" y "Pingüino" | HO, PJ2 | Medio: importa al elegir fotos reales |
| I-10 | [GDD] dice "7 atributos principales" y lista 8. Indica "Versión 1.0" y 54 páginas; el PDF dice "Versión 4.0" y tiene 36 | GDD vs DM | Bajo |
| I-11 | El PDF contiene restos de generación automática ("cite turn0search0…") en las págs. 20 y 34 | DM | Bajo: limpiar |
| I-12 | La URL de invitación es `/join/7F3K2J` en [SB3] y `/sala/7F3K2J` en [PJ3] y [GDD] | SB vs PJ | Bajo: unificar |
| I-13 | [HO] incluye Tienda, Misiones, monedas, gemas, nivel de jugador, "Nv. 1" en cartas, "Modo clásico Súper Triunfo Animal" y "Modo arena", todo fuera del alcance acordado | HO, CT | Medio: ver R-10 |
| I-14 | Las rarezas de [CT] "indican la calidad del animal", lo que contradice "rareza ≠ poder". La asignación parece arbitraria (Guepardo y Elefante épicas, Lobo común) | CT | Medio (#011) |
| I-15 | La sala muestra 4 ranuras ("1/4") incluso en modo 1v1 | PJ3 | Bajo |
| I-16 | "Guepardo, habilidad +15 en Tierra" lleva la Velocidad a 115, por encima de la escala 1–100 | DU | Medio (#021) |
| I-17 | El [DM] solo especifica la IA como **defensora**, no como atacante | DM p.15 | Alto para el 1 vs IA (#019) |

---

## B. Resumen del juego (visión del Game Director)

**ATACKNIMAL es un duelo de lectura y gestión de recursos con animales reales.**

Cada jugador lleva 4 animales. En cada turno, el atacante **declara un contexto** (hábitat) y un **eje de comparación** (atributo), y elige en secreto qué animal lo representa. El defensor ve el contexto y el eje, pero no el animal, y debe decidir **con qué carta responde**.

Comparar un número con otro es trivial. La profundidad está en que **toda decisión tiene un coste futuro**:

- Usar un atributo lo **bloquea** en esa carta para su siguiente enfrentamiento. Si gastas la Velocidad del Guepardo ahora, no la tendrás después.
- Defender con tu mejor carta también la bloquea en ese atributo. Si el rival ataca con un animal mediocre para "cebar" tu mejor defensa, te deja expuesto en el turno siguiente.
- El hábitat favorece o perjudica **a ambos** animales. Elegir Agua potencia a tu Tiburón, pero también a la Ballena del rival.
- El daño depende del margen: ganar por poco hiere poco y ganar por mucho hiere mucho.

**Fantasía del jugador:** "Conozco a los animales mejor que mi rival y he leído su jugada".
**Sensación objetivo:** partidas de 8–12 minutos en el móvil, cada turno con una decisión de 10–20 segundos y una revelación tensa.
**Lo que NO es:** un "comparar cartas" de azar puro, ni un juego donde gane el animal más grande.

> ⚠️ **Advertencia de diseño (la más importante de este análisis):** con las reglas tal como están escritas, **la información oculta casi no importa**. Todos los defensores comparan el mismo atributo, así que la mejor defensa suele ser "la carta con mayor valor efectivo en ese atributo", sin importar qué animal ataque. Lo que convierte la ocultación en una decisión real es el **bloqueo** (defender con tu mejor carta tiene un coste) y el **daño por margen** (a veces conviene sacrificar una carta débil). Por eso el bloqueo es el corazón estratégico del juego y debe estar en el motor desde el día 1. Las decisiones #003, #004 y #008 deben tomarse pensando en esto.

---

## C. Flujo completo

```text
INICIO (P01)
 ├─ Jugar contra IA ──► Selección de dificultad ──► SELECCIÓN DE EQUIPO (P02) ──► Partida local
 ├─ Crear sala ───────► SELECCIÓN DE EQUIPO ──► SALA (P03): código + enlace + QR + modo ──► espera ──► Iniciar
 └─ Unirse (código / enlace / QR) ──► validar sala ──► SELECCIÓN DE EQUIPO ──► SALA (listo)
                                                                                │
                              ┌─────────────────────────────────────────────────┘
                              ▼
                   [READY] sorteo del primer atacante (semilla del servidor)
                              │
        ┌──────────────► [TURN_START] Turno N · atacante X, defensor Y
        │                     │
        │   ATACANTE          ▼
        │   1. Elige HÁBITAT ............................ (P04)
        │   2. Elige CARTA (activa) ..................... (P04)
        │   3. Elige ATRIBUTO (no bloqueado en esa carta) (P05 de PJ)
        │   4. CONFIRMA → declaración sellada (no se puede cambiar)
        │                     │  servidor/motor guarda {hábitat, carta, atributo}
        │                     ▼
        │   DEFENSOR recibe SOLO {hábitat, atributo} ...... (P05)
        │   5. Ve solo sus cartas LEGALES (activas y sin ese atributo bloqueado)
        │      · si no tiene ninguna legal → regla #009
        │   6. CONFIRMA defensa
        │                     ▼
        │   [RESOLVE] (motor, determinista)
        │   7. Revelación de ambas cartas ................ (P06)
        │   8. Valor efectivo = base + hábitat + habilidad + estado
        │   9. Comparación → ganador / empate (#005)
        │  10. Daño según fórmula (#003) y quién lo recibe (#004)
        │  11. Bloqueos: atributo usado en carta atacante y defensora (#008)
        │  12. Eliminación si HP ≤ 0
        │                     ▼
        │   [RESULT] el motor emite un CombatResolution (datos)
        │  13. Phaser anima el resultado ya decidido ...... (P06 → P07)
        │  14. React muestra registro, HP y bloqueos ...... (P07, P09)
        │                     │
        │          ¿equipo rival sin cartas activas?
        │            no │                 │ sí
        └───────────────┘                 ▼
          (rota atacante según modo)   [FINISH] VICTORIA / DERROTA (P10) ──► Estadísticas / Menú
```

---

## D. Reglas ya definidas (y su firmeza)

| Regla | Firmeza | Fuente |
|---|---|---|
| Equipos de 4 animales, roster de 11 | **Definida** | DM |
| 8 atributos, escala de 1 a 100 | **Definida** (valores no) | DM |
| 4 hábitats | **Definida** | DM |
| Orden de declaración: hábitat → carta → atributo → defensa | **Definida** | DM p.5, prompt |
| El defensor solo conoce hábitat y atributo | **Definida, crítica** | DM p.5 |
| Se compara el mismo atributo | **Definida** | PJ6, DM |
| Valor efectivo = base + hábitat + habilidad + estado, orden determinista | **Definida** (parámetros no) | DM p.12 |
| El perdedor pierde HP | **Definida** (fórmula no) | DU |
| Bloqueo de atributo tras usarlo | **Definida** (duración ambigua) | SB8 |
| Eliminación con HP 0 | **Definida** | DM p.13 |
| Victoria = eliminar las 4 cartas rivales | **Definida** | DM p.14 |
| IA sin trampas, 3 niveles | **Definida** (solo defensa) | DM p.15 |
| Sala con código, enlace y QR, el servidor valida | **Definida** | DM p.19 |
| Sin economía | **Definida** | DM p.3 |
| 2v2: orden de turnos | **Propuesta** | DM p.31 |
| Afinidad de hábitat fuerte/neutral/débil | **Propuesta** | DM p.7 |
| Habilidades pasivas por hábitat | **Ejemplos**, no sistema | CT |
| Rarezas | **Solo visual**, contradictoria | CT |
| Estadísticas de cada animal | **Provisionales** (dos tablas) | DM, CT |

---

## E. Decisiones pendientes

Cada decisión trae una recomendación. **Las marcadas con ★ bloquean la Fase 3 (motor)**; las demás pueden esperar.

### ★ DECISIÓN PENDIENTE #001: fuente canónica de estadísticas

**Problema:** [DM] y [CT] dan valores distintos para los 11 animales. Las sumas van de 520 a 688 en [DM] y de 535 a 640 en [CT].

- **A. Usar la tabla del [DM]**: es la más reciente según el PDF. Su desequilibrio es grande: Ballena 688 y Tiburón 678 frente a Pingüino 520 (+32 %).
- **B. Usar la tabla de [CT]**: es la que coincide con todos los mockups y está algo más compacta, pero el Pingüino pesa 70.
- **C. Usar ambas como referencia de identidad** (qué es alto y qué es bajo para cada animal) y **regenerar los números con el sistema de presupuesto de la sección J**, validados por simulación.

**Recomendación: C.** Ninguna de las dos tablas resiste un análisis de balance (ver J.3).

### ★ DECISIÓN PENDIENTE #002: León y otros animales del arte

**Problema:** el León es la imagen del juego, pero no está en el roster.

- **A.** Añadir el León como animal 12. Encaja en Tierra, pero sería el octavo animal terrestre.
- **B.** Mantener los 11 y quitar el León del arte.
- **C.** Mantener los 11 para el MVP y poner el León en 🧪 Expansiones, junto con primates o un animal arborícola real y otra ave.

**Recomendación: C.** Para el arte de portada usaremos animales del roster. Si quieres al León desde el principio, sugiero que entre **en lugar de** uno terrestre o junto a un animal arborícola, para no agravar el R-03.

### ★ DECISIÓN PENDIENTE #003: fórmula de daño

**Problema:** el material muestra 18 de daño con márgenes de 24 y de 47.

- **A. Daño fijo** (por ejemplo, 25). Es simple, pero ganar por 1 o por 50 da igual y se pierde la lectura del margen.
- **B. Daño proporcional al margen sin límites.** Los picos enormes aniquilan y hay mucha bola de nieve.
- **C. Daño = clamp(BASE + K × margen, MIN, MAX)**, por ejemplo con BASE 15, K 0,4, MIN 15 y MAX 45. Todos los parámetros irían en un *ruleset* versionado.

**Recomendación: C.** Los parámetros se ajustarán por simulación hasta que una carta caiga en unas 3 derrotas y la partida dure entre 14 y 22 duelos (ver R-05). El MIN garantiza que cada duelo cuente y el MAX impide que un pico de 100 sea una ejecución.

### ★ DECISIÓN PENDIENTE #004: ¿qué pasa si pierde el atacante?

- **A.** Nada. El ataque fallido solo consume el turno. Atacar no tiene riesgo y se ataca siempre con el máximo.
- **B.** El atacante recibe el daño completo (simétrico). Es arriesgado y defender pasa a ser tan valioso como atacar.
- **C.** El atacante recibe un **contraataque** del 50 % del daño.

**Recomendación: C.** Atacar tiene riesgo y la iniciativa sigue valiendo más. Si la simulación muestra una ventaja excesiva del atacante, pasaríamos a B.

### ★ DECISIÓN PENDIENTE #005: empates

- **A.** Sin daño, se aplican los bloqueos y se consume el turno.
- **B.** Desempate por un atributo secundario fijo (por ejemplo, Percepción). Es poco intuitivo.
- **C.** Gana el defensor. Esto favorece mucho al defensor con valores redondos.

**Recomendación: A.** Es transparente y la simulación medirá la tasa de empate, con objetivo por debajo del 5 %.

### ★ DECISIÓN PENDIENTE #006: modelo de hábitat

**Problema:** el hábitat debe importar sin decidir solo.

- **A. Multiplicador sobre el atributo** (por ejemplo, ×1,2). Beneficia más a los valores altos y amplía las diferencias.
- **B. Bonificación aditiva simétrica por afinidad**: cada animal tiene una afinidad con cada hábitat (Nativo +10, Adaptado +4, Neutral 0, Hostil −15). Se aplica **a las dos cartas** del duelo.
- **C. Bonificación solo para el atacante.** Convierte el hábitat en una ventaja plana del atacante, que siempre elegiría el suyo.

**Recomendación: B.** La justificación matemática está en J.6.

### ★ DECISIÓN PENDIENTE #007: ¿un animal puede luchar en cualquier hábitat?

- **A.** Sí, con la penalización de afinidad Hostil (Ballena en Árboles: −15).
- **B.** No: solo puede atacar o defender en hábitats compatibles. Reduce mucho las opciones y crea situaciones sin defensa legal.

**Recomendación: A.** Elegir un hábitat hostil para el rival es parte de la estrategia, y además A no filtra información extra.

### ★ DECISIÓN PENDIENTE #008: duración y alcance del bloqueo

**Problema:** el texto de [SB8] dice "siguiente enfrentamiento", pero [SB7] muestra dos bloqueos.

- **A. 1 participación:** el atributo queda bloqueado durante la siguiente participación de esa carta, sea atacando o defendiendo. Cada carta tiene como mucho un bloqueo.
- **B. N participaciones (por ejemplo, 2):** cada carta puede acumular hasta 2 bloqueos, lo que encaja con [SB7].
- **C. Por rondas globales** (por ejemplo, durante 2 rondas). Es independiente de si la carta juega.

**Aplicación:** el bloqueo afecta a la **carta atacante y a la defensora** en el atributo comparado. Es lo que hace que la defensa tenga coste (ver B).

**Recomendación: A como valor por defecto, parametrizado** (`lockDuration`). Simularemos A y B. A es lo que dice el texto explícito del storyboard y nunca deja una carta sin atributos (máximo 1 de 8 bloqueado). El atacante siempre tendrá 7 opciones legales, así que el caso "todos los atributos bloqueados" desaparece.

### ★ DECISIÓN PENDIENTE #009: el defensor no tiene ninguna carta legal

Ocurre si todas sus cartas activas tienen bloqueado el atributo declarado. Con pocas cartas vivas es probable.

- **A. Defensa forzada:** el defensor elige igualmente una carta activa, que lucha con valor efectivo 0 en ese atributo, pierde y recibe el daño correspondiente al margen (el MAX limita el castigo).
- **B. Pérdida automática con daño fijo** (por ejemplo, el MIN).
- **C. Prohibir al atacante elegir ese atributo.** Filtra información y elimina una jugada legítima.

**Recomendación: A.** "Atacar el atributo que el rival tiene bloqueado" es justo el tipo de lectura que queremos premiar. La interfaz lo mostrará claramente: "¡Sin defensa en Velocidad!".

### DECISIÓN PENDIENTE #010: habilidades

**Problema:** las 8 habilidades de [CT] y [DU] son "+X a un atributo en un hábitat". Duplican el sistema de hábitat y suben los picos (Guepardo 115 sería imbatible en Tierra + Velocidad).

- **A.** Mantenerlas como bonificaciones planas.
- **B.** Rediseñarlas como **efectos tácticos** que interactúan con bloqueo, daño o información. Por ejemplo: Rinoceronte "Embestida" (si gana, bloquea un segundo atributo al perdedor); Lobo "Manada" (+5 por cada aliado activo); Cocodrilo "Emboscada" (+10 al defender en Agua); Elefante "Memoria" (sus bloqueos duran 1 menos); Pingüino "Colonia" (recibe −25 % de daño en Agua); Águila "Vista aguda" (al defender, ve el **hábitat nativo** del atacante, nunca la carta)…
- **C.** Sin habilidades en el MVP y añadirlas en la Fase 4b, cuando el balance base sea estable.

**Recomendación: el motor tendrá desde el principio un sistema de habilidades guiado por datos (C + B).** El MVP arranca con habilidades desactivadas para medir el balance base, y después entra una habilidad por animal del tipo B, una a una, con simulación antes y después. Los textos de B son propuestas y cambian reglas importantes, así que esperan tu aprobación.

### DECISIÓN PENDIENTE #011: rareza

- **A. La rareza da poder** (épica = más estadísticas). La rechazo: contradice el principio del proyecto.
- **B. Rareza = complejidad o especialización** (común = perfil plano y fácil; épica = picos extremos y valles profundos, más difícil de usar). El presupuesto total es igual para todas.
- **C. Sin rareza en el MVP.**

**Recomendación: C para el MVP y B como significado futuro.** Sin economía ni sobres, la rareza no cumple ninguna función todavía. Se deja el campo en el modelo de datos (`complexity`), sin efecto en las reglas.

### DECISIÓN PENDIENTE #012: HP uniforme o variable

- **A.** 100 para todos. Se lee mejor y es más fácil de equilibrar.
- **B.** HP variable (Elefante 120, como en [HO]). Añade una dimensión de balance más.

**Recomendación: A** en el MVP, con `baseHp` en el modelo de datos para no cerrar la puerta. La segunda barra de [SB2] se descarta (o se reserva para un futuro sistema de energía 🧪).

### ★ DECISIÓN PENDIENTE #013: orden de turnos 1v1 y ventaja del primer jugador

- **A.** Alternancia estricta (A ataca, B ataca…) con primer atacante sorteado.
- **B.** El ganador del duelo sigue atacando. Genera mucha bola de nieve.

**Recomendación: A.** Si la simulación da al primer jugador más del 53 % de victorias, se compensará (por ejemplo, el segundo jugador empieza con una carta con +10 HP o el primer ataque no bloquea).

### DECISIÓN PENDIENTE #014: ¿los bloqueos del rival son públicos?

**Recomendación: sí.** Ambas cartas se revelan en cada duelo, así que un buen jugador podría deducirlos de todas formas. Ocultarlos solo premia la memoria, no la estrategia. [SB8] ya los muestra.

### DECISIÓN PENDIENTE #015: 2v2, propiedad de las cartas y quién defiende

- **A.** Cada jugador controla 2 de las 4 cartas del equipo. El defensor designado elige solo entre las suyas.
- **B.** El defensor designado elige entre las 4 cartas del equipo.

**Recomendación: A**, con una regla de relevo: si el defensor designado no tiene ninguna carta activa, defiende su compañero. También habría **marcadores rápidos** de comunicación ("Yo defiendo", "Guarda tu X"), sin chat libre en el MVP.

### DECISIÓN PENDIENTE #016: 2v2, jugador sin cartas

**Recomendación:** queda como espectador o asesor del equipo con marcadores rápidos. Sus turnos de ataque se omiten y el orden se compacta. La victoria sigue siendo eliminar las 4 cartas del equipo.

### DECISIÓN PENDIENTE #017: duración máxima de partida

**Recomendación:** límite de 30 duelos. Si se alcanza, gana el equipo con más cartas activas y, si empatan, el que tenga más HP total. Evita partidas eternas cuando dos tanques se bloquean.

### DECISIÓN PENDIENTE #018: cuentas en el MVP

**Recomendación:** jugar como **invitado con apodo** (sesión anónima del servidor). El botón "Crear cuenta / Iniciar sesión" se pospone. 🔒 La autenticación real queda en SEGURIDAD PENDIENTE.

### ★ DECISIÓN PENDIENTE #019: IA como atacante

El [DM] solo define la IA defensora. **Recomendación:** misma política por niveles para atacar. Fácil elige hábitat, carta y atributo con sesgo hacia valores altos y ruido. Normal maximiza la ventaja esperada contra la mejor defensa legal del rival. Difícil añade el coste del bloqueo propio y "cebos" para forzar bloqueos rivales. Ningún nivel lee estado oculto.

### DECISIÓN PENDIENTE #020: repeticiones

**Recomendación:** sin animales repetidos dentro de un equipo. Se permite que ambos equipos lleven el mismo animal (espejo).

### DECISIÓN PENDIENTE #021: valores efectivos por encima de 100

**Recomendación:** permitirlos. La escala 1–100 es la **base**; el valor efectivo es libre y la interfaz muestra el desglose ("100 + 10"). Topar a 100 haría inútiles las bonificaciones de los animales de 100.

### DECISIÓN PENDIENTE #022: tiempo por turno en partidas online

**Recomendación:** 30 s para declarar y 20 s para defender. Al agotarse, el servidor aplica la acción de la IA Fácil en nombre del jugador. Las desconexiones tienen 60 s de gracia para reconectar.

### DECISIÓN PENDIENTE #023: herramientas técnicas

**Recomendación:** monorepo con **npm workspaces** (ya tienes npm 11 y Node 24 instalados, sin dependencias extra), **Vite**, **Fastify + Socket.IO**, **Drizzle ORM**, **Zod** y **Vitest**. Detalle en G.

---

## F. Riesgos del proyecto

| Id | Riesgo | Tipo | Severidad | Mitigación |
|---|---|---|---|---|
| R-01 | **La información oculta no aporta decisión** si la mejor defensa siempre es "el mayor valor" | Gameplay | 🔴 Alta | Bloqueo con coste, daño por margen y contraataque (#003, #004, #008). Medirlo en simulación con la métrica "% de turnos en que la defensa óptima ≠ el máximo valor" (objetivo ≥ 25 %) |
| R-02 | **Picos absolutos** (Peso 100 de Elefante y Ballena): un ataque con ese atributo es casi imparable | Balance | 🔴 Alta | Presupuesto y reglas de cobertura (J.2–J.3) |
| R-03 | **Hábitats vacíos o con un solo animal:** Aire = Águila, de modo que declarar Aire delata al atacante. Árboles no tiene especialista | Diseño | 🟠 Media | Aceptarlo como "farol" (cualquier animal puede atacar en Aire con penalización), dar afinidad "Adaptado" en Árboles a Tigre, Guepardo y Oso, y 🧪 añadir un ave y un arborícola en la primera expansión |
| R-04 | **Correlación física:** Peso, Fuerza, Resistencia y Defensa van juntas en animales grandes, que acumulan picos | Balance | 🟠 Media | Presupuesto total fijo y valle obligatorio |
| R-05 | **Partidas largas:** 4 cartas × 100 HP con unos 18 de daño son más de 35 duelos, unos 15–20 minutos | UX móvil | 🔴 Alta | Calibrar el daño para unas 3 derrotas por carta, límite de 30 duelos y objetivo de 8–12 minutos |
| R-06 | **Ventaja del primer jugador** | Balance | 🟡 Media | Medir y compensar (#013) |
| R-07 | **Fuga de información en red:** enviar la carta atacante en el estado al defensor | Técnico | 🔴 Alta | Vistas redactadas por jugador desde el motor y un test dedicado |
| R-08 | **Licencias de imágenes:** CC-BY-NC impide monetizar después, CC-BY-SA obliga a compartir los recortes y Unsplash exige *hotlinking* | Legal | 🟠 Media | Pipeline curado con filtro de licencias y recortes por CSS en vez de archivos derivados (sección K) |
| R-09 | **"Súper Triunfo Animal"** en [HO] remite a la marca comercial *Super Trunfo* (*Top Trumps*). El núcleo "comparar atributos" es un género, pero el nombre no debe usarse | Legal / identidad | 🟠 Media | No usar ese nombre. La mecánica de información oculta y bloqueos es lo que distingue a ATACKNIMAL |
| R-10 | **Scope creep visual:** [HO] y [CT] sugieren tienda, misiones, niveles, "+100 animales" y rarezas | Producto | 🟡 Media | Tratar [HO] como visión a largo plazo, no como especificación del MVP |
| R-11 | **QR en desarrollo:** un QR con `localhost` no abre en el móvil | Técnico | 🟡 Baja | `PUBLIC_APP_URL` configurable (IP de la red local o túnel) |
| R-12 | **Phaser + React:** doble ciclo de vida, fugas de memoria al desmontar y redimensionado en móvil | Técnico | 🟡 Media | Puente único con bus de eventos, Phaser montado y desmontado por un solo componente, escena guiada por datos |
| R-13 | **Mezclar reglas en la interfaz** (calcular en React) | Arquitectura | 🟠 Media | El motor es un paquete sin dependencias de interfaz y la interfaz solo envía *acciones* |
| R-14 | **Equilibrar sin datos reales de jugadores** | Balance | 🟡 Media | Bots de varias políticas y telemetría de partidas desde el MVP online |
| R-15 | **Contenido sensible:** "pierde 18 de sangre" ([SB6]) y fotos reales de depredación | Clasificación por edades | 🟡 Baja | Usar "vitalidad" y elegir fotos sin sangre ni presas |
| R-16 | Las APIs de imágenes cambian sus condiciones y límites | Legal / técnico | 🟡 Baja | Revisar sus condiciones en la Fase 4 y guardar las fotos elegidas como datos estáticos, no consultas en tiempo de juego |

---

## G. Propuesta de arquitectura

### G.1 Principio

> **React gestiona · Phaser representa · El motor decide · El servidor valida.**

```text
┌──────────────────────────── apps/web (navegador) ────────────────────────────┐
│  React (UI, rutas, estado de pantalla)                                        │
│     │  envía Action  ▲ recibe PlayerView + CombatResolution                   │
│     ▼                │                                                        │
│  GameClient (adaptador) ── modo local: @atacknimal/engine en el navegador     │
│     │                  └─ modo online: Socket.IO ↔ servidor                    │
│     ▼ CombatResolution (datos)                                                │
│  Phaser (CombatStage) — anima; nunca calcula ni decide                        │
└──────────────────────────────────────────────────────────────────────────────┘
                         │ WebSocket (eventos tipados, Zod)
┌──────────────────────── apps/server (Node.js) ────────────────────────────────┐
│  Fastify (REST: salas, animales, partidas)  +  Socket.IO (tiempo real)         │
│  MatchService: carga estado → engine.applyAction → persiste → emite vistas     │
│  RoomService: código, enlace, caducidad      AI runner (para el modo online)   │
└────────────────────────────────────┬──────────────────────────────────────────┘
                                     ▼
                              PostgreSQL (Drizzle)
```

### G.2 Paquetes

| Paquete | Rol | Depende de |
|---|---|---|
| `@atacknimal/engine` | Reglas puras: estado, acciones, validación, resolución, bloqueos, daño, victoria, vistas redactadas, IA. **Sin dependencias de interfaz ni de red.** Determinista (RNG con semilla) | nada (solo TS) |
| `@atacknimal/content` | Datos de animales, atributos, hábitats, habilidades, imágenes y *rulesets* versionados. Validados con Zod | engine (tipos) |
| `@atacknimal/protocol` | Contratos de eventos WebSocket y DTO REST (Zod) compartidos por cliente y servidor | engine (tipos) |
| `@atacknimal/sim` | CLI de simulación masiva y reportes de balance | engine, content |
| `apps/web` | React + Vite + Phaser | engine, content, protocol |
| `apps/server` | Fastify + Socket.IO + Drizzle | engine, content, protocol |

### G.3 Motor de reglas: contrato conceptual

- `createMatch(config, seed) → MatchState`
- `getLegalActions(state, playerId) → Action[]`
- `applyAction(state, action) → { state, events } | RuleError` (función pura, sin mutaciones)
- `getPlayerView(state, playerId) → PlayerView` (**redacta** la declaración secreta)
- `ai.decide(view, difficulty, rng) → Action` (la IA recibe una **PlayerView**, nunca el `MatchState`, así que es imposible que haga trampa por construcción)

**Eventos de dominio** (por ejemplo, `AttackDeclared`, `DefenseChosen`, `CombatResolved`, `CardLocked`, `CardEliminated`, `MatchFinished`): son lo que se persiste, lo que anima Phaser y lo que alimenta las estadísticas. Repetir los eventos con la misma semilla reproduce la partida exacta, lo que sirve para reconexión, depuración, anti-trampas y QA.

### G.4 Decisiones técnicas

| Tema | Elección | Motivo |
|---|---|---|
| Lenguaje | TypeScript `strict` en todo | Pedido explícito |
| Monorepo | npm workspaces | Ya instalado y suficiente para 6 paquetes |
| Front | React + Vite + React Router + Zustand (estado de interfaz) | Ligero y estándar |
| Combate | Phaser 3 (evaluar Phaser 4 si ya es estable al llegar a la Fase 6) | Pedido explícito |
| Server | Fastify + Socket.IO | Salas, reconexión y *acks* nativos de Socket.IO |
| BD | PostgreSQL 16 + Drizzle ORM + migraciones | Tipado fuerte y SQL explícito |
| Validación | Zod en el borde (red y contenido) | Un solo esquema para cliente y servidor |
| Tests | Vitest (unitarios y de propiedades), Playwright (e2e, más adelante) | — |
| QR | Librería `qrcode` en el cliente a partir de la URL | El QR no contiene secretos |
| Config | `.env` por app + validación Zod al arrancar | — |
| Local | Docker Compose solo para PostgreSQL | Hay que comprobar que Docker esté instalado en la Fase 8 |

### G.5 Modelo de datos (conceptual)

Separa **datos reales** de **datos de juego**:

| Entidad | Campos clave | Notas |
|---|---|---|
| `Animal` (especie) | `id` (slug), `commonName`, `scientificName`, `facts` (**datos reales**: masa, velocidad máx., distribución, con `factSources`), `contentStatus` (draft/qa/published) | Nunca se usa en el cálculo |
| `AnimalGameProfile` | `animalId`, `rulesetVersion`, `stats` (8), `habitatAffinity` (4 niveles), `baseHp`, `abilityId?`, `role`, `complexity` | **Datos de juego** versionados con el balance |
| `Ability` | `id`, `trigger`, `conditions`, `effect` (datos, no código), `text` | Sistema guiado por datos |
| `Ruleset` | `version`, `damage{base,k,min,max}`, `counterDamageRatio`, `habitatModifiers`, `lockDuration`, `maxDuels`, `turnTimers` | Toda partida guarda su `rulesetVersion` |
| `AnimalImage` | `animalId`, `provider`, `sourceId`, `imageUrl`, `sourceUrl`, `author`, `authorUrl`, `license`, `licenseUrl`, `attribution`, `focalPoint`, `retrievedAt`, `checksum?`, `status` | Ver K |
| `User` | `id`, `nickname`, `createdAt`, `isGuest` | 🔒 auth pendiente |
| `Room` | `id`, `code`, `mode`, `status`, `hostId`, `expiresAt`, `maxPlayers` | — |
| `RoomPlayer` | `roomId`, `userId`, `team`, `seat`, `ready` | Para 2v2 |
| `Match` | `id`, `roomId?`, `mode`, `rulesetVersion`, `seed`, `status`, `winnerTeam?`, `startedAt`, `endedAt` | — |
| `MatchEvent` | `matchId`, `seq`, `type`, `payload`, `createdAt` | **Fuente de verdad** (*event log*) |
| `MatchSnapshot` | `matchId`, `seq`, `state` | Para reconexión rápida |

Estado de una carta en partida: `instanceId`, `animalId`, `ownerPlayerId`, `hp`, `maxHp`, `locks: [{ attribute, remaining }]`, `status: active | eliminated`.

🔒 **SEGURIDAD PENDIENTE (anotado, no bloquea):** autenticación real, autorización por sala, *rate limiting* en REST y WS, códigos de sala no enumerables, *tokens* de invitación firmados con caducidad, sanitización de apodos, secretos en un gestor, rol de PostgreSQL con mínimos privilegios, CORS y CSP estrictos, anti-trampas (validar siempre en el servidor, ya previsto por diseño), auditoría.

---

## H. Estructura inicial del repositorio

Mínima y viable. Las carpetas aparecen **cuando su fase empieza**, no antes.

```text
Atacknimal/
├── README.md
├── package.json                 # workspaces + scripts raíz
├── tsconfig.base.json           # strict
├── .editorconfig / .gitignore / .env.example
├── docs/
│   ├── diseno/                  # material original (no se edita)
│   ├── 00-ANALISIS-FASE-0.md    # este documento
│   ├── GAME_RULES.md            # Fase 1
│   ├── BALANCE.md               # Fase 1 / 12
│   ├── ARCHITECTURE.md          # Fase 2
│   ├── ROADMAP.md · CONTRIBUTING.md        # Fase 2
│   ├── ASSETS.md                # Fase 4
│   ├── API.md · DATABASE.md     # Fase 8
│   └── DECISIONES.md            # registro de decisiones (#001…)
├── packages/
│   ├── engine/                  # Fase 3
│   │   └── src/{state,actions,rules,combat,locks,damage,ai,views}/ + tests/
│   ├── content/                 # Fase 4
│   │   └── data/{animals,abilities,rulesets,images}/
│   ├── sim/                     # Fase 4 (primer pase de balance)
│   └── protocol/                # Fase 8
├── apps/
│   ├── web/                     # Fase 5–6
│   │   └── src/{app,screens,components,game-client,phaser,styles}/
│   └── server/                  # Fase 8
│       └── src/{http,ws,rooms,matches,db}/
└── tools/
    └── image-curator/           # Fase 4: CLI de búsqueda y curación de fotos
```

---

## I. Plan de desarrollo

Sigue tus fases con **tres ajustes que propongo** (necesitan tu visto bueno):

1. **Adelantar un primer pase de balance a la Fase 4.** Las estadísticas son la incógnita más grande (#001). Construir pantallas con números que luego cambian es trabajo perdido.
2. **La IA básica entra antes del MVP.** El MVP es "1 vs IA", así que hace falta una IA atacante y defensora mínima (Fácil y Normal) en la Fase 7, antes de cerrarlo.
3. **Unir salas (código) y 1v1 en la Fase 8.** El 1v1 online no existe sin sala. La Fase 10 queda para QR, enlace profundo y pulido móvil.

| Fase | Objetivo | Entregables | Verificación |
|---|---|---|---|
| **0 · Análisis** | Entender el material | Este documento | Tu revisión y decisiones ★ |
| **1 · Game design** | Cerrar reglas | `GAME_RULES.md`, `BALANCE.md` (método), ADR #001–#023 | Reglas sin ambigüedades: cada caso límite tiene respuesta |
| **2 · Arquitectura** | Esqueleto mínimo | Monorepo, `tsconfig` estricto, lint, Vitest, `ARCHITECTURE.md`, `ROADMAP.md`, `CONTRIBUTING.md` | `npm test` y `npm run typecheck` pasan |
| **3 · Motor** | Reglas jugables por código | `engine`: estado, acciones, validación, combate, daño, bloqueos, eliminación, victoria, vistas redactadas, RNG con semilla | Tests unitarios y de propiedades; test "el defensor nunca ve la carta atacante"; partida completa simulada en un test |
| **4 · Datos + balance inicial** | Contenido real | `content` con 11 perfiles y *ruleset* v0.1, `sim` con bots, curador de imágenes, `ASSETS.md` | Informe de 100 000+ duelos; métricas dentro de umbrales; 11 fotos con licencia verificada |
| **5 · Frontend** | Navegación | Inicio, Selección de equipo, Colección, Ajustes; diseño responsive móvil primero | Recorrido manual en 375 px y escritorio |
| **6 · Combate (Phaser)** | Escenario | `CombatStage`: revelación, VS, desglose, daño, eliminación; reducción de movimiento | La animación consume `CombatResolution` sin lógica propia |
| **7 · IA → MVP** | **1 vs IA jugable** | IA Fácil, Normal y Difícil (ataque y defensa) | **Hito MVP** (ver L) |
| **8 · Server + 1v1** | Online | Fastify, Socket.IO, PostgreSQL, salas por código, servidor autoritativo, reconexión, `API.md`, `DATABASE.md` | 2 navegadores juegan; test de redacción en red; reconexión sin duplicar acciones |
| **9 · 2v2** | Equipos | Asientos, orden de turnos, relevo, marcadores rápidos | 4 clientes completan una partida |
| **10 · Salas, enlace y QR** | Compartir | Enlace profundo `/sala/:code`, QR, flujo móvil, caducidad | Escanear con un teléfono real en la red local abre la sala |
| **11 · QA** | Robustez | Playwright e2e, pruebas de red y casos límite (#009, timeouts) | CI en verde |
| **12 · Balance** | Ajuste fino | Simulación con habilidades, informes por animal, atributo y hábitat | Umbrales de J.8 |
| **13 · Seguridad** | 🔒 | Todo lo listado en G.5 | Revisión de seguridad |
| **14 · Deploy** | Producción | Docker, entornos, observabilidad, backups | Entorno de staging |

En cada fase aplico tu regla de trabajo: explicar → arquitectura → archivos → implementar → ejecutar → corregir → mostrar → siguiente paso.

---

## J. Plan de balance

### J.1 Por qué sumar estadísticas no basta

En ATACKNIMAL el **atacante elige el atributo**, así que su carta vale lo que valen **sus picos**. El **defensor elige la mejor respuesta**, así que su equipo vale lo que vale **su máximo por atributo** (entre cartas activas sin bloqueo). Por eso:

- **Valor ofensivo de una carta en un atributo:** probabilidad de superar la mejor defensa legal de un equipo rival aleatorio.
- **Valor defensivo de un equipo en un atributo:** el máximo efectivo disponible.
- **Una carta "media en todo"** (por ejemplo, el Lobo) casi nunca es la mejor atacando ni defendiendo. Puede ser **objetivamente inútil** aunque su suma sea alta. El material ya teme esto ("su versatilidad no debe superar a especialistas"), pero el riesgo real es el contrario: que sea irrelevante. Su valor debe venir de una habilidad o de la flexibilidad frente a bloqueos.

### J.2 Presupuesto y forma

Cada perfil de animal debe cumplir:

| Regla | Valor inicial | Por qué |
|---|---|---|
| Suma de los 8 atributos | **560 ± 15** | El poder total es comparable |
| Picos (≥ 88) | **2** (máx. 3 si hay un valle ≤ 35) | Identidad clara |
| Medios (55–80) | 3–4 | Opciones de reserva cuando el pico está bloqueado |
| Valles (≤ 50) | **al menos 2** | Debilidad explotable: contraestrategia |
| Valor 100 | **como mucho 1 animal por atributo** | "Firma" del animal sin monopolio absoluto |

### J.3 Cobertura por atributo

En el roster de 11, cada atributo debe tener **2–3 especialistas (≥ 85)**: ni monopolio ni exceso. Análisis rápido de la tabla del [DM]:

| Atributo | Animales ≥ 85 en [DM] | Diagnóstico |
|---|---|---|
| Peso | Elefante 100, Ballena 100, Rinoceronte 95, Oso 92 | Exceso y dos valores 100 |
| Percepción | Águila 100, Lobo 92, Ballena 90, Tigre 88, Pingüino 88, Tiburón 85 | **6: casi no es una especialidad** |
| Velocidad | Guepardo 100, Águila 95, Tiburón 92, Tigre 92, Lobo 88, Ballena 85 | **6: igual** |
| Agilidad | Guepardo 98, Águila 95, Tigre 90 | Correcto |

Además, **Ballena (688)** y **Tiburón (678)** no tienen un valle real, y el **Tigre (669)** supera al Guepardo en casi todo salvo Velocidad. Con esa tabla, la simulación casi seguro mostraría a Ballena, Tiburón y Tigre por encima del 60 % de victorias y al Pingüino por debajo del 35 %.

### J.4 Correlación física

Peso, Fuerza, Resistencia y Defensa son altas a la vez en animales grandes, y Agilidad y Velocidad en los pequeños. Si se trasladan "datos reales" sin presupuesto, los gigantes acumulan 4 picos. **El presupuesto de J.2 obliga a elegir** qué dos o tres rasgos definen al animal en el juego. Los datos reales viven en `facts` e inspiran la identidad, pero no dictan los números.

### J.5 Daño, HP y valor de una carta dañada

- **El daño no reduce estadísticas**, solo la HP. Si las redujera habría una espiral de muerte: la carta dañada pierde más y más.
- **El valor de una carta dañada** se mide por su HP restante relativa al daño medio: "le quedan N derrotas". Este dato lo usarán la IA Difícil y el jugador (para decidir sacrificios).
- **El valor de una carta bloqueada** es su valor sin el atributo bloqueado durante su siguiente participación. Lo mediremos como "pérdida de valor por bloqueo" en cada atributo.

### J.6 Hábitat: por qué el modelo B es equilibrable

Con afinidad aditiva **aplicada a ambas cartas** (Nativo +10, Adaptado +4, Neutral 0, Hostil −15):

1. **El hábitat no puede invertir una diferencia de identidad.** La máxima oscilación posible es 10 − (−15) = **25 puntos**. Un pico (≥ 88) frente a un valle (≤ 50) son al menos **38 puntos**. Por tanto, **un valle nunca supera a un pico solo por el hábitat**, pero sí puede invertir un duelo entre pico y medio, o entre dos medios. Esa es la zona donde queremos que el hábitat decida.
2. **El hábitat es una elección relativa, no una ventaja plana.** La ganancia esperada del atacante es `afinidad(mi carta, h) − afinidad(su mejor defensor, h)`. Elegir Agua con el Tiburón contra un equipo con Ballena da **0** de ventaja. Contra un equipo de Tierra da **+25**. La elección depende del rival, que es justo la estrategia que buscamos.
3. **Aditivo, no multiplicativo.** Un ×1,2 suma 20 a un 100 y 8 a un 40, así que ensancha las diferencias y premia a quien ya era fuerte. Lo aditivo trata igual a todos.
4. **El hábitat filtra información a propósito** (Aire sugiere el Águila). Como cualquier animal puede atacar en cualquier hábitat (#007), esto se convierte en una capa de **farol**: declarar Aire con el Tigre para que el rival gaste su defensa anti-Águila.
5. Todos los valores son **parámetros del *ruleset***. La simulación medirá el uso de cada hábitat (objetivo: ninguno por debajo del 10 % ni por encima del 40 %).

### J.7 Habilidades

Hay que evaluar cada habilidad por su **delta de win rate** en simulación (con y sin ella). Límite inicial: **≤ +3 puntos** de win rate para el animal. Las bonificaciones planas condicionadas por hábitat se desaconsejan (#010).

### J.8 Simulación y métricas objetivo

**Método:** hay C(11,4) = **330 equipos posibles**. Un *round-robin* completo son 330 × 330 = **108 900 partidas** por política de bot, con semillas fijas y reproducibles. Usaremos tres políticas: *Random legal* (línea base), *Greedy* (máximo valor inmediato) y *Lookahead* (considera bloqueos y daño). Además se hará muestreo de duelos aislados para métricas por atributo y hábitat.

| Métrica | Objetivo | Alerta |
|---|---|---|
| Win rate por animal (equipos que lo contienen, bot Greedy y Lookahead) | 45–55 % | < 42 % o > 58 % |
| *Pick rate* en el equipo óptimo (búsqueda de los mejores equipos) | ningún animal > 50 % de los top-20 equipos | > 70 % |
| Win rate del primer jugador | 48–52 % | > 54 % |
| Uso de cada atributo por el atacante | 6–22 % | < 4 % (atributo muerto) |
| Uso de cada hábitat | 10–40 % | < 6 % |
| Tasa de empate | < 5 % | > 8 % |
| Duración de partida | 14–22 duelos | > 28 |
| Daño medio por duelo | ~33 (3 derrotas por carta) | — |
| % de defensas en que la óptima ≠ el máximo valor (R-01) | ≥ 25 % | < 10 % (la información oculta no importa) |
| Ventaja de la IA Difícil sobre la Normal | 60–70 % de victorias | < 55 % (la dificultad no se nota) |

**Salida:** informe Markdown y CSV en `packages/sim/reports/`, con comparación entre versiones del *ruleset*.

---

## K. Plan de imágenes reales

> Las condiciones de cada API se **revisarán de nuevo en la Fase 4** antes de usarlas. Lo que sigue es lo que hay que verificar, no un aval legal.

### K.1 Proveedores y condiciones a respetar

| Proveedor | Ventajas | Condiciones clave | Uso propuesto |
|---|---|---|---|
| **Wikimedia Commons** (API MediaWiki, `extmetadata`) | Licencia y autor por archivo, especies bien identificadas | CC0, CC-BY y CC-BY-SA requieren atribución. **CC-BY-SA:** un recorte guardado como archivo es obra derivada que debe compartirse con la misma licencia | **Fuente principal** por precisión de especie |
| **iNaturalist** (API v1) | Identificación científica fiable (taxón) | Cada foto lleva `license_code` del observador. Muchas son **CC-BY-NC**, que impide monetizar después. Límite de uso (~1 petición/s recomendada) | Filtrar a `cc0`, `cc-by` y `cc-by-sa` |
| **Unsplash** | Calidad fotográfica | Exige *hotlinking* de las URLs devueltas, notificar el endpoint de descarga al seleccionar, atribución "Foto de X en Unsplash" con enlaces. Modo demo de 50 peticiones/hora, con aprobación para producción | Fotos de portada y fondos |
| **Pexels** | Calidad, licencia permisiva | Atribución al proveedor y al fotógrafo cuando sea posible, enlace a Pexels | Alternativa a Unsplash |

### K.2 Pipeline (curación humana en tiempo de desarrollo)

```text
tools/image-curator (CLI, solo desarrollo, claves API en .env)
 1. Buscar   → por nombre científico en los 4 proveedores (filtro de licencias)
 2. Revisar  → lista de candidatas con licencia, autor y resolución
 3. Elegir   → una persona elige (verifica especie y que no haya contenido sangriento)
 4. Registrar→ escribe content/data/images/<animal>.json con TODOS los metadatos
               (provider, sourceId, imageUrl, sourceUrl, author, authorUrl,
                license, licenseUrl, attribution, focalPoint, retrievedAt)
               + dispara el endpoint de descarga si es Unsplash
 5. Validar  → test: cada animal publicado tiene imagen con licencia permitida
               y atribución no vacía; job opcional que comprueba URLs vivas
 6. Mostrar  → la carta usa imageUrl con recorte por CSS (object-fit + focalPoint)
               → sin archivos derivados, sin problemas de ShareAlike ni de hotlinking
 7. Acreditar→ icono ⓘ en la carta + pantalla "Créditos" con todas las atribuciones
```

**Reglas:**

- Nunca se consulta una API durante una partida. Las imágenes son **contenido curado y versionado**.
- **Lista blanca de licencias:** CC0, CC-BY, CC-BY-SA, Unsplash License y Pexels License. **NC y ND se excluyen** para no bloquear el futuro.
- Solo se cachean o descargan copias locales cuando la licencia lo permite y el proveedor no exige *hotlinking*.
- Cada imagen lleva `status` (candidate, approved, retired) para trazabilidad.

---

## L. Primer MVP: "Vertical slice 1 vs IA"

**Objetivo:** que una persona entre desde el móvil, forme un equipo de 4, juegue una partida completa contra la IA, se defienda sin conocer la carta rival, vea una revelación animada y **entienda por qué ganó o perdió**.

### Debe funcionar

1. **Inicio** con "Jugar contra IA" y selección de dificultad (Fácil y Normal; Difícil opcional).
2. **Selección de equipo:** los 11 animales con foto real y crédito, filtro por hábitat, buscador, 4 ranuras, sin repetidos.
3. **Partida local completa** con el motor ejecutándose en el navegador (sin servidor ni login):
   - Sorteo del primer atacante y alternancia.
   - Declaración: hábitat → carta → atributo → **confirmar**.
   - Defensa con información oculta y solo cartas legales, incluida la defensa forzada (#009).
   - Revelación con valores efectivos **desglosados** (base, hábitat y estado).
   - Daño, contraataque, bloqueos, eliminación, victoria o derrota, y límite de duelos.
   - **Registro del combate** como en [DU].
   - Estado del equipo propio y rival: HP, bloqueos visibles y eliminadas.
4. **Phaser:** una escena de revelación (VS, valores, golpe, barra de HP, eliminación) con opción de reducir el movimiento.
5. **Pantallas de victoria y derrota** con estadísticas básicas: duelos, daño hecho y atributo más usado.
6. **Pantalla de créditos** de fotografías.
7. **Calidad:** motor con tests (incluido el de información oculta), simulación de balance pasando los umbrales principales, TypeScript estricto y diseño responsive (375 px → escritorio).

### No entra en el MVP

Servidor, 1v1 o 2v2 online, salas y QR, cuentas, habilidades (desactivadas por *ruleset*, ver #010), rarezas, sonido elaborado, tutorial, perfil, persistencia en BD.

### Por qué este recorte

Valida **el riesgo más grande del proyecto, que es si el juego es divertido** (R-01, R-02, R-05), antes de invertir en red. Además, el mismo motor que hace funcionar el MVP es el que usará el servidor autoritativo en la Fase 8, así que no se tira nada.

---

## Siguiente paso

1. Revisar este documento.
2. Responder las decisiones **★** (#001, #002, #003, #004, #005, #006, #007, #008, #009, #013, #019). Basta con "acepto las recomendaciones" o indicar excepciones.
3. Con eso, iniciar la **Fase 1**: redactar `GAME_RULES.md` y `BALANCE.md` como especificación cerrada, sin código todavía.
