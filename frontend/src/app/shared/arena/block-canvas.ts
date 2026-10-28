import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { ArenaRelation } from '../../core/models/models';
import { I18nService } from '../../core/services/i18n.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { BlockChallenge, CanvasEdge, PlacedBlock } from './arena.models';

@Component({
  selector: 'app-block-canvas',
  imports: [TranslatePipe, LocalizePipe],
  template: `
    <div class="arena-block">
      <p class="brief">{{ challenge.brief | loc }}</p>

      <div class="workspace">
        <aside class="palette" aria-label="Piece palette">
          <h3>{{ 'arena.palette' | t }}</h3>
          @for (piece of challenge.pieces; track piece.id) {
            <button
              type="button"
              class="piece"
              [class.distractor]="piece.distractor"
              [disabled]="placedCount(piece.id) > 0"
              (click)="addPiece(piece.id)"
              [title]="piece.hint | loc"
            >
              <span class="piece__role">{{ piece.label | loc }}</span>
              <span class="piece__hint">{{ piece.hint | loc }}</span>
            </button>
          }
        </aside>

        <div class="stage-wrap">
          <div
            class="stage"
            role="application"
            aria-label="Pattern canvas"
            (click)="clearSelection()"
          >
            <svg class="wires" aria-hidden="true">
              @for (edge of edges(); track edge.id) {
                @if (edgePath(edge); as path) {
                  <path
                    [attr.d]="path.d"
                    class="wire"
                    [class.hot]="isEdgeHot(edge)"
                    [class.pulse]="animating() && isEdgeHot(edge)"
                  />
                  <text [attr.x]="path.mx" [attr.y]="path.my" class="wire-label" dir="ltr">
                    {{ edge.relation }}
                  </text>
                }
              }
            </svg>

            @for (block of blocks(); track block.instanceId) {
              <button
                type="button"
                class="block"
                [class.selected]="selectedId() === block.instanceId"
                [class.hot]="hotPieceIds().has(pieceIdOf(block.instanceId))"
                [style.left.px]="block.x"
                [style.top.px]="block.y"
                (click)="selectBlock($event, block.instanceId)"
                (dblclick)="removeBlock($event, block.instanceId)"
              >
                <span class="block__label" dir="ltr">{{ labelOf(block.pieceId) }}</span>
                <span class="block__sub">{{ hintOf(block.pieceId) }}</span>
              </button>
            }

            @if (!blocks().length) {
              <p class="empty">{{ 'arena.canvasEmpty' | t }}</p>
            }
          </div>

          <div class="rel-bar" role="group" [attr.aria-label]="'arena.relations' | t">
            <span class="rel-label">{{ 'arena.relations' | t }}</span>
            @for (rel of challenge.relations; track rel) {
              <button
                type="button"
                class="rel"
                [class.active]="activeRelation() === rel"
                (click)="activeRelation.set(rel)"
                dir="ltr"
              >
                {{ rel }}
              </button>
            }
            <span class="hint muted">{{ 'arena.connectHint' | t }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn ghost" (click)="reset()">{{ 'arena.reset' | t }}</button>
        <button type="button" class="btn primary" [disabled]="busy()" (click)="validate()">
          {{ 'arena.validate' | t }}
        </button>
        <button
          type="button"
          class="btn ghost"
          [disabled]="!structureOk() || animating()"
          (click)="runAnimation()"
        >
          {{ 'arena.runFlow' | t }}
        </button>
      </div>

      @if (feedback()) {
        <div class="feedback" [class.ok]="structureOk()" [class.bad]="!structureOk()">
          <p>{{ feedback() }}</p>
          @if (xpNote()) {
            <p class="xp" dir="ltr">{{ xpNote() }}</p>
          }
        </div>
      }

      @if (animMessage()) {
        <div class="anim-banner" dir="auto">
          <span class="pulse-dot" aria-hidden="true"></span>
          {{ animMessage() }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .brief {
        color: var(--muted);
        margin: 0 0 1rem;
        max-width: 48rem;
      }
      .workspace {
        display: grid;
        grid-template-columns: minmax(11rem, 14rem) 1fr;
        gap: 1rem;
      }
      @media (max-width: 820px) {
        .workspace {
          grid-template-columns: 1fr;
        }
      }
      .palette h3 {
        font-family: var(--font-display);
        font-size: 0.95rem;
        margin: 0 0 0.6rem;
      }
      .piece {
        display: grid;
        gap: 0.15rem;
        width: 100%;
        text-align: start;
        margin-bottom: 0.45rem;
        padding: 0.65rem 0.75rem;
        border-radius: 0.55rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--surface) 90%, transparent);
        color: inherit;
        cursor: pointer;
        transition: border-color 160ms ease, transform 160ms ease;
      }
      .piece:hover:not(:disabled) {
        border-color: var(--accent);
        transform: translateY(-1px);
      }
      .piece:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .piece.distractor {
        border-style: dashed;
        opacity: 0.75;
      }
      .piece__role {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        font-weight: 500;
      }
      .piece__hint {
        font-size: 0.72rem;
        color: var(--muted);
      }
      .stage-wrap {
        display: grid;
        gap: 0.65rem;
      }
      .stage {
        position: relative;
        min-height: 360px;
        border-radius: 0.9rem;
        border: 1px solid var(--line);
        background:
          linear-gradient(color-mix(in oklab, var(--line) 55%, transparent) 1px, transparent 1px) 0 0 /
            24px 24px,
          linear-gradient(90deg, color-mix(in oklab, var(--line) 55%, transparent) 1px, transparent 1px)
            0 0 / 24px 24px,
          color-mix(in oklab, var(--surface) 92%, transparent);
        overflow: hidden;
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
        stroke: color-mix(in oklab, var(--accent) 55%, var(--muted));
        stroke-width: 2;
        stroke-linecap: round;
      }
      .wire.hot {
        stroke: var(--accent-2);
        stroke-width: 2.5;
      }
      .wire.pulse {
        stroke-dasharray: 6 4;
        animation: dash 900ms linear infinite;
      }
      .wire-label {
        fill: var(--muted);
        font-size: 10px;
        font-family: var(--font-mono);
        text-anchor: middle;
      }
      .block {
        position: absolute;
        width: 148px;
        padding: 0.7rem 0.75rem;
        border-radius: 0.55rem;
        border: 1px solid var(--line);
        background: linear-gradient(
          160deg,
          color-mix(in oklab, var(--surface) 96%, var(--accent)),
          var(--surface)
        );
        color: inherit;
        text-align: start;
        cursor: pointer;
        box-shadow: 0 8px 22px color-mix(in oklab, #0b1c16 8%, transparent);
        transition: border-color 160ms ease, box-shadow 200ms ease, transform 200ms ease;
        z-index: 2;
      }
      .block.selected {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 22%, transparent);
      }
      .block.hot {
        border-color: var(--accent-2);
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 12px 28px color-mix(in oklab, var(--accent-2) 28%, transparent);
      }
      .block__label {
        display: block;
        font-family: var(--font-mono);
        font-weight: 500;
        font-size: 0.88rem;
      }
      .block__sub {
        display: block;
        font-size: 0.68rem;
        color: var(--muted);
        margin-top: 0.2rem;
        line-height: 1.3;
      }
      .empty {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--muted);
        margin: 0;
        pointer-events: none;
      }
      .rel-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        align-items: center;
      }
      .rel-label {
        font-size: 0.8rem;
        color: var(--muted);
        margin-inline-end: 0.25rem;
      }
      .rel {
        font-family: var(--font-mono);
        font-size: 0.78rem;
        padding: 0.35rem 0.65rem;
        border-radius: 0.45rem;
        border: 1px solid var(--line);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .rel.active {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 14%, transparent);
        color: var(--ink);
      }
      .hint {
        font-size: 0.78rem;
        margin-inline-start: 0.35rem;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-top: 1rem;
      }
      .feedback {
        margin-top: 0.9rem;
        padding: 0.85rem 1rem;
        border-radius: 0.7rem;
        border: 1px solid var(--line);
      }
      .feedback.ok {
        border-color: color-mix(in oklab, #2f9e7b 50%, var(--line));
      }
      .feedback.bad {
        border-color: color-mix(in oklab, #c45c4a 50%, var(--line));
      }
      .xp {
        font-family: var(--font-mono);
        color: var(--accent);
        margin: 0.35rem 0 0;
      }
      .anim-banner {
        margin-top: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.75rem 1rem;
        border-radius: 0.7rem;
        background: color-mix(in oklab, var(--accent-2) 12%, var(--surface));
        border: 1px solid color-mix(in oklab, var(--accent-2) 35%, var(--line));
        animation: rise 400ms ease both;
      }
      .pulse-dot {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
        background: var(--accent-2);
        animation: blink 900ms ease infinite;
        flex-shrink: 0;
      }
      @keyframes dash {
        to {
          stroke-dashoffset: -20;
        }
      }
      @keyframes blink {
        50% {
          opacity: 0.35;
        }
      }
    `,
  ],
})
export class BlockCanvas implements OnChanges, OnDestroy {
  @Input({ required: true }) challenge!: BlockChallenge;
  @Output() readonly cleared = new EventEmitter<{ score: number; passed: boolean }>();

