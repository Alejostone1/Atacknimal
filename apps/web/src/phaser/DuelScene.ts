import Phaser from 'phaser';
import type { DuelPresentation, DuelRole, DuelSide } from './presentation.ts';

/** Clave del registro con la densidad de píxeles del lienzo (la fija CombatStage). */
export const PIXEL_RATIO_KEY = 'pixelRatio';

/** Paleta del sistema visual (styles/global.css), en formato de Phaser. */
const C = {
  night: 0x0e1411,
  moss: 0x17221c,
  mossHi: 0x213028,
  slash: 0xd9432b,
  life: 0x4e9a5b,
  bone: '#ece6d6',
  lichen: '#8fa597',
  amber: '#e8a33d',
  slashText: '#d9432b',
} as const;

const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
const MONO = '"IBM Plex Mono", monospace';

interface CardView {
  container: Phaser.GameObjects.Container;
  value: Phaser.GameObjects.Text;
  hpFill: Phaser.GameObjects.Rectangle;
  hpText: Phaser.GameObjects.Text;
  width: number;
  height: number;
}

export interface PresentRequest {
  readonly data: DuelPresentation;
  readonly onDone: () => void;
}

/**
 * Escena del duelo. Recibe la presentación por el registro del juego ("presentation"),
 * la anima y avisa al terminar. No conoce las reglas: todo valor viene calculado.
 */
export class DuelScene extends Phaser.Scene {
  private shownKey: string | null = null;

  constructor() {
    super('duel');
  }

  /** Densidad del lienzo: la escena trabaja en píxeles CSS y la cámara amplía a píxeles reales. */
  private get dpr(): number {
    return (this.registry.get(PIXEL_RATIO_KEY) as number | undefined) ?? 1;
  }

  /** Tamaño visible en píxeles CSS. */
  private get viewSize(): { width: number; height: number } {
    return { width: this.scale.width / this.dpr, height: this.scale.height / this.dpr };
  }

