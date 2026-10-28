/**
 * Cliente HTTP educado: identifica la herramienta (política de User-Agent de Wikimedia),
 * espera entre peticiones (iNaturalist pide ≤ 60/min) y reintenta fallos de red.
 */
const USER_AGENT = 'AtacknimalCuratorBot/0.1 (https://github.com/Alejostone1/Atacknimal)';
const PAUSE_MS = 1100;
/** La red de desarrollo ha mostrado fallos de DNS intermitentes: se reintenta con espera creciente. */
const RETRIES = 6;

let lastRequest = 0;

export async function getJson(url: string): Promise<unknown> {
  for (let attempt = 1; ; attempt++) {
    const wait = lastRequest + PAUSE_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequest = Date.now();
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
      return await response.json();
    } catch (error) {
      if (attempt >= RETRIES) throw new Error(`No se pudo leer ${url}`, { cause: error });
      await sleep(PAUSE_MS * attempt * 2);
    }
  }
}

export function query(base: string, params: Record<string, string>): string {
  return `${base}?${new URLSearchParams(params).toString()}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