  private readonly i18n = inject(I18nService);
  private readonly settings = inject(SettingsService);

  readonly blocks = signal<PlacedBlock[]>([]);
  readonly edges = signal<CanvasEdge[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly activeRelation = signal<ArenaRelation>('extends');
  readonly structureOk = signal(false);
  readonly feedback = signal('');
  readonly xpNote = signal('');
  readonly busy = signal(false);
  readonly animating = signal(false);
  readonly animMessage = signal('');
  readonly hotPieceIds = signal<Set<string>>(new Set());
  readonly hotEdgeIds = signal<Set<string>>(new Set());

  private animTimer: ReturnType<typeof setTimeout> | null = null;
  private placeIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['challenge']) {
      this.reset();
    }
  }

  ngOnDestroy(): void {
    this.clearAnimTimer();
  }

  placedCount(pieceId: string): number {
    return this.blocks().filter((b) => b.pieceId === pieceId).length;
  }

  addPiece(pieceId: string): void {
    if (this.placedCount(pieceId) > 0) return;
    const col = this.placeIndex % 3;
    const row = Math.floor(this.placeIndex / 3);
    this.placeIndex += 1;
    const instanceId = `${pieceId}-${crypto.randomUUID().slice(0, 8)}`;
    this.blocks.update((list) => [
      ...list,
      { instanceId, pieceId, x: 28 + col * 170, y: 28 + row * 110 },
    ]);
    this.structureOk.set(false);
    this.feedback.set('');
    this.xpNote.set('');
  }

  selectBlock(event: MouseEvent, instanceId: string): void {
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
  }

  clearSelection(): void {
    this.selectedId.set(null);
  }

  reset(): void {
    this.clearAnimTimer();
    this.blocks.set([]);
    this.edges.set([]);
    this.selectedId.set(null);
    this.structureOk.set(false);
    this.feedback.set('');
    this.xpNote.set('');
    this.animMessage.set('');
    this.hotPieceIds.set(new Set());
    this.hotEdgeIds.set(new Set());
    this.animating.set(false);
    this.placeIndex = 0;
    if (this.challenge.relations.length) {
      this.activeRelation.set(this.challenge.relations[0]);
    }
  }

  labelOf(pieceId: string): string {
    const p = this.challenge.pieces.find((x) => x.id === pieceId);
    return p ? this.i18n.localize(p.label) : pieceId;
  }

  hintOf(pieceId: string): string {
    const p = this.challenge.pieces.find((x) => x.id === pieceId);
    return p ? this.i18n.localize(p.hint) : '';
  }

  pieceIdOf(instanceId: string): string {
    return this.blocks().find((b) => b.instanceId === instanceId)?.pieceId ?? '';
  }

  edgePath(edge: CanvasEdge): { d: string; mx: number; my: number } | null {
    const from = this.blocks().find((b) => b.instanceId === edge.fromInstanceId);
    const to = this.blocks().find((b) => b.instanceId === edge.toInstanceId);
    if (!from || !to) return null;
    const x1 = from.x + 74;
    const y1 = from.y + 36;
    const x2 = to.x + 74;
    const y2 = to.y + 36;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 6;
    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - 24;
    return { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, mx, my };
  }

  isEdgeHot(edge: CanvasEdge): boolean {
    return this.hotEdgeIds().has(edge.id);
  }

  async validate(): Promise<void> {
    this.busy.set(true);
    try {
      const result = this.checkStructure();
      this.structureOk.set(result.ok);
      this.feedback.set(result.message);
      this.cleared.emit({ score: result.score, passed: result.ok });
      if (result.ok) {
        this.xpNote.set('');
      }
    } finally {
      this.busy.set(false);
    }
  }

  runAnimation(): void {
    if (!this.structureOk() || this.settings.settings().reduceMotion) {
      if (this.settings.settings().reduceMotion) {
        const last = this.challenge.animation[this.challenge.animation.length - 1];
        this.animMessage.set(last ? this.i18n.localize(last.message) : '');
        this.hotPieceIds.set(new Set(last?.pieceIds ?? []));
      }
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
      this.animTimer = setTimeout(tick, 1400);
    };
    tick();
  }

  private checkStructure(): { ok: boolean; score: number; message: string } {
    const placed = new Set(this.blocks().map((b) => b.pieceId));
    const distractors = this.challenge.pieces.filter((p) => p.distractor).map((p) => p.id);
    if (distractors.some((d) => placed.has(d))) {
      return {
        ok: false,
        score: 20,
        message: this.i18n.t('arena.feedback.distractor'),
      };
    }
    for (const id of this.challenge.requiredPieceIds) {
      if (!placed.has(id)) {
        return {
          ok: false,
          score: 35,
          message: this.i18n.t('arena.feedback.missingRole'),
        };
      }
    }

    const edgeKeys = this.edges().map((e) => {
      const from = this.pieceIdOf(e.fromInstanceId);
      const to = this.pieceIdOf(e.toInstanceId);
      return `${from}>${e.relation}>${to}`;
    });

    let matched = 0;
    for (const expected of this.challenge.expectedEdges) {
      const key = `${expected.from}>${expected.relation}>${expected.to}`;
      if (edgeKeys.includes(key)) matched += 1;
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

    return {
      ok: true,
      score: 100,
      message: this.i18n.t('arena.feedback.ok'),
    };
  }

  private clearAnimTimer(): void {
    if (this.animTimer) {
      clearTimeout(this.animTimer);
      this.animTimer = null;
    }
  }
}
