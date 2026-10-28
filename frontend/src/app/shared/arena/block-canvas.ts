import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { ArenaRelation } from '../../core/models/models';
import { I18nService } from '../../core/services/i18n.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { BlockChallenge, CanvasEdge, PlacedBlock } from './arena.models';
import { ArenaIcon } from './arena-icon';
import { PATTERN_ART } from './arena-data';

interface MoveDrag {
  instanceId: string;
  startClientX: number;
  startClientY: number;
  origX: number;
  origY: number;
  moved: boolean;
  pointerId: number;
}

@Component({
  selector: 'app-block-canvas',
  imports: [TranslatePipe, LocalizePipe, ArenaIcon],
  template: `
    <div class="arena-block" [class.won]="structureOk()">
      <div class="mission">
        <img class="mission__art" [src]="artUrl" alt="" width="96" height="64" />
        <div>
          <p class="mission__tag">
            <app-arena-icon name="play" size="1.1rem" />
            {{ 'arena.mission' | t }}
          </p>
          <p class="mission__brief">{{ challenge.brief | loc }}</p>
        </div>
        <div class="combo" [class.combo--ok]="structureOk()" [class.combo--ready]="liveReady()" dir="ltr">
          <img src="/assets/arena/xp-spin.svg" alt="" width="28" height="28" />
          <span>{{ edgeScore() }}/{{ challenge.expectedEdges.length }}</span>
        </div>
      </div>

      <div class="status" [class.status--won]="structureOk()" [class.status--ready]="!structureOk() && liveReady()">
        @if (structureOk()) {
          <app-arena-icon name="trophy" size="1.2rem" tone="amber" />
          <strong>{{ 'arena.status.won' | t }}</strong>
          <span class="muted">{{ feedback() || ('arena.feedback.ok' | t) }}</span>
        } @else {
          <span class="pill" [class.pill--ok]="pieceScore() >= challenge.requiredPieceIds.length">
            {{ 'arena.status.pieces' | t: { have: pieceScore(), need: challenge.requiredPieceIds.length } }}
          </span>
          <span class="pill" [class.pill--ok]="edgeScore() >= challenge.expectedEdges.length">
            {{ 'arena.status.links' | t: { have: edgeScore(), need: challenge.expectedEdges.length } }}
          </span>
          @if (liveReady()) {
            <span class="hint hint--ready">{{ 'arena.status.ready' | t }}</span>
          } @else if (feedback()) {
            <span class="hint hint--err">{{ feedback() }}</span>
          } @else {
            <span class="hint">{{ 'arena.status.hint' | t }}</span>
          }
        }
      </div>

      <div class="workspace">
        <aside class="palette">
          <h3>
            <app-arena-icon name="blocks" size="1.15rem" />
            {{ 'arena.palette' | t }}
          </h3>
          @for (piece of challenge.pieces; track piece.id) {
            <button
              type="button"
              class="piece"
              [class.distractor]="piece.distractor"
              [class.used]="placedCount(piece.id) > 0"
              [class.dragging]="dragPieceId() === piece.id"
              [disabled]="placedCount(piece.id) > 0"
              [attr.draggable]="placedCount(piece.id) === 0"
              (dragstart)="onPaletteDragStart($event, piece.id)"
              (dragend)="onPaletteDragEnd()"
              (click)="onPaletteClick(piece.id)"
              [title]="piece.hint | loc"
            >
              <span class="piece__icon">
                <app-arena-icon [name]="piece.id" size="2.15rem" />
              </span>
              <span class="piece__role">{{ piece.label | loc }}</span>
              @if (piece.distractor) {
                <span class="trap" title="trap">!</span>
              }
            </button>
          }
        </aside>

        <div class="stage-wrap">
          <div
            #stage
            class="stage"
            [class.drop-hot]="stageHot()"
            role="application"
            (click)="clearSelection($event)"
            (dragover)="onStageDragOver($event)"
            (dragleave)="onStageDragLeave($event)"
            (drop)="onStageDrop($event)"
          >
            <img class="stage__spark" src="/assets/arena/spark.gif.svg" alt="" />
            <svg class="wires" aria-hidden="true">
              @for (edge of edges(); track edge.id) {
                @if (edgePath(edge); as path) {
                  <path
                    [attr.d]="path.d"
                    class="wire"
                    [class.hot]="isEdgeHot(edge)"
                    [class.pulse]="animating() && isEdgeHot(edge)"
                  />
                  <foreignObject [attr.x]="path.mx - 18" [attr.y]="path.my - 12" width="36" height="24">
                    <div class="wire-chip" dir="ltr">
                      <app-arena-icon [name]="edge.relation" size="0.95rem" tone="amber" />
                    </div>
                  </foreignObject>
                }
              }
            </svg>

            @for (block of blocks(); track block.instanceId) {
              <button
                type="button"
                class="block"
                [class.selected]="selectedId() === block.instanceId"
                [class.hot]="hotPieceIds().has(pieceIdOf(block.instanceId))"
                [class.dragging]="moveDrag()?.instanceId === block.instanceId && moveDrag()?.moved"
                [style.left.px]="block.x"
                [style.top.px]="block.y"
                (pointerdown)="onBlockPointerDown($event, block.instanceId)"
                (pointermove)="onBlockPointerMove($event)"
                (pointerup)="onBlockPointerUp($event, block.instanceId)"
                (pointercancel)="onBlockPointerCancel()"
                (click)="$event.stopPropagation()"
                (dblclick)="removeBlock($event, block.instanceId)"
              >
                <span class="block__glow" aria-hidden="true"></span>
                <span class="block__icon">
                  <app-arena-icon [name]="block.pieceId" size="2.05rem" />
                </span>
                <span class="block__label" dir="ltr">{{ labelOf(block.pieceId) }}</span>
              </button>
            }

            @if (!blocks().length) {
              <div class="empty">
                <app-arena-icon name="blocks" size="2.4rem" tone="muted" />
                <span>{{ 'arena.canvasEmpty' | t }}</span>
              </div>
            }

            @if (structureOk()) {
              <div class="confetti" aria-hidden="true">
                @for (i of confetti; track i) {
                  <span [style.--i]="i"></span>
                }
              </div>
              <div class="win-stamp" aria-hidden="true">
                <img src="/assets/arena/win-burst.svg" width="120" height="120" alt="" />
              </div>
            }
          </div>

          <div class="rel-bar" role="group">
            @for (rel of challenge.relations; track rel) {
              <button
                type="button"
                class="rel"
                [class.active]="activeRelation() === rel"
                (click)="activeRelation.set(rel)"
                dir="ltr"
              >
                <app-arena-icon [name]="rel" size="1.15rem" />
                {{ rel }}
              </button>
            }
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn ghost" (click)="reset()">{{ 'arena.reset' | t }}</button>
        <button
          type="button"
          class="btn ghost punch"
          [disabled]="busy() || structureOk()"
          (click)="solveComplete()"
        >
          <app-arena-icon name="xp" size="1.1rem" tone="amber" />
          {{ 'arena.solve' | t }}
        </button>
        <button
          type="button"
          class="btn primary punch"
          [disabled]="busy() || structureOk()"
          (click)="validate()"
        >
          <app-arena-icon name="trophy" size="1.1rem" />
          {{ 'arena.validate' | t }}
        </button>
        <button
          type="button"
          class="btn punch"
          [class.primary]="structureOk()"
          [class.ghost]="!structureOk()"
          [disabled]="!structureOk() || animating()"
          (click)="runAnimation()"
        >
          <app-arena-icon name="play" size="1.1rem" />
          {{ 'arena.runFlow' | t }}
        </button>
      </div>

      @if (feedback() && !structureOk()) {
        <div class="feedback bad">
          <app-arena-icon name="xp" size="1.35rem" tone="muted" />
          <p>{{ feedback() }}</p>
        </div>
      }

      @if (animMessage()) {
        <div class="anim-banner">
          <img src="/assets/arena/spark.gif.svg" alt="" width="36" height="36" />
          <span dir="auto">{{ animMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .mission {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.85rem;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        border: 1px solid var(--line);
        background:
          radial-gradient(420px 120px at 0% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent),
          var(--surface);
      }
      .mission__art {
        image-rendering: auto;
      }
      .mission__tag {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .mission__brief {
        margin: 0.2rem 0 0;
        font-family: var(--font-display);
        font-size: 1.05rem;
        line-height: 1.35;
      }
      .combo {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--font-mono);
        font-weight: 600;
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--accent-2) 12%, transparent);
      }
      .combo--ready {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 14%, transparent);
      }
      .combo--ok {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 18%, transparent);
        color: var(--accent);
      }
      .status {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.45rem 0.65rem;
        margin: -0.25rem 0 0.95rem;
        padding: 0.55rem 0.75rem;
        border-radius: 0.75rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--surface) 88%, transparent);
        font-size: 0.88rem;
      }
      .status--won {
        border-color: color-mix(in oklab, var(--accent) 45%, var(--line));
        background: color-mix(in oklab, var(--accent) 12%, var(--surface));
      }
      .status--ready {
        border-color: color-mix(in oklab, var(--warn, #d4a017) 40%, var(--line));
        background: color-mix(in oklab, var(--warn, #d4a017) 10%, var(--surface));
      }
      .status strong {
        font-family: var(--font-display);
      }
      .status .muted {
        color: var(--muted);
      }
      .status .hint {
        color: var(--muted);
        font-size: 0.82rem;
      }
      .status .hint--ready {
        color: var(--ink);
        font-weight: 600;
      }
      .status .hint--err {
        color: color-mix(in oklab, #b33 70%, var(--ink));
      }
      .pill {
        font-family: var(--font-mono);
        font-size: 0.78rem;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        color: var(--muted);
      }
      .pill--ok {
        color: var(--ink);
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 12%, transparent);
      }
      .workspace {
        display: grid;
        grid-template-columns: minmax(7.5rem, 9.5rem) 1fr;
        gap: 0.85rem;
      }
      @media (max-width: 820px) {
        .workspace {
          grid-template-columns: 1fr;
        }
        .mission {
          grid-template-columns: auto 1fr;
        }
        .combo {
          grid-column: 1 / -1;
          justify-self: start;
        }
      }
      .palette h3 {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--font-display);
        font-size: 0.92rem;
        margin: 0 0 0.55rem;
      }
      .piece {
        position: relative;
        display: grid;
        grid-template-rows: 2.5rem auto;
        justify-items: center;
        align-items: center;
        gap: 0.35rem;
        width: 100%;
        margin-bottom: 0.45rem;
        padding: 0.55rem 0.35rem 0.5rem;
        border-radius: 0.85rem;
        border: 1px solid var(--line);
        background: linear-gradient(
          165deg,
          color-mix(in oklab, var(--surface) 72%, var(--accent)),
          var(--surface)
        );
        color: inherit;
        cursor: pointer;
        transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
      }
      .piece:hover:not(:disabled) {
        transform: translateY(-2px);
        border-color: var(--accent);
        box-shadow: 0 8px 18px color-mix(in oklab, var(--accent) 16%, transparent);
      }
      .piece:not(:disabled) {
        cursor: grab;
      }
      .piece:not(:disabled):active,
      .piece.dragging {
        cursor: grabbing;
        opacity: 0.75;
        transform: scale(1.04);
      }
      .piece.used {
        opacity: 0.38;
        filter: grayscale(0.35);
        cursor: default;
      }
      .piece.distractor {
        border-style: dashed;
      }
      .piece__icon {
        width: 2.65rem;
        height: 2.65rem;
        display: grid;
        place-items: center;
        border-radius: 0.55rem;
        background: color-mix(in oklab, var(--surface) 92%, #fff);
        border: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
      }
      .piece__icon app-arena-icon {
        display: grid;
        place-items: center;
      }
      .piece__role {
        font-family: var(--font-mono);
        font-size: 0.62rem;
        text-align: center;
        line-height: 1.15;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 0.15rem;
      }
      .trap {
        position: absolute;
        top: -0.2rem;
        inset-inline-end: -0.15rem;
        width: 1.05rem;
        height: 1.05rem;
        border-radius: 50%;
        background: var(--accent-2);
        color: #fff7ed;
        font-size: 0.68rem;
        font-weight: 700;
        display: grid;
        place-items: center;
        border: 2px solid var(--surface);
        line-height: 1;
      }
      .stage-wrap {
        display: grid;
        gap: 0.55rem;
      }
      .stage {
        position: relative;
        min-height: 380px;
        border-radius: 1.1rem;
        border: 1px solid var(--line);
        overflow: hidden;
        touch-action: none;
        background:
          radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 40%),
          radial-gradient(circle at 80% 10%, color-mix(in oklab, var(--accent-2) 12%, transparent), transparent 35%),
          linear-gradient(color-mix(in oklab, var(--line) 50%, transparent) 1px, transparent 1px) 0 0 / 28px 28px,
          linear-gradient(90deg, color-mix(in oklab, var(--line) 50%, transparent) 1px, transparent 1px) 0 0 / 28px 28px,
          color-mix(in oklab, var(--surface) 94%, transparent);
        transition: box-shadow 160ms ease, border-color 160ms ease;
      }
      .stage.drop-hot {
        border-color: var(--accent);
        box-shadow: inset 0 0 0 2px color-mix(in oklab, var(--accent) 45%, transparent);
      }
      .stage__spark {
        position: absolute;
        top: 0.6rem;
        inset-inline-end: 0.6rem;
        width: 42px;
        height: 42px;
        opacity: 0.55;
        pointer-events: none;
        z-index: 1;
      }
      .wires {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .wire {
        fill: none;
        stroke: color-mix(in oklab, var(--accent) 60%, var(--muted));
        stroke-width: 2.4;
        stroke-linecap: round;
      }
      .wire.hot {
        stroke: var(--accent-2);
        stroke-width: 3;
      }
      .wire.pulse {
        stroke-dasharray: 7 5;
        animation: dash 800ms linear infinite;
      }
      .wire-chip {
        display: grid;
        place-items: center;
        width: 36px;
        height: 24px;
        border-radius: 999px;
        background: color-mix(in oklab, var(--surface) 94%, transparent);
        border: 1px solid var(--line);
        box-shadow: 0 2px 6px color-mix(in oklab, #0b1c16 8%, transparent);
      }
      .block {
        position: absolute;
        width: 128px;
        min-height: 92px;
        padding: 0.55rem 0.45rem 0.5rem;
        border-radius: 0.85rem;
        border: 1px solid var(--line);
        background: linear-gradient(165deg, color-mix(in oklab, var(--surface) 55%, var(--accent)), var(--surface));
        color: inherit;
        cursor: grab;
        touch-action: none;
        user-select: none;
        display: grid;
        grid-template-rows: 2.4rem auto;
        justify-items: center;
        align-items: center;
        gap: 0.35rem;
        box-shadow: 0 8px 20px color-mix(in oklab, #0b1c16 10%, transparent);
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 160ms ease;
        z-index: 2;
        animation: pop 280ms ease both;
        overflow: hidden;
      }
      .block__glow {
        position: absolute;
        inset: -20%;
        background: radial-gradient(
          circle at 30% 20%,
          color-mix(in oklab, var(--accent-2) 22%, transparent),
          transparent 55%
        );
        pointer-events: none;
      }
      .block__icon {
        position: relative;
        z-index: 1;
        width: 2.65rem;
        height: 2.65rem;
        display: grid;
        place-items: center;
        border-radius: 0.55rem;
        background: color-mix(in oklab, var(--surface) 94%, #fff);
        border: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
      }
      .block__icon app-arena-icon {
        display: grid;
        place-items: center;
      }
      .win-stamp {
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        z-index: 6;
        animation: pop 420ms ease both;
        filter: drop-shadow(0 10px 24px color-mix(in oklab, var(--accent-2) 40%, transparent));
        pointer-events: none;
      }
      .block.selected {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 25%, transparent);
      }
      .block.hot {
        border-color: var(--accent-2);
        transform: translateY(-3px) scale(1.04);
        box-shadow: 0 12px 26px color-mix(in oklab, var(--accent-2) 28%, transparent);
      }
      .block.dragging {
        cursor: grabbing;
        z-index: 8;
        transform: scale(1.05);
        box-shadow: 0 16px 32px color-mix(in oklab, var(--accent) 26%, transparent);
        transition: none;
      }
      .block__label {
        position: relative;
        z-index: 1;
        font-family: var(--font-mono);
        font-size: 0.68rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.15;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 0.15rem;
      }
      .empty {
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
        justify-items: center;
        gap: 0.45rem;
        color: var(--muted);
        pointer-events: none;
        font-size: 0.9rem;
      }
      .rel-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }
      .rel {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--font-mono);
        font-size: 0.78rem;
        padding: 0.4rem 0.7rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .rel.active {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 16%, transparent);
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-top: 0.95rem;
      }
      .punch {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
      .feedback {
        margin-top: 0.85rem;
        padding: 0.75rem 1rem;
        border-radius: 0.85rem;
        border: 1px solid var(--line);
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }
      .feedback p {
        margin: 0;
        font-family: var(--font-display);
      }
      .feedback.ok {
        border-color: color-mix(in oklab, #2f9e7b 50%, var(--line));
        background: color-mix(in oklab, var(--accent) 10%, var(--surface));
      }
      .feedback.bad {
        border-color: color-mix(in oklab, #c45c4a 50%, var(--line));
      }
      .anim-banner {
        margin-top: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.7rem 0.95rem;
        border-radius: 0.85rem;
        background: color-mix(in oklab, var(--accent-2) 14%, var(--surface));
        border: 1px solid color-mix(in oklab, var(--accent-2) 40%, var(--line));
        font-family: var(--font-display);
        animation: rise 350ms ease both;
      }
      .confetti {
        pointer-events: none;
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 5;
      }
      .confetti span {
        position: absolute;
        top: -8px;
        left: calc(8% + (var(--i) * 7%));
        width: 8px;
        height: 12px;
        border-radius: 2px;
        background: var(--accent-2);
        animation: fall calc(1.2s + var(--i) * 0.08s) ease-in forwards;
        animation-delay: calc(var(--i) * 30ms);
      }
      .confetti span:nth-child(3n) {
        background: var(--accent);
      }
      .confetti span:nth-child(4n) {
        background: #fbbf24;
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .won .stage {
        box-shadow: inset 0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent);
      }
      @keyframes dash {
        to {
          stroke-dashoffset: -24;
        }
      }
      @keyframes pop {
        from {
          transform: scale(0.85);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      @keyframes fall {
        to {
          transform: translateY(390px) rotate(220deg);
          opacity: 0;
        }
      }
    `,
  ],
})
export class BlockCanvas implements OnChanges, OnDestroy {
  @Input({ required: true }) challenge!: BlockChallenge;
  @Output() readonly cleared = new EventEmitter<{ score: number; passed: boolean }>();
  @ViewChild('stage') stageRef?: ElementRef<HTMLElement>;

