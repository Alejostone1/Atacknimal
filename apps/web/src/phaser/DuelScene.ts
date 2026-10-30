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
  amber: 0xe8a33d,
  life: 0x4e9a5b,
  white: 0xffffff,
  bone: '#ece6d6',
  lichen: '#8fa597',
  amberText: '#e8a33d',
  slashText: '#d9432b',
  nightText: '#0e1411',
} as const;

const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
const MONO = '"IBM Plex Mono", monospace';

/** Texturas generadas una vez por juego para los efectos. */
const SPARK = 'fx-spark';
const SHARD = 'fx-shard';
const GLOW = 'fx-glow';

/** Pausa de impacto: el golpe "se siente" congelando la escena un instante. */
const HIT_STOP_MS = 70;
/** Encendido y apagado del aura que se carga antes del choque. */
const AURA_FADE_MS = 300;

/**
 * Coreografía del duelo (ms desde el inicio). Separada del código para poder ajustar el ritmo
 * sin tocar la lógica: entrada, volteo, cuenta, choque y resultado.
 */
const T = {
  enter: 120,
  enterDuration: 480,
  flipAttacker: 700,
  flipDefender: 880,
  flipHalf: 130,
  count: 1100,
  countDuration: 650,
  clash: 1900,
  dash: 170,
  outcome: 2150,
  done: 1100,
} as const;

interface CardView {
  readonly role: DuelRole;
  readonly container: Phaser.GameObjects.Container;
  readonly face: Phaser.GameObjects.Container;
  readonly back: Phaser.GameObjects.Container;
  readonly photo: Phaser.GameObjects.Image | null;
  readonly frame: Phaser.GameObjects.Rectangle;
  readonly value: Phaser.GameObjects.Text;
  readonly hpFill: Phaser.GameObjects.Rectangle;
  readonly hpGhost: Phaser.GameObjects.Rectangle;
  readonly hpText: Phaser.GameObjects.Text;
  readonly barW: number;
  readonly width: number;
  readonly height: number;
  readonly homeX: number;
  readonly homeY: number;
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
    this.makeTextures();
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

