import { canGo, DIRS, type Dir, type Maze } from "../lib/maze";
import { continueStraight } from "../lib/move";
import { camAxis, viewFor, type View } from "../lib/view";
import faceUrl from "../assets/face.jpg";

const STEP_MS = 55; // 한 칸 이동 시간
export const TRAIL_FADE_MS = 1000; // 지나온 길이 다 사라지는 시간 (1초)

const TOKENS = {
  out: "--out",
  floor: "--floor",
  wall: "--wall",
  trail: "--trail",
  player: "--player",
  goal: "--goal",
  goalWeak: "--goal-weak",
} as const;
type Colors = Record<keyof typeof TOKENS, string>;

export interface GameEvents {
  onStep(moves: number): void;
  onFinish(timeMs: number, moves: number): void;
  onBump(): void;
  onView(view: View): void;
}

/** 미로 한 판: 그리기 · 카메라 · 직선 자동 이동 · 타이머 · 1초 안에 사라지는 발자국 */
export class MazeGame {
  private ctx: CanvasRenderingContext2D;
  private colors = {} as Colors;
  private view: View | null = null;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private px = 0;
  private py = 0;
  private rx = 0;
  private ry = 0;
  private moving: { dir: Dir; fx: number; fy: number; t0: number } | null = null;
  private pending: Dir | null = null;
  private visitedAt: Float64Array;
  private trailUntil = 0;
  private moves = 0;

  private elapsedMs = 0;
  private startedAt = 0;
  private running = false;
  private done = false;
  private raf = 0;
  private face = new Image();

  constructor(
    private canvas: HTMLCanvasElement,
    private maze: Maze,
    private p: number,
    private events: GameEvents,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.visitedAt = new Float64Array(maze.cols * maze.rows);
    this.readColors();
    this.face.onload = () => this.draw();
    this.face.src = faceUrl;
    this.reset();
  }

  reset(): void {
    this.px = this.py = this.rx = this.ry = 0;
    this.moving = null;
    this.pending = null;
    this.visitedAt.fill(0);
    this.trailUntil = 0;
    this.moves = 0;
    this.elapsedMs = 0;
    this.running = false;
    this.done = false;
    this.visit(0, 0, performance.now());
    this.draw();
    this.loop();
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.view = viewFor(width, height, this.maze.cols, this.maze.rows, this.p);
    this.events.onView(this.view);
    this.draw();
  }

  move(dir: Dir): void {
    if (this.done) return;
    if (this.moving) {
      this.pending = dir; // 가는 중에 민 방향은 다음 칸에서 꺾어요
      return;
    }
    if (!canGo(this.maze, this.px, this.py, dir)) {
      this.events.onBump();
      return;
    }
    this.startTimer();
    this.moving = { dir, fx: this.px, fy: this.py, t0: performance.now() };
    this.loop();
  }

  elapsed(): number {
    return this.elapsedMs + (this.running ? performance.now() - this.startedAt : 0);
  }

  /** 앱을 내리면 타이머를 멈춰요 */
  pause(): void {
    if (this.running) {
      this.elapsedMs += performance.now() - this.startedAt;
      this.running = false;
    }
  }

  resume(): void {
    if (!this.done && this.moves > 0) this.startTimer();
  }

