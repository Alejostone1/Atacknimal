# ATACKNIMAL · Despliegue

Cómo publicar el juego para compartir el enlace de una sala con cualquiera (decisión #035, opción A). Se puede seguir desde el celular.

**Estado (2026-10-28): ✅ desplegado.**

| | Dirección |
|---|---|
| Juego | https://atacknimal.vercel.app |
| Servidor | https://atacknimal-server.onrender.com (`/health`) |
| Base de datos | Neon (PostgreSQL, Oregón), proyecto `atacknimal` · `/health` muestra `"storage":"postgres"` |

| Pieza | Servicio | Plan | Archivo de configuración |
|---|---|---|---|
| Web (React) | **Vercel** | Gratis | [`vercel.json`](../vercel.json) |
| Servidor de juego (Socket.IO) | **Render** | Gratis | [`render.yaml`](../render.yaml) |
| Base de datos (opcional) | **Neon** (PostgreSQL) | Gratis | Variable `DATABASE_URL` en Render |

> **Por qué no todo en Vercel:** Vercel ejecuta funciones que viven unos segundos y no puede mantener las conexiones WebSocket que usa una partida online. Por eso el servidor de juego va en Render, que mantiene el proceso encendido.

Las cuentas las creas tú (puedes entrar con tu cuenta de GitHub en los tres servicios). Cada `git push` a `main` vuelve a desplegar la web y el servidor automáticamente.

---

## Paso 1 · Servidor en Render

1. Entra en **render.com** e inicia sesión con GitHub.
2. **New → Blueprint** y elige el repositorio `Alejostone1/Atacknimal`. Render lee `render.yaml` y propone el servicio `atacknimal-server`.
3. Te pedirá dos variables:
   - `CORS_ORIGIN`: de momento escribe `https://atacknimal.vercel.app` (la corregimos en el paso 3 si Vercel te da otro dominio).
   - `DATABASE_URL`: **déjala vacía** por ahora (ver paso 4).
4. **Apply**. Cuando termine, copia la dirección del servicio, algo como `https://atacknimal-server.onrender.com`.
5. Comprueba que responde: abre `https://…onrender.com/health` y debe mostrar `{"status":"ok",…}`.

## Paso 2 · Web en Vercel

1. Entra en **vercel.com** e inicia sesión con GitHub.
2. **Add New → Project** e importa `Alejostone1/Atacknimal`.
3. Deja la carpeta raíz del repositorio (no `apps/web`): `vercel.json` ya indica cómo instalar, compilar y dónde está el resultado.
4. En **Environment Variables** añade:
   - `VITE_GAME_SERVER_URL` = la dirección de Render del paso 1 (sin barra final).
5. **Deploy**. Copia el dominio que te asigne, por ejemplo `https://atacknimal.vercel.app`.

## Paso 3 · Conectar las dos piezas

Si el dominio de Vercel **no** es exactamente el que pusiste en el paso 1:

1. En Render: servicio `atacknimal-server` → **Environment** → `CORS_ORIGIN` = tu dominio de Vercel.
2. **Save changes** (Render vuelve a desplegar solo).

`CORS_ORIGIN` admite varios dominios separados por comas (por ejemplo, para añadir un dominio propio más adelante).

## Paso 4 (opcional) · Base de datos en Neon

Sin `DATABASE_URL` el servidor guarda en memoria (`DB_DRIVER=memory` en `render.yaml`; PGlite no cabe en los 512 MB del plan gratuito): **el juego funciona igual**, pero el historial de partidas se borra cuando Render reinicia el servidor. Para conservarlo:

1. Entra en **neon.tech**, crea un proyecto (región cercana, por ejemplo São Paulo o EE. UU. Este).
2. Copia la **connection string** (empieza por `postgresql://` y termina en `?sslmode=require`).
3. En Render → **Environment** → `DATABASE_URL` = esa cadena → **Save changes**.

Las tablas se crean solas al arrancar (migraciones de [DATABASE.md](DATABASE.md)). La cadena es un **secreto**: no la pegues en el código ni en el chat.

## Paso 5 · Probar

1. Abre tu dominio de Vercel en el celular → **Crear sala**.
2. **Copiar enlace** y envíaselo a alguien (o ábrelo en otro dispositivo).
3. Juegan una partida 1 vs 1.

---

## Qué esperar del plan gratuito

- **Render se duerme** tras unos 15 minutos sin uso. La primera visita después tarda alrededor de **un minuto** en conectar (la pantalla muestra "Conectando…").
- **Al dormirse o reiniciarse, las salas en curso se pierden** (viven en memoria; [DATABASE.md](DATABASE.md) §5).
- Si el juego se usa a menudo, el plan de pago más barato de Render evita que se duerma.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| "El servidor no responde" al crear sala | Render está despertando (espera un minuto) o `VITE_GAME_SERVER_URL` está mal escrita. Tras cambiarla en Vercel hay que **volver a desplegar** (se incrusta al compilar) |
| La sala no conecta y la consola del navegador habla de CORS | `CORS_ORIGIN` en Render no coincide exactamente con el dominio de Vercel (incluido `https://`, sin barra final) |
| Un enlace `/sala/XXXXXX` da 404 | Falta la regla `rewrites` de `vercel.json` (ya incluida) |
| Render falla al arrancar | Revisa en sus *logs* que use Node 24 (`NODE_VERSION` en `render.yaml`) |
| Render: "Ran out of memory (used over 512MB)" | Falta `DB_DRIVER=memory` y se está cargando PGlite |

🔒 Pendiente antes de un uso más amplio: ARCHITECTURE §10 (límites de peticiones, sesiones firmadas, límite de tiempo para elegir equipo).