  private readonly i18n = inject(I18nService);
  private readonly settings = inject(SettingsService);

  readonly blocks = signal<PlacedBlock[]>([]);
  readonly edges = signal<CanvasEdge[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly activeRelation = signal<ArenaRelation>('extends');
  readonly structureOk = signal(false);
  readonly feedback = signal('');
  readonly busy = signal(false);
  readonly animating = signal(false);
  readonly animMessage = signal('');
  readonly hotPieceIds = signal<Set<string>>(new Set());
  readonly hotEdgeIds = signal<Set<string>>(new Set());
  readonly dragPieceId = signal<string | null>(null);
  readonly stageHot = signal(false);
  readonly moveDrag = signal<MoveDrag | null>(null);
  readonly confetti = Array.from({ length: 14 }, (_, i) => i);

  private animTimer: ReturnType<typeof setTimeout> | null = null;
  private placeIndex = 0;
  private suppressPaletteClick = false;
  private readonly blockW = 128;
  private readonly blockH = 92;
  /** Pixels before a press counts as drag (not a wire tap). */
  private readonly dragThreshold = 12;

  get artUrl(): string {
    return PATTERN_ART[this.challenge.patternId] ?? '/assets/arena/spark.gif.svg';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['challenge']) this.reset();
  }

  ngOnDestroy(): void {
    this.clearAnimTimer();
    if (this.autoCheckTimer) clearTimeout(this.autoCheckTimer);
  }