  themeChanged(): void {
    this.readColors();
    this.draw();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  // ── 안쪽 ───────────────────────────────────────
  private startTimer(): void {
    if (!this.running && !this.done) {
      this.running = true;
      this.startedAt = performance.now();
    }
  }

  private visit(x: number, y: number, now: number): void {
    this.visitedAt[y * this.maze.cols + x] = now;
    this.trailUntil = now + TRAIL_FADE_MS;
  }

  private loop(): void {
    if (!this.raf) this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number): void => {
    this.raf = 0;
    this.step(now);
    this.draw(now);
    if (this.moving || now < this.trailUntil) this.loop();
  };

  private step(now: number): void {
    const m = this.moving;
    if (!m) return;
    const d = DIRS[m.dir];
    const t = Math.min(1, (now - m.t0) / STEP_MS);
    this.rx = m.fx + d.dx * t;
    this.ry = m.fy + d.dy * t;
    if (t < 1) return;

    this.px = this.rx = m.fx + d.dx;
    this.py = this.ry = m.fy + d.dy;
    this.moves++;
    this.visit(this.px, this.py, now);
    this.moving = null;
    this.events.onStep(this.moves);

    if (this.px === this.maze.cols - 1 && this.py === this.maze.rows - 1) {
      this.pause();
      this.done = true;
      this.events.onFinish(this.elapsedMs, this.moves);
      return;
    }

    let next: Dir | null = null;
    if (this.pending && canGo(this.maze, this.px, this.py, this.pending)) next = this.pending;
    else if (continueStraight(this.maze, this.px, this.py, m.dir)) next = m.dir;
    this.pending = null;
    if (next) this.moving = { dir: next, fx: this.px, fy: this.py, t0: now };
  }

  private readColors(): void {
    const cs = getComputedStyle(document.documentElement);
    for (const [k, v] of Object.entries(TOKENS)) this.colors[k as keyof Colors] = cs.getPropertyValue(v).trim();
  }

  private draw(now = performance.now()): void {
    const v = this.view;
    if (!v) return;
    const { ctx, colors: C } = this;
    const { cols, rows, walls } = this.maze;
    const c = v.cell;
    const camX = camAxis(this.rx + 0.5, v.vw, cols);
    const camY = camAxis(this.ry + 0.5, v.vh, rows);

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = C.out;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.translate(-camX * c, -camY * c);
    ctx.fillStyle = C.floor;
    ctx.fillRect(0, 0, cols * c, rows * c);

    const x0 = Math.max(0, Math.floor(camX)), x1 = Math.min(cols - 1, Math.ceil(camX + v.vw));
    const y0 = Math.max(0, Math.floor(camY)), y1 = Math.min(rows - 1, Math.ceil(camY + v.vh));

    // 도착 칸
    ctx.fillStyle = C.goalWeak;
    ctx.fillRect((cols - 1) * c, (rows - 1) * c, c, c);

    // 지나온 길: 고양이 발자국. 1초 안에 옅어지다 사라져요
    ctx.fillStyle = C.trail;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const at = this.visitedAt[y * cols + x];
        const age = now - at;
        if (!at || age >= TRAIL_FADE_MS) continue;
        ctx.globalAlpha = 1 - Math.max(0, age) / TRAIL_FADE_MS;
        const cx = (x + 0.5) * c, cy = (y + 0.5) * c;
        ctx.beginPath();
        ctx.ellipse(cx, cy + c * 0.06, c * 0.13, c * 0.11, 0, 0, Math.PI * 2);
        for (const [tx, ty] of [[-0.13, -0.09], [0, -0.15], [0.13, -0.09]]) {
          ctx.moveTo(cx + tx * c + c * 0.055, cy + ty * c);
          ctx.arc(cx + tx * c, cy + ty * c, c * 0.055, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // 벽
    ctx.strokeStyle = C.wall;
    ctx.lineWidth = Math.max(1.5, Math.min(c * 0.1, 4));
    ctx.lineCap = "square";
    ctx.beginPath();
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const w = walls[y * cols + x];
        if (w & 1) { ctx.moveTo(x * c, y * c); ctx.lineTo((x + 1) * c, y * c); }
        if (w & 8) { ctx.moveTo(x * c, y * c); ctx.lineTo(x * c, (y + 1) * c); }
        if (y === rows - 1 && w & 4) { ctx.moveTo(x * c, (y + 1) * c); ctx.lineTo((x + 1) * c, (y + 1) * c); }
        if (x === cols - 1 && w & 2) { ctx.moveTo((x + 1) * c, y * c); ctx.lineTo((x + 1) * c, (y + 1) * c); }
      }
    }
    ctx.stroke();

    // 도착: 기타 피크
    const gx = (cols - 1) * c, gy = (rows - 1) * c;
    const at = (fx: number, fy: number): [number, number] => [gx + fx * c, gy + fy * c];
    ctx.fillStyle = C.goal;
    ctx.beginPath();
    ctx.moveTo(...at(0.5, 0.2));
    ctx.quadraticCurveTo(...at(0.86, 0.18), ...at(0.8, 0.42));
    ctx.quadraticCurveTo(...at(0.66, 0.74), ...at(0.5, 0.84));
    ctx.quadraticCurveTo(...at(0.34, 0.74), ...at(0.2, 0.42));
    ctx.quadraticCurveTo(...at(0.14, 0.18), ...at(0.5, 0.2));
    ctx.fill();

    // 플레이어: 캐릭터 얼굴 + 보라 테두리
    const px = (this.rx + 0.5) * c, py = (this.ry + 0.5) * c, pr = c * 0.42;
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = C.player;
    ctx.fill();
    if (this.face.complete && this.face.naturalWidth) {
      ctx.clip();
      ctx.drawImage(this.face, px - pr, py - pr, pr * 2, pr * 2);
    }
    ctx.restore();
    ctx.strokeStyle = C.player;
    ctx.lineWidth = Math.max(1.5, c * 0.07);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.stroke();
  }
}
