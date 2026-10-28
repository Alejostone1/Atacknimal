// @ts-check
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Reglas de arquitectura (docs/ARCHITECTURE.md §3):
 * el motor de reglas no puede depender de la interfaz, de la red ni del entorno,
 * y debe ser determinista (sin Math.random ni reloj del sistema).
 */
const ENGINE_FORBIDDEN_IMPORTS = [
  {
    group: ['react', 'react-*', 'react/*'],
    message: 'El motor no depende de React: React gestiona.',
  },
  { group: ['phaser', 'phaser/*'], message: 'El motor no depende de Phaser: Phaser representa.' },
  {
    group: ['socket.io*', 'fastify*', 'drizzle-orm*', 'pg'],
    message:
      'El motor no depende del servidor ni de la base de datos: el servidor valida usando el motor.',
  },
  {
    group: ['node:*'],
    message: 'El motor debe ejecutarse igual en navegador y servidor: sin APIs de Node.',
  },
  {
    group: ['@atacknimal/*', '!@atacknimal/engine'],
    message: 'El motor es la base: ningún otro paquete del proyecto puede ser su dependencia.',
  },
];

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', 'docs/diseno/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['*.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: { globals: globals.node },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
    languageOptions: { globals: globals.browser },
  },
  {
    // React gestiona: las pantallas no importan Phaser ni calculan reglas (ARCHITECTURE §1).
    files: ['apps/web/src/**/*.{ts,tsx}'],
    ignores: ['apps/web/src/phaser/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // Solo el paquete "phaser" (no la carpeta local ../phaser/, que es el puente permitido).
              regex: '^phaser(/.*)?$',
              message: 'Solo src/phaser/ puede usar Phaser: React gestiona, Phaser representa.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/engine/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: ENGINE_FORBIDDEN_IMPORTS }],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Usa el RNG con semilla de la partida.' },
        {
          object: 'Date',
          property: 'now',
          message: 'El motor no lee el reloj: el tiempo llega en las acciones.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date']",
          message: 'El motor no lee el reloj: el tiempo llega en las acciones.',
        },
      ],
    },
  },
);