  /** Texto rasterizado a la densidad real: nítido en celulares. */
  private text(
    x: number,
    y: number,
    content: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.Text {
    return this.add.text(x, y, content, { ...style, resolution: this.dpr });
  }

  create(): void {
    this.cameras.main.setOrigin(0, 0).setZoom(this.dpr);
    this.registry.events.on('setdata', this.onData, this);
    this.registry.events.on('changedata', this.onData, this);
    this.scale.on('resize', this.redraw, this);
    this.events.once('shutdown', () => {
      this.registry.events.off('setdata', this.onData, this);
      this.registry.events.off('changedata', this.onData, this);
      this.scale.off('resize', this.redraw, this);
    });
    const pending = this.registry.get('presentation') as PresentRequest | undefined;
    if (pending !== undefined) this.present(pending);
  }

  private readonly onData = (_parent: unknown, key: string, value: unknown): void => {
    if (key === 'presentation') this.present(value as PresentRequest);
  };

  /** Al cambiar el tamaño se redibuja el estado final (sin repetir la animación). */
  private readonly redraw = (): void => {
    const pending = this.registry.get('presentation') as PresentRequest | undefined;
    if (pending === undefined || this.shownKey !== pending.data.key) return;
    this.children.removeAll(true);
    this.build({ ...pending.data, reduceMotion: true }, () => undefined);
  };

  private present({ data, onDone }: PresentRequest): void {
    if (this.shownKey === data.key) return;
    this.shownKey = data.key;
    this.tweens.killAll();
    this.children.removeAll(true);

    const urls = [data.attacker.imageUrl, data.defender.imageUrl].filter(
      (url): url is string => url !== null && !this.textures.exists(url),
    );
    if (urls.length === 0) {
      this.build(data, onDone);
      return;
    }
    this.load.setCORS('anonymous');
    for (const url of urls) this.load.image(url, url);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      if (this.shownKey === data.key) this.build(data, onDone);
    });
    this.load.start();
  }

  private build(data: DuelPresentation, onDone: () => void): void {
    const { width: W, height: H } = this.viewSize;
    const cardW = Math.min(W * 0.4, 240);
    const left = this.card(data.attacker, cardW, W * 0.27, H * 0.52, 'attacker');
    const right = this.card(data.defender, cardW, W * 0.73, H * 0.52, 'defender');
    const caption = this.text(W / 2, Math.max(18, H * 0.06), data.caption.toUpperCase(), {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(Math.min(W, 640) * 0.05))}px`,
      fontStyle: '800',
      color: C.amber,
    }).setOrigin(0.5, 0);
    const vs = this.text(W / 2, H * 0.48, 'VS', {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(cardW * 0.32))}px`,
      fontStyle: '900 italic',
      color: C.bone,
    }).setOrigin(0.5);

    const finish = (): void => {
      this.showOutcome(data, left, right);
      this.time.delayedCall(data.reduceMotion ? 350 : 900, onDone);
    };

    if (data.reduceMotion) {
      left.value.setText(String(data.attacker.effective));
      right.value.setText(String(data.defender.effective));
      finish();
      return;
    }

    // Entrada de las cartas
    left.container.x -= W * 0.4;
    right.container.x += W * 0.4;
    for (const obj of [caption, vs]) obj.setAlpha(0);
    this.tweens.add({ targets: left.container, x: W * 0.27, duration: 380, ease: 'Cubic.Out' });
    this.tweens.add({ targets: right.container, x: W * 0.73, duration: 380, ease: 'Cubic.Out' });
    this.tweens.add({ targets: [caption, vs], alpha: 1, delay: 300, duration: 250 });

    // Los valores cuentan hasta su cifra final
    this.time.delayedCall(520, () => {
      this.countUp(left.value, data.attacker.effective);
      this.countUp(right.value, data.defender.effective);
    });

    // Impacto
    this.time.delayedCall(1300, () => {
      if (data.winner === 'tie') {
        this.cameras.main.shake(160, 0.003);
      } else {
        const hitter = data.winner === 'attacker' ? left : right;
        const towards = data.winner === 'attacker' ? 1 : -1;
        this.tweens.add({
          targets: hitter.container,
          x: hitter.container.x + towards * cardW * 0.18,
          duration: 120,
          yoyo: true,
          ease: 'Quad.In',
          onYoyo: () => {
            this.cameras.main.shake(140, 0.006);
          },
        });
      }
      this.time.delayedCall(260, finish);
    });
  }

  private card(side: DuelSide, w: number, x: number, y: number, role: DuelRole): CardView {
    const photoH = w * 0.75;
    // Zona de texto: nombre, valor, desglose y, en la base, la barra con la vitalidad debajo.
    const h = photoH + w * 0.72 + 24;
    const container = this.add.container(x, y);

    const frame = this.add
      .rectangle(0, 0, w, h, C.moss)
      .setStrokeStyle(3, role === 'attacker' ? C.slash : C.mossHi);
    container.add(frame);

    const top = -h / 2;
    if (side.imageUrl !== null && this.textures.exists(side.imageUrl)) {
      const image = this.add.image(0, 0, side.imageUrl).setOrigin(0, 0);
      const scale = Math.max(w / image.width, photoH / image.height);
      const cropW = w / scale;
      const cropH = photoH / scale;
      const cropX = (image.width - cropW) / 2;
      const cropY = (image.height - cropH) / 2;
      image.setScale(scale).setCrop(cropX, cropY, cropW, cropH);
      image.setPosition(-w / 2 - cropX * scale, top - cropY * scale);
      container.add(image);
    }

    const owner = this.text(-w / 2 + 8, top + 8, side.owner.toUpperCase(), {
      fontFamily: MONO,
      fontSize: '11px',
      color: C.bone,
      backgroundColor: '#0e1411cc',
      padding: { x: 5, y: 2 },
    }).setOrigin(0, 0);
    const name = this.text(-w / 2 + 10, top + photoH + 8, side.name.toUpperCase(), {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(w * 0.12))}px`,
      fontStyle: '800',
      color: C.bone,
    }).setOrigin(0, 0);
    const value = this.text(-w / 2 + 10, top + photoH + w * 0.22, '0', {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(w * 0.26))}px`,
      fontStyle: '900',
      color: C.amber,
    }).setOrigin(0, 0);
    const detail = this.text(-w / 2 + 10, top + photoH + w * 0.5, side.detail, {
      fontFamily: MONO,
      fontSize: `${String(Math.max(10, Math.round(w * 0.05)))}px`,
      color: C.lichen,
    }).setOrigin(0, 0);

    const barW = w - 20;
    const barY = h / 2 - 28;
    const hpBack = this.add.rectangle(-w / 2 + 10, barY, barW, 8, C.mossHi).setOrigin(0, 0.5);
    const hpFill = this.add
      .rectangle(-w / 2 + 10, barY, barW * (side.hpBefore / side.maxHp), 8, C.life)
      .setOrigin(0, 0.5);
    const hpText = this.text(
      w / 2 - 10,
      barY + 8,
      `${String(side.hpBefore)}/${String(side.maxHp)}`,
      {
        fontFamily: MONO,
        fontSize: '11px',
        color: C.lichen,
      },
    ).setOrigin(1, 0);

    container.add([owner, name, value, detail, hpBack, hpFill, hpText]);
    return { container, value, hpFill, hpText, width: w, height: h };
  }

  private countUp(text: Phaser.GameObjects.Text, target: number): void {
    const counter = { v: 0 };
    this.tweens.add({
      targets: counter,
      v: target,
      duration: 650,
      ease: 'Cubic.Out',
      onUpdate: () => {
        text.setText(String(Math.round(counter.v)));
      },
    });
  }

  private showOutcome(data: DuelPresentation, left: CardView, right: CardView): void {
    const views: Record<DuelRole, CardView> = { attacker: left, defender: right };
    const sides: Record<DuelRole, DuelSide> = { attacker: data.attacker, defender: data.defender };
    const animate = !data.reduceMotion;

    for (const role of ['attacker', 'defender'] as const) {
      const view = views[role];
      const side = sides[role];
      const barW = view.width - 20;
      const ratio = side.hpAfter / side.maxHp;
      view.hpText.setText(`${String(side.hpAfter)}/${String(side.maxHp)}`);
      if (animate) this.tweens.add({ targets: view.hpFill, width: barW * ratio, duration: 500 });
      else view.hpFill.width = barW * ratio;
    }

    if (data.damage !== null) {
      const target = views[data.damage.target];
      const dmg = this.text(
        target.container.x,
        target.container.y - target.height * 0.2,
        `−${String(data.damage.amount)}`,
        {
          fontFamily: DISPLAY,
          fontSize: `${String(Math.round(target.width * 0.3))}px`,
          fontStyle: '900',
          color: C.slashText,
          stroke: '#0e1411',
          strokeThickness: 6,
        },
      ).setOrigin(0.5);
      if (animate) {
        this.tweens.add({
          targets: dmg,
          y: dmg.y - target.height * 0.18,
          duration: 700,
          ease: 'Cubic.Out',
        });
      }
    }

    const { width: W, height: H } = this.viewSize;
    const label =
      data.winner === 'tie' ? 'EMPATE' : `GANA ${sides[data.winner].name.toUpperCase()}`;
    this.text(W / 2, H - Math.max(16, H * 0.05), label, {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(Math.min(W, 640) * 0.06))}px`,
      fontStyle: '900',
      color: data.winner === 'tie' ? C.bone : C.amber,
    }).setOrigin(0.5, 1);

    if (data.eliminated !== null) {
      const out = views[data.eliminated];
      out.container.setAlpha(0.4);
      this.text(out.container.x, out.container.y, 'ELIMINADO', {
        fontFamily: DISPLAY,
        fontSize: `${String(Math.round(out.width * 0.17))}px`,
        fontStyle: '900',
        color: C.slashText,
        stroke: '#0e1411',
        strokeThickness: 6,
      })
        .setOrigin(0.5)
        .setAngle(-12);
    }
  }
}
