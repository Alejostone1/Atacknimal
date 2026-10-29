// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { findEntry } from '../content/catalog.ts';
import { AnimalCard } from './AnimalCard.tsx';
import { RoomQr } from './RoomQr.tsx';
import { TeamSlots } from './TeamSlots.tsx';

afterEach(cleanup);

const wolf = findEntry('wolf');
if (wolf === undefined) throw new Error('Falta el lobo');

describe('AnimalCard', () => {
  it('en la colección enlaza a la ficha y muestra nombre, especie y picos', () => {
    render(
      <MemoryRouter>
        <AnimalCard entry={wolf} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/coleccion/wolf');
    expect(screen.getByRole('heading', { name: 'Lobo' })).toBeTruthy();
    expect(screen.getByText('Canis lupus')).toBeTruthy();
    expect(screen.getByText('Percepción')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Lobo (Canis lupus)' })).toBeTruthy();
  });

  it('al formar el equipo es un interruptor que anuncia su puesto', () => {
    const onToggle = vi.fn();
    render(
      <MemoryRouter>
        <AnimalCard entry={wolf} onToggle={onToggle} slot={2} />
      </MemoryRouter>,
    );
    const button = screen.getByRole('button', { name: 'Lobo, en tu equipo (puesto 2)' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('bloqueada no responde al pulsarla', () => {
    const onToggle = vi.fn();
    render(
      <MemoryRouter>
        <AnimalCard entry={wolf} onToggle={onToggle} blocked />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe('TeamSlots', () => {
  it('muestra los puestos vacíos y permite quitar un animal', () => {
    const onRemove = vi.fn();
    render(<TeamSlots team={['wolf']} size={4} onRemove={onRemove} />);
    expect(screen.getByRole('list', { name: 'Equipo: 1 de 4' }).children).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Lobo del equipo' }));
    expect(onRemove).toHaveBeenCalledWith('wolf');
  });
});

describe('RoomQr', () => {
  it('dibuja el QR del enlace como un SVG accesible y cuadrado', () => {
    render(<RoomQr url="https://atacknimal.vercel.app/sala/7F3K2J" label="QR de la sala" />);
    const svg = screen.getByRole('img', { name: 'QR de la sala' });
    const [, , width, height] = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number);
    // Versión 3 con corrección M (29 módulos) más 2 de borde por lado.
    expect(width).toBe(33);
    expect(height).toBe(width);
    expect(svg.querySelector('path')?.getAttribute('d')?.length).toBeGreaterThan(100);
  });
});