  /** Chispa redonda y esquirla alargada, en blanco para teñirlas por emisor. */
  private makeTextures(): void {
    if (!this.textures.exists(SPARK)) {
      const g = this.make.graphics({}, false);
      g.fillStyle(C.white, 1).fillCircle(6, 6, 6);
      g.generateTexture(SPARK, 12, 12);
      g.destroy();
    }
    if (!this.textures.exists(GLOW)) {
      // Resplandor radial suave, blanco para teñirlo (aura y brillo del ganador).
      const size = 128;
      const canvas = this.textures.createCanvas(GLOW, size, size);
      const ctx = canvas?.getContext();
      if (canvas !== null && ctx !== undefined) {
        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2,
        );
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.45, 'rgba(255,255,255,0.45)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();
      }
    }
    if (!this.textures.exists(SHARD)) {
      const g = this.make.graphics({}, false);
      g.fillStyle(C.white, 1).fillRect(0, 0, 14, 3);
      g.generateTexture(SHARD, 14, 3);
      g.destroy();
    }
  }

  private readonly onData = (_parent: unknown, key: string, value: unknown): void => {
    if (key === 'presentation') this.present(value as PresentRequest);
  };

  /** Al cambiar el tamaño se redibuja el estado final (sin repetir la animación). */
  private readonly redraw = (): void => {
    this.cameras.main.setZoom(this.dpr);
    const pending = this.registry.get('presentation') as PresentRequest | undefined;
    if (pending === undefined || this.shownKey !== pending.data.key) return;
    this.reset();
    this.build({ ...pending.data, reduceMotion: true }, () => undefined);
  };

  private reset(): void {
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.cameras.main.resetFX();
    this.children.removeAll(true);
  }

  private present({ data, onDone }: PresentRequest): void {
    if (this.shownKey === data.key) return;
    this.shownKey = data.key;
    this.reset();

    const urls = [data.attacker.imageUrl, data.defender.imageUrl, data.backdropUrl].filter(
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

  /* ---------- Construcción ---------- */

  private build(data: DuelPresentation, onDone: () => void): void {
    const { width: W, height: H } = this.viewSize;
    const animate = !data.reduceMotion;

    this.backdrop(data.backdropUrl, W, H, animate);

    const caption = this.text(W / 2, Math.max(14, H * 0.05), data.caption.toUpperCase(), {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(Math.min(W, 640) * 0.055))}px`,
      fontStyle: '800',
      color: C.amberText,
      stroke: C.nightText,
      strokeThickness: 4,
    }).setOrigin(0.5, 0);

    // Las cartas caben en el alto disponible: si no, se estrechan.
    let cardW = Math.min(W * 0.4, 230);
    const cardH = (w: number): number => w * 0.72 + w * 0.8 + 18;
    // Dejan sitio al titular de arriba y al resultado de abajo.
    const maxH = H * 0.66;
    if (cardH(cardW) > maxH) cardW = (maxH - 18) / 1.52;
    const centerY = H * 0.51;
    const left = this.card(data.attacker, 'attacker', cardW, W * 0.27, centerY);
    const right = this.card(data.defender, 'defender', cardW, W * 0.73, centerY);

    const vs = this.text(W / 2, centerY - cardH(cardW) * 0.08, 'VS', {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(cardW * 0.34))}px`,
      fontStyle: '900 italic',
      color: C.bone,
      stroke: C.nightText,
      strokeThickness: 6,
    }).setOrigin(0.5);

    if (!animate) {
      // Estado final: el VS ya cumplió su papel y solo taparía el resultado.
      vs.setVisible(false);
      for (const view of [left, right]) this.showFace(view);
      left.value.setText(String(data.attacker.effective));
      right.value.setText(String(data.defender.effective));
      this.outcome(data, left, right, false);
      this.time.delayedCall(350, onDone);
      return;
    }

    // 1 · Titular y entrada de las cartas boca abajo.
    caption.setAlpha(0).setY(caption.y - 16);
    this.tweens.add({
      targets: caption,
      alpha: 1,
      y: caption.y + 16,
      duration: 380,
      ease: 'Back.Out',
    });
    vs.setScale(0).setAlpha(0);
    left.container.x = -cardW;
    right.container.x = W + cardW;
    for (const view of [left, right]) {
      view.container.setAngle(view.role === 'attacker' ? -8 : 8);
      this.tweens.add({
        targets: view.container,
        x: view.homeX,
        angle: 0,
        delay: T.enter,
        duration: T.enterDuration,
        ease: 'Back.Out',
      });
    }

    // 2 · Volteo: primero el atacante, después el defensor.
    this.time.delayedCall(T.flipAttacker, () => {
      this.flip(left);
    });
    this.time.delayedCall(T.flipDefender, () => {
      this.flip(right);
    });

    // 3 · Los valores cuentan y aparece el VS.
    this.time.delayedCall(T.count, () => {
      this.aura(left, C.amber);
      this.aura(right, C.white);
      this.countUp(left.value, data.attacker.effective);
      this.countUp(right.value, data.defender.effective);
      this.tweens.add({ targets: vs, scale: 1, alpha: 1, duration: 320, ease: 'Back.Out' });
    });

    // 4 · Choque.
    this.time.delayedCall(T.clash, () => {
      this.tweens.add({ targets: vs, alpha: 0, scale: 1.6, duration: 200 });
      if (data.winner === 'tie') this.clashTie(left, right);
      else {
        const hitter = data.winner === 'attacker' ? left : right;
        const target = data.winner === 'attacker' ? right : left;
        this.charge(hitter, target);
      }
    });

    // 5 · Resultado.
    this.time.delayedCall(T.outcome, () => {
      this.outcome(data, left, right, true);
      this.time.delayedCall(T.done, onDone);
    });
  }

  /** Foto del hábitat a pantalla completa, oscurecida, con un zoom lento. */
  private backdrop(url: string | null, W: number, H: number, animate: boolean): void {
    this.add.rectangle(0, 0, W, H, C.night).setOrigin(0, 0);
    if (url === null || !this.textures.exists(url)) return;
    const image = this.add.image(W / 2, H / 2, url);
    const scale = Math.max(W / image.width, H / image.height);
    image.setScale(scale).setAlpha(animate ? 0 : 0.42);
    this.add.rectangle(0, 0, W, H, C.night, 0.45).setOrigin(0, 0);
    if (!animate) return;
    this.tweens.add({ targets: image, alpha: 0.42, duration: 500 });
    this.tweens.add({ targets: image, scale: scale * 1.08, duration: 4000, ease: 'Sine.Out' });
  }

  private card(side: DuelSide, role: DuelRole, w: number, x: number, y: number): CardView {
    const photoH = w * 0.72;
    const h = photoH + w * 0.8 + 18;
    const top = -h / 2;
    const container = this.add.container(x, y);

    /* Reverso: musgo con tres zarpazos ámbar. */
    const back = this.add.container(0, 0);
    back.add(this.add.rectangle(0, 0, w, h, C.moss).setStrokeStyle(3, C.amber));
    const claws = this.add.graphics();
    claws.fillStyle(C.amber, 0.85);
    for (const dx of [-0.18, 0, 0.18]) {
      const cx = dx * w;
      claws.fillPoints(
        [
          new Phaser.Math.Vector2(cx + w * 0.06, -h * 0.22),
          new Phaser.Math.Vector2(cx + w * 0.1, -h * 0.22),
          new Phaser.Math.Vector2(cx - w * 0.06, h * 0.22),
          new Phaser.Math.Vector2(cx - w * 0.09, h * 0.22),
        ],
        true,
      );
    }
    back.add(claws);

    /* Anverso: foto, nombre, valor, desglose y vitalidad. */
    const face = this.add.container(0, 0).setVisible(false);
    const frame = this.add
      .rectangle(0, 0, w, h, C.moss)
      .setStrokeStyle(3, role === 'attacker' ? C.slash : C.mossHi);
    face.add(frame);

    let photo: Phaser.GameObjects.Image | null = null;
    if (side.imageUrl !== null && this.textures.exists(side.imageUrl)) {
      photo = this.add.image(0, 0, side.imageUrl).setOrigin(0, 0);
      const scale = Math.max(w / photo.width, photoH / photo.height);
      const cropW = w / scale;
      const cropH = photoH / scale;
      const cropX = (photo.width - cropW) / 2;
      const cropY = (photo.height - cropH) / 2;
      photo.setScale(scale).setCrop(cropX, cropY, cropW, cropH);
      photo.setPosition(-w / 2 - cropX * scale, top - cropY * scale);
      face.add(photo);
    }

    const pad = Math.max(8, w * 0.05);
    const owner = this.text(-w / 2 + 8, top + 8, side.owner.toUpperCase(), {
      fontFamily: MONO,
      fontSize: '11px',
      color: C.bone,
      backgroundColor: '#0e1411cc',
      padding: { x: 5, y: 2 },
    });
    const name = this.text(-w / 2 + pad, top + photoH + 6, side.name.toUpperCase(), {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(w * 0.12))}px`,
      fontStyle: '800',
      color: C.bone,
    });
    // El nombre largo se reduce hasta caber en una línea.
    if (name.width > w - pad * 2) name.setScale((w - pad * 2) / name.width);
    const value = this.text(-w / 2 + pad, top + photoH + w * 0.19, '0', {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(w * 0.26))}px`,
      fontStyle: '900',
      color: C.amberText,
    });
    // El desglose puede ocupar dos líneas: nunca se sale de la carta.
    const detail = this.text(-w / 2 + pad, top + photoH + w * 0.48, side.detail, {
      fontFamily: MONO,
      fontSize: `${String(Math.max(9, Math.round(w * 0.048)))}px`,
      color: C.lichen,
      wordWrap: { width: w - pad * 2, useAdvancedWrap: true },
      lineSpacing: 1,
    });

    const barW = w - pad * 2;
    const barY = h / 2 - 24;
    const hpBack = this.add.rectangle(-w / 2 + pad, barY, barW, 8, C.mossHi).setOrigin(0, 0.5);
    const startW = barW * (side.hpBefore / side.maxHp);
    const hpGhost = this.add.rectangle(-w / 2 + pad, barY, startW, 8, C.white).setOrigin(0, 0.5);
    const hpFill = this.add.rectangle(-w / 2 + pad, barY, startW, 8, C.life).setOrigin(0, 0.5);
    const hpText = this.text(
      w / 2 - pad,
      barY + 7,
      `${String(side.hpBefore)}/${String(side.maxHp)}`,
      {
        fontFamily: MONO,
        fontSize: '11px',
        color: C.lichen,
      },
    ).setOrigin(1, 0);

    face.add([owner, name, value, detail, hpBack, hpGhost, hpFill, hpText]);
    container.add([back, face]);
    return {
      role,
      container,
      face,
      back,
      photo,
      frame,
      value,
      hpFill,
      hpGhost,
      hpText,
      barW,
      width: w,
      height: h,
      homeX: x,
      homeY: y,
    };
  }

  /* ---------- Efectos ---------- */

  private showFace(view: CardView): void {
    view.back.setVisible(false);
    view.face.setVisible(true);
  }

  /** Volteo: la carta se estrecha, cambia de cara y se abre con un pequeño rebote. */
  private flip(view: CardView): void {
    this.tweens.add({
      targets: view.container,
      scaleX: 0,
      duration: T.flipHalf,
      ease: 'Quad.In',
      onComplete: () => {
        this.showFace(view);
        this.tweens.add({
          targets: view.container,
          scaleX: 1,
          duration: T.flipHalf + 60,
          ease: 'Back.Out',
        });
      },
    });
  }

  private countUp(text: Phaser.GameObjects.Text, target: number): void {
    const counter = { v: 0 };
    this.tweens.add({
      targets: counter,
      v: target,
      duration: T.countDuration,
      ease: 'Cubic.Out',
      onUpdate: () => {
        text.setText(String(Math.round(counter.v)));
      },
      onComplete: () => {
        this.tweens.add({ targets: text, scale: 1.18, duration: 110, yoyo: true });
      },
    });
  }

  /** La carta ganadora embiste a la otra; el impacto llega al final de la carrera. */
  private charge(hitter: CardView, target: CardView): void {
    const towards = target.homeX > hitter.homeX ? 1 : -1;
    const reach = Math.abs(target.homeX - hitter.homeX) - hitter.width * 0.9;
    this.tweens.add({
      targets: hitter.container,
      x: hitter.homeX + towards * reach,
      angle: towards * 6,
      duration: T.dash,
      ease: 'Quad.In',
      onComplete: () => {
        this.impact(target, hitter.homeX + towards * (reach + hitter.width / 2), towards);
        this.tweens.add({
          targets: hitter.container,
          x: hitter.homeX,
          angle: 0,
          duration: 320,
          ease: 'Back.Out',
        });
      },
    });
  }

  /** Empate: las dos cartas chocan en el centro y rebotan. */
  private clashTie(left: CardView, right: CardView): void {
    const { width: W } = this.viewSize;
    for (const view of [left, right]) {
      const towards = view.role === 'attacker' ? 1 : -1;
      this.tweens.add({
        targets: view.container,
        x: W / 2 - towards * (view.width / 2 + 2),
        duration: T.dash,
        ease: 'Quad.In',
        yoyo: true,
        hold: 60,
      });
    }
    this.time.delayedCall(T.dash, () => {
      this.cameras.main.shake(160, 0.006);
      this.shockwave(W / 2, left.homeY, C.white, left.width * 0.8);
      this.sparks(W / 2, left.homeY, 0, C.bone);
    });
  }

  private impact(target: CardView, contactX: number, towards: number): void {
    const { width: W, height: H } = this.viewSize;
    this.hitStop();
    this.cameras.main.shake(220, 0.012);
    this.shockwave(contactX, target.homeY - target.height * 0.1, C.amber, target.width);
    const flash = this.add.rectangle(0, 0, W, H, C.white, 0.3).setOrigin(0, 0);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 160,
      onComplete: () => {
        flash.destroy();
      },
    });

    this.sparks(contactX, target.homeY - target.height * 0.1, towards, C.amberText);
    this.slash(target);

    // Retroceso y foto teñida de rojo un instante.
    this.tweens.add({
      targets: target.container,
      x: target.homeX + towards * target.width * 0.1,
      angle: towards * 4,
      duration: 90,
      yoyo: true,
      ease: 'Quad.Out',
    });
    target.photo?.setTint(0xff7a6a);
    this.time.delayedCall(180, () => {
      target.photo?.clearTint();
    });
  }

  /** Chispas y esquirlas que salen en la dirección del golpe. */
  private sparks(x: number, y: number, towards: number, color: string): void {
    const tint = Phaser.Display.Color.HexStringToColor(color).color;
    const angle =
      towards === 0
        ? { min: 0, max: 360 }
        : towards > 0
          ? { min: -70, max: 70 }
          : { min: 110, max: 250 };
    const sparks = this.add.particles(0, 0, SPARK, {
      speed: { min: 120, max: 380 },
      angle,
      scale: { start: 0.7, end: 0 },
      lifespan: { min: 300, max: 650 },
      tint,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    const shards = this.add.particles(0, 0, SHARD, {
      speed: { min: 200, max: 460 },
      angle,
      rotate: { min: 0, max: 360 },
      scale: { start: 1, end: 0.3 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 250, max: 500 },
      tint: C.white,
      emitting: false,
    });
    sparks.explode(26, x, y);
    shards.explode(12, x, y);
    this.time.delayedCall(900, () => {
      sparks.destroy();
      shards.destroy();
    });
  }

  /** Tres zarpazos rojos que cruzan la carta golpeada y se desvanecen. */
  private slash(target: CardView): void {
    const g = this.add.graphics({ x: target.homeX, y: target.homeY });
    const w = target.width;
    const h = target.height;
    g.fillStyle(C.slash, 0.9);
    for (const dx of [-0.2, 0, 0.2]) {
      g.fillPoints(
        [
          new Phaser.Math.Vector2(dx * w + w * 0.14, -h * 0.34),
          new Phaser.Math.Vector2(dx * w + w * 0.2, -h * 0.34),
          new Phaser.Math.Vector2(dx * w - w * 0.12, h * 0.3),
          new Phaser.Math.Vector2(dx * w - w * 0.16, h * 0.3),
        ],
        true,
      );
    }
    g.setScale(0.2).setAlpha(0);
    this.tweens.add({ targets: g, scale: 1, alpha: 1, duration: 110, ease: 'Quad.Out' });
    this.tweens.add({
      targets: g,
      alpha: 0,
      delay: 380,
      duration: 400,
      onComplete: () => {
        g.destroy();
      },
    });
  }

  /** Congela las animaciones un instante para dar peso al golpe. */
  private hitStop(): void {
    this.tweens.pauseAll();
    this.time.delayedCall(HIT_STOP_MS, () => {
      this.tweens.resumeAll();
    });
  }

  /** Dos anillos que se expanden desde el punto de choque. */
  private shockwave(x: number, y: number, color: number, size: number): void {
    for (const [i, width] of [6, 3].entries()) {
      const ring = this.add.circle(x, y, size * 0.25).setStrokeStyle(width, color, 1);
      ring.setFillStyle();
      ring.setScale(0.2).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: ring,
        scale: 2.6 + i,
        alpha: 0,
        delay: i * 90,
        duration: 520,
        ease: 'Cubic.Out',
        onComplete: () => {
          ring.destroy();
        },
      });
    }
  }

  /** Resplandor teñido detrás de una carta (aditivo: ilumina sin tapar). */
  private glowBehind(view: CardView, tint: number, spread: number): Phaser.GameObjects.Image {
    const glow = this.add
      .image(view.homeX, view.homeY, GLOW)
      .setDisplaySize(view.width * spread, view.height * spread)
      .setTint(tint)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.children.moveBelow(glow, view.container);
    return glow;
  }

  /** Energía que se carga mientras cuentan los valores: aura y chispas que suben. */
  private aura(view: CardView, tint: number): void {
    const glow = this.glowBehind(view, tint, 1.45).setAlpha(0);
    this.tweens.add({
      targets: glow,
      alpha: 0.5,
      duration: AURA_FADE_MS,
      yoyo: true,
      // Se mantiene encendida hasta el choque y se apaga con él.
      hold: T.clash - T.count - AURA_FADE_MS,
      onComplete: () => {
        glow.destroy();
      },
    });
    const motes = this.add.particles(0, 0, SPARK, {
      x: { min: view.homeX - view.width / 2, max: view.homeX + view.width / 2 },
      y: view.homeY + view.height / 2,
      speedY: { min: -160, max: -60 },
      speedX: { min: -12, max: 12 },
      scale: { start: 0.45, end: 0 },
      lifespan: { min: 500, max: 900 },
      frequency: 40,
      tint,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.children.moveBelow(motes, view.container);
    this.time.delayedCall(T.clash - T.count, () => {
      motes.stop();
    });
    this.time.delayedCall(T.clash - T.count + 1000, () => {
      motes.destroy();
    });
  }

  /* ---------- Resultado ---------- */

  private outcome(data: DuelPresentation, left: CardView, right: CardView, animate: boolean): void {
    const views: Record<DuelRole, CardView> = { attacker: left, defender: right };
    const sides: Record<DuelRole, DuelSide> = { attacker: data.attacker, defender: data.defender };

    for (const role of ['attacker', 'defender'] as const) {
      const view = views[role];
      const side = sides[role];
      const target = view.barW * (side.hpAfter / side.maxHp);
      view.hpText.setText(`${String(side.hpAfter)}/${String(side.maxHp)}`);
      if (side.hpAfter / side.maxHp <= 0.3) view.hpFill.setFillStyle(C.slash);
      if (animate) {
        // La barra baja al momento; el rastro blanco la sigue un poco después.
        this.tweens.add({ targets: view.hpFill, width: target, duration: 260, ease: 'Quad.Out' });
        this.tweens.add({
          targets: view.hpGhost,
          width: target,
          delay: 380,
          duration: 520,
          ease: 'Quad.InOut',
        });
      } else {
        view.hpFill.width = target;
        view.hpGhost.width = target;
      }
    }

    if (data.damage !== null) {
      this.damageNumber(views[data.damage.target], data.damage.amount, animate);
    }

    if (data.winner !== 'tie') {
      const winner = views[data.winner];
      winner.frame.setStrokeStyle(4, C.amber);
      const glow = this.glowBehind(winner, C.amber, 1.7);
      if (animate) {
        this.tweens.add({ targets: winner.container, scale: 1.05, duration: 180, yoyo: true });
        glow.setAlpha(0);
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.9, to: 0.45 },
          duration: 900,
          ease: 'Sine.InOut',
          yoyo: true,
          repeat: -1,
        });
      } else {
        glow.setAlpha(0.55);
      }
    }

    const { width: W, height: H } = this.viewSize;
    const label =
      data.winner === 'tie' ? 'EMPATE' : `GANA ${sides[data.winner].name.toUpperCase()}`;
    const banner = this.text(W / 2, H - Math.max(12, H * 0.035), label, {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(Math.min(W, 640) * 0.065))}px`,
      fontStyle: '900',
      color: data.winner === 'tie' ? C.bone : C.amberText,
      stroke: C.nightText,
      strokeThickness: 6,
    }).setOrigin(0.5, 1);
    if (animate) {
      banner.setAlpha(0).setY(banner.y + 20);
      this.tweens.add({
        targets: banner,
        alpha: 1,
        y: banner.y - 20,
        duration: 360,
        ease: 'Back.Out',
      });
    }

    if (data.eliminated !== null) this.eliminate(views[data.eliminated], animate);
  }

  private damageNumber(target: CardView, amount: number, animate: boolean): void {
    const dmg = this.text(target.homeX, target.homeY - target.height * 0.22, `−${String(amount)}`, {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(target.width * 0.34))}px`,
      fontStyle: '900',
      color: C.slashText,
      stroke: C.nightText,
      strokeThickness: 7,
    }).setOrigin(0.5);
    if (!animate) return;
    dmg.setScale(0.3);
    this.tweens.add({
      targets: dmg,
      scale: 1,
      duration: 260,
      ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({
          targets: dmg,
          y: dmg.y - target.height * 0.16,
          duration: 900,
          ease: 'Cubic.Out',
        });
      },
    });
  }

  /** La carta eliminada se apaga, cae y recibe el sello. */
  private eliminate(view: CardView, animate: boolean): void {
    view.photo?.setTint(0x6b6b6b);
    const towards = view.role === 'attacker' ? -1 : 1;
    const stamp = this.text(view.homeX, view.homeY + view.height * 0.08, 'ELIMINADO', {
      fontFamily: DISPLAY,
      fontSize: `${String(Math.round(view.width * 0.18))}px`,
      fontStyle: '900',
      color: C.slashText,
      stroke: C.nightText,
      strokeThickness: 6,
    })
      .setOrigin(0.5)
      .setAngle(-12);
    if (!animate) {
      view.container.setAlpha(0.45);
      return;
    }
    this.tweens.add({
      targets: view.container,
      alpha: 0.45,
      angle: towards * 7,
      y: view.homeY + view.height * 0.06,
      delay: 250,
      duration: 520,
      ease: 'Quad.In',
    });
    stamp.setScale(2.4).setAlpha(0);
    this.tweens.add({
      targets: stamp,
      scale: 1,
      alpha: 1,
      delay: 520,
      duration: 240,
      ease: 'Back.Out',
      onComplete: () => {
        this.cameras.main.shake(120, 0.005);
      },
    });
  }
}