  onPaletteDragStart(event: DragEvent, pieceId: string): void {
    if (this.placedCount(pieceId) > 0) {
      event.preventDefault();
      return;
    }
    this.suppressPaletteClick = true;
    event.dataTransfer?.setData('application/x-arena-piece', pieceId);
    event.dataTransfer?.setData('text/plain', pieceId);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
    this.dragPieceId.set(pieceId);
  }

  onPaletteDragEnd(): void {
    this.dragPieceId.set(null);
    this.stageHot.set(false);
    // Click fires after dragend in some browsers — ignore it once.
    setTimeout(() => {
      this.suppressPaletteClick = false;
    }, 0);
  }

  onPaletteClick(pieceId: string): void {
    if (this.suppressPaletteClick) return;
    this.addPiece(pieceId);
  }

  onStageDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.stageHot.set(true);
  }

  onStageDragLeave(event: DragEvent): void {
    const stage = this.stageRef?.nativeElement;
    if (!stage) return;
    const related = event.relatedTarget as Node | null;
    if (related && stage.contains(related)) return;
    this.stageHot.set(false);
  }

  onStageDrop(event: DragEvent): void {
    event.preventDefault();
    this.stageHot.set(false);
    const pieceId =
      event.dataTransfer?.getData('application/x-arena-piece') ||
      event.dataTransfer?.getData('text/plain');
    if (!pieceId) return;
    const stage = this.stageRef?.nativeElement;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = event.clientX - rect.left - this.blockW / 2;
    const y = event.clientY - rect.top - this.blockH / 2;
    this.placePieceAt(pieceId, x, y);
    this.dragPieceId.set(null);
  }

  onBlockPointerDown(event: PointerEvent, instanceId: string): void {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.stopPropagation();
    const block = this.blocks().find((b) => b.instanceId === instanceId);
    if (!block) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.moveDrag.set({
      instanceId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      origX: block.x,
      origY: block.y,
      moved: false,
      pointerId: event.pointerId,
    });
  }

  onBlockPointerMove(event: PointerEvent): void {
    const drag = this.moveDrag();
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startClientX;
    const dy = event.clientY - drag.startClientY;
    const dist = Math.hypot(dx, dy);
    if (dist < this.dragThreshold) return;
    event.preventDefault();
    const stage = this.stageRef?.nativeElement;
    const maxX = Math.max(0, (stage?.clientWidth ?? 600) - this.blockW);
    const maxY = Math.max(0, (stage?.clientHeight ?? 380) - this.blockH);
    const x = Math.min(maxX, Math.max(0, drag.origX + dx));
    const y = Math.min(maxY, Math.max(0, drag.origY + dy));
    this.moveDrag.set({ ...drag, moved: true });
    this.blocks.update((list) =>
      list.map((b) => (b.instanceId === drag.instanceId ? { ...b, x, y } : b))
    );
  }

  onBlockPointerUp(event: PointerEvent, instanceId: string): void {
    const drag = this.moveDrag();
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }

    const dx = event.clientX - drag.startClientX;
    const dy = event.clientY - drag.startClientY;
    const wasDrag = drag.moved && Math.hypot(dx, dy) >= this.dragThreshold;

    if (!wasDrag) {
      // Revert any sub-threshold jitter so a wire tap stays a wire tap.
      if (drag.moved) {
        this.blocks.update((list) =>
          list.map((b) =>
            b.instanceId === instanceId ? { ...b, x: drag.origX, y: drag.origY } : b
          )
        );
      }
      this.selectBlock(event, instanceId);
    } else {
      const block = this.blocks().find((b) => b.instanceId === instanceId);
      if (block) {
        const snapped = this.snap(block.x, block.y);
        this.blocks.update((list) =>
          list.map((b) => (b.instanceId === instanceId ? { ...b, ...snapped } : b))
        );
      }
      this.structureOk.set(false);
    }
    this.moveDrag.set(null);
  }

  onBlockPointerCancel(): void {
    const drag = this.moveDrag();
    if (drag?.moved) {
      this.blocks.update((list) =>
        list.map((b) =>
          b.instanceId === drag.instanceId ? { ...b, x: drag.origX, y: drag.origY } : b
        )
      );
    }
    this.moveDrag.set(null);
  }

  edgeScore(): number {
    const edgeKeys = this.edges().map((e) => {
      const from = this.pieceIdOf(e.fromInstanceId);
      const to = this.pieceIdOf(e.toInstanceId);
      return `${from}>${e.relation}>${to}`;
    });
    return this.challenge.expectedEdges.filter((expected) =>
      edgeKeys.includes(`${expected.from}>${expected.relation}>${expected.to}`)
    ).length;
  }

  pieceScore(): number {
    const placed = new Set(this.blocks().map((b) => b.pieceId));
    return this.challenge.requiredPieceIds.filter((id) => placed.has(id)).length;
  }

  liveReady(): boolean {
    if (this.structureOk()) return true;
    const distractors = this.challenge.pieces.filter((p) => p.distractor).map((p) => p.id);
    const placed = new Set(this.blocks().map((b) => b.pieceId));
    if (distractors.some((d) => placed.has(d))) return false;
    return (
      this.pieceScore() >= this.challenge.requiredPieceIds.length &&
      this.edgeScore() >= this.challenge.expectedEdges.length
    );
  }

  placedCount(pieceId: string): number {
    return this.blocks().filter((b) => b.pieceId === pieceId).length;
  }

  addPiece(pieceId: string): void {
    if (this.placedCount(pieceId) > 0) return;
    const col = this.placeIndex % 3;
    const row = Math.floor(this.placeIndex / 3);
    this.placeIndex += 1;
    this.placePieceAt(pieceId, 24 + col * 148, 24 + row * 116);
  }

  placePieceAt(pieceId: string, x: number, y: number): void {
    if (this.placedCount(pieceId) > 0) return;
    if (!this.challenge.pieces.some((p) => p.id === pieceId)) return;
    const snapped = this.snap(x, y);
    const instanceId = `${pieceId}-${crypto.randomUUID().slice(0, 8)}`;
    this.blocks.update((list) => [
      ...list,
      {
        instanceId,
        pieceId,
        x: snapped.x,
        y: snapped.y,
      },
    ]);
    this.structureOk.set(false);
    this.feedback.set('');
    this.maybeAutoCheck();
  }

  private snap(x: number, y: number): { x: number; y: number } {
    const stage = this.stageRef?.nativeElement;
    const maxX = Math.max(0, (stage?.clientWidth ?? 600) - this.blockW);
    const maxY = Math.max(0, (stage?.clientHeight ?? 380) - this.blockH);
    const grid = 16;
    const sx = Math.round(x / grid) * grid;
    const sy = Math.round(y / grid) * grid;
    return {
      x: Math.min(maxX, Math.max(0, sx)),
      y: Math.min(maxY, Math.max(0, sy)),
    };
  }

  selectBlock(event: Event, instanceId: string): void {
    event.stopPropagation();
    const prev = this.selectedId();
    if (prev && prev !== instanceId) {
      const exists = this.edges().some(
        (e) =>
          (e.fromInstanceId === prev && e.toInstanceId === instanceId) ||
          (e.fromInstanceId === instanceId && e.toInstanceId === prev)
      );
      if (!exists) {
        this.edges.update((list) => [
          ...list,
          {
            id: `e-${crypto.randomUUID().slice(0, 8)}`,
            fromInstanceId: prev,
            toInstanceId: instanceId,
            relation: this.activeRelation(),
          },
        ]);
      }
      this.selectedId.set(null);
      this.structureOk.set(false);
      this.feedback.set('');
      this.maybeAutoCheck();
      return;
    }
    this.selectedId.set(instanceId);
  }

  removeBlock(event: MouseEvent, instanceId: string): void {
    event.stopPropagation();
    this.blocks.update((list) => list.filter((b) => b.instanceId !== instanceId));
    this.edges.update((list) =>
      list.filter((e) => e.fromInstanceId !== instanceId && e.toInstanceId !== instanceId)
    );
    if (this.selectedId() === instanceId) this.selectedId.set(null);
    this.structureOk.set(false);
    this.feedback.set('');
  }

  clearSelection(event?: Event): void {
    // Ignore bubbled clicks that originated on a block.
    if (event?.target instanceof Element) {
      if (event.target.closest('button.block')) return;
    }
    this.selectedId.set(null);
  }

  reset(): void {
    this.clearAnimTimer();
    this.blocks.set([]);
    this.edges.set([]);
    this.selectedId.set(null);
    this.structureOk.set(false);
    this.feedback.set('');
    this.animMessage.set('');
    this.hotPieceIds.set(new Set());
    this.hotEdgeIds.set(new Set());
    this.animating.set(false);
    this.dragPieceId.set(null);
    this.stageHot.set(false);
    this.moveDrag.set(null);
    this.placeIndex = 0;
    if (this.challenge.relations.length) this.activeRelation.set(this.challenge.relations[0]);
  }

  labelOf(pieceId: string): string {
    const p = this.challenge.pieces.find((x) => x.id === pieceId);
    return p ? this.i18n.localize(p.label) : pieceId;
  }

  pieceIdOf(instanceId: string): string {
    return this.blocks().find((b) => b.instanceId === instanceId)?.pieceId ?? '';
  }

  edgePath(edge: CanvasEdge): { d: string; mx: number; my: number } | null {
    const from = this.blocks().find((b) => b.instanceId === edge.fromInstanceId);
    const to = this.blocks().find((b) => b.instanceId === edge.toInstanceId);
    if (!from || !to) return null;
    const x1 = from.x + this.blockW / 2;
    const y1 = from.y + this.blockH / 2;
    const x2 = to.x + this.blockW / 2;
    const y2 = to.y + this.blockH / 2;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 4;
    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - 28;
    return { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, mx, my };
  }

  isEdgeHot(edge: CanvasEdge): boolean {
    return this.hotEdgeIds().has(edge.id);
  }

  private autoCheckTimer: ReturnType<typeof setTimeout> | null = null;

  private maybeAutoCheck(): void {
    if (this.structureOk() || this.busy()) return;
    if (this.autoCheckTimer) clearTimeout(this.autoCheckTimer);
    this.autoCheckTimer = setTimeout(() => {
      this.autoCheckTimer = null;
      if (!this.liveReady() || this.structureOk()) return;
      void this.validate();
    }, 280);
  }

  /** Place every required piece, wire expected edges, then check. */
  solveComplete(): void {
    if (this.busy() || this.structureOk()) return;
    if (this.autoCheckTimer) {
      clearTimeout(this.autoCheckTimer);
      this.autoCheckTimer = null;
    }
    this.reset();

    const ids = this.challenge.requiredPieceIds;
    const positions = this.solvePositions(ids);
    const byPiece = new Map<string, string>();

    const placed = ids.map((pieceId) => {
      const pos = positions.get(pieceId) ?? { x: 24, y: 24 };
      // Keep diagram geometry exact (no grid snap) so columns/rows line up.
      const instanceId = `${pieceId}-${crypto.randomUUID().slice(0, 8)}`;
      byPiece.set(pieceId, instanceId);
      return {
        instanceId,
        pieceId,
        x: Math.round(pos.x),
        y: Math.round(pos.y),
      };
    });
    this.blocks.set(placed);
    this.placeIndex = placed.length;

    this.edges.set(
      this.challenge.expectedEdges.map((expected) => ({
        id: `e-${crypto.randomUUID().slice(0, 8)}`,
        fromInstanceId: byPiece.get(expected.from)!,
        toInstanceId: byPiece.get(expected.to)!,
        relation: expected.relation,
      }))
    );

    void this.validate();
  }

  /** Center a UML-style grid (or fall back to a balanced grid) in the stage. */
  private solvePositions(ids: string[]): Map<string, { x: number; y: number }> {
    const stage = this.stageRef?.nativeElement;
    const stageW = stage?.clientWidth ?? 600;
    const stageH = stage?.clientHeight ?? 380;

    const layout = this.challenge.solveLayout;
    const slots = ids.map((id, i) => {
      const fromLayout = layout?.[id];
      if (fromLayout) return { id, col: fromLayout.col, row: fromLayout.row };
      const cols = ids.length <= 4 ? 2 : 3;
      return { id, col: i % cols, row: Math.floor(i / cols) };
    });

    const colVals = slots.map((s) => s.col);
    const rowVals = slots.map((s) => s.row);
    const minCol = Math.min(...colVals);
    const maxCol = Math.max(...colVals);
    const minRow = Math.min(...rowVals);
    const maxRow = Math.max(...rowVals);
    const colSpan = Math.max(0.5, maxCol - minCol);
    const rowSpan = Math.max(0.5, maxRow - minRow);

    // Roomy gutters so wires/chips stay readable; shrink only if the stage is tight.
    const padX = 36;
    const padY = 36;
    const idealCellW = this.blockW + 96; // ~224
    const idealCellH = this.blockH + 64; // ~156
    const fitCellW = (stageW - padX * 2 - this.blockW) / colSpan;
    const fitCellH = (stageH - padY * 2 - this.blockH) / rowSpan;
    const cellW = Math.min(idealCellW, Math.max(this.blockW + 56, fitCellW));
    const cellH = Math.min(idealCellH, Math.max(this.blockH + 40, fitCellH));

    const diagramW = colSpan * cellW + this.blockW;
    const diagramH = rowSpan * cellH + this.blockH;
    const originX = Math.max(padX, (stageW - diagramW) / 2);
    const originY = Math.max(padY, (stageH - diagramH) / 2);

    const out = new Map<string, { x: number; y: number }>();
    for (const slot of slots) {
      out.set(slot.id, {
        x: originX + (slot.col - minCol) * cellW,
        y: originY + (slot.row - minRow) * cellH,
      });
    }
    return out;
  }

  async validate(): Promise<void> {
    this.busy.set(true);
    try {
      const result = this.checkStructure();
      this.structureOk.set(result.ok);
      this.feedback.set(result.message);
      this.cleared.emit({ score: result.score, passed: result.ok });
      if (result.ok && !this.settings.settings().reduceMotion) {
        // Brief beat, then auto-play the flow so success is obvious.
        setTimeout(() => {
          if (this.structureOk() && !this.animating()) this.runAnimation();
        }, 450);
      }
    } finally {
      this.busy.set(false);
    }
  }

  runAnimation(): void {
    if (!this.structureOk()) return;
    if (this.settings.settings().reduceMotion) {
      const last = this.challenge.animation[this.challenge.animation.length - 1];
      this.animMessage.set(last ? this.i18n.localize(last.message) : '');
      this.hotPieceIds.set(new Set(last?.pieceIds ?? []));
      return;
    }
    this.clearAnimTimer();
    this.animating.set(true);
    let step = 0;
    const tick = () => {
      if (step >= this.challenge.animation.length) {
        this.animating.set(false);
        this.hotPieceIds.set(new Set());
        this.hotEdgeIds.set(new Set());
        this.animMessage.set(this.i18n.t('arena.flowDone'));
        return;
      }
      const current = this.challenge.animation[step];
      this.hotPieceIds.set(new Set(current.pieceIds));
      const hotEdges = this.edges()
        .filter((e) => {
          const a = this.pieceIdOf(e.fromInstanceId);
          const b = this.pieceIdOf(e.toInstanceId);
          return current.pieceIds.includes(a) && current.pieceIds.includes(b);
        })
        .map((e) => e.id);
      this.hotEdgeIds.set(new Set(hotEdges));
      this.animMessage.set(this.i18n.localize(current.message));
      step += 1;
      this.animTimer = setTimeout(tick, 1200);
    };
    tick();
  }

  private checkStructure(): { ok: boolean; score: number; message: string } {
    const placed = new Set(this.blocks().map((b) => b.pieceId));
    const distractors = this.challenge.pieces.filter((p) => p.distractor).map((p) => p.id);
    if (distractors.some((d) => placed.has(d))) {
      return { ok: false, score: 20, message: this.i18n.t('arena.feedback.distractor') };
    }
    for (const id of this.challenge.requiredPieceIds) {
      if (!placed.has(id)) {
        return { ok: false, score: 35, message: this.i18n.t('arena.feedback.missingRole') };
      }
    }
    const edgeKeys = this.edges().map((e) => {
      const from = this.pieceIdOf(e.fromInstanceId);
      const to = this.pieceIdOf(e.toInstanceId);
      return `${from}>${e.relation}>${to}`;
    });
    let matched = 0;
    for (const expected of this.challenge.expectedEdges) {
      if (edgeKeys.includes(`${expected.from}>${expected.relation}>${expected.to}`)) matched += 1;
    }
    if (matched < this.challenge.expectedEdges.length) {
      return {
        ok: false,
        score: 40 + Math.round((matched / this.challenge.expectedEdges.length) * 40),
        message: this.i18n.t('arena.feedback.badEdges', {
          have: matched,
          need: this.challenge.expectedEdges.length,
        }),
      };
    }
    return { ok: true, score: 100, message: this.i18n.t('arena.feedback.ok') };
  }

  private clearAnimTimer(): void {
    if (this.animTimer) {
      clearTimeout(this.animTimer);
      this.animTimer = null;
    }
  }
}
