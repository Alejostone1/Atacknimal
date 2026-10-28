import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.ts';

describe('configuración', () => {
  it('trata las variables vacías como ausentes y lee varios orígenes', () => {
    const config = loadConfig({
      DATABASE_URL: '',
      PGLITE_DIR: '  ',
      CORS_ORIGIN: 'https://a.vercel.app, https://b.example',
    });
    expect(config.databaseUrl).toBeUndefined();
    expect(config.pgliteDir).toBeUndefined();
    expect(config.corsOrigins).toEqual(['https://a.vercel.app', 'https://b.example']);
  });

  it('rechaza una DATABASE_URL que no es una URL', () => {
    expect(() => loadConfig({ DATABASE_URL: 'no-es-url' })).toThrow();
  });
});
