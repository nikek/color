import { SPECTRAL_LOCUS, SRGB_PRIMARIES, P3_PRIMARIES } from "./cie-data";
import { xyzToSrgbLinear, xyzToP3Linear, linearToSrgb } from "./color";

export interface DiagramOptions {
  showSrgb: boolean;
  showP3: boolean;
  showWavelengths: boolean;
  isP3Display: boolean;
}

const PADDING = 40;
const BG = [0x1a, 0x1a, 0x2e] as const;
const STRIPE_PITCH = 6;

function xyToCanvas(
  x: number,
  y: number,
  w: number,
  h: number,
): [number, number] {
  const pw = w - PADDING * 2;
  const ph = h - PADDING * 2;
  return [PADDING + x * pw * 1.1, h - PADDING - y * ph * 1.1];
}

function canvasToXy(
  px: number,
  py: number,
  w: number,
  h: number,
): [number, number] {
  const pw = w - PADDING * 2;
  const ph = h - PADDING * 2;
  return [(px - PADDING) / (pw * 1.1), (h - PADDING - py) / (ph * 1.1)];
}

function pointInTriangle(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): boolean {
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  const a = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d;
  const b = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d;
  const c = 1 - a - b;
  return a >= 0 && b >= 0 && c >= 0;
}

const locusXy: [number, number][] = SPECTRAL_LOCUS.map(([, x, y]) => [x, y]);
locusXy.push([SPECTRAL_LOCUS[0][1], SPECTRAL_LOCUS[0][2]]);

function isInsideLocus(cx: number, cy: number): boolean {
  let inside = false;
  for (let i = 0, j = locusXy.length - 1; i < locusXy.length; j = i++) {
    const [xi, yi] = locusXy[i];
    const [xj, yj] = locusXy[j];
    if (yi > cy !== yj > cy && cx < ((xj - xi) * (cy - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inSrgbTriangle(cx: number, cy: number): boolean {
  const s = SRGB_PRIMARIES;
  return pointInTriangle(cx, cy, s.r.x, s.r.y, s.g.x, s.g.y, s.b.x, s.b.y);
}

function inP3Triangle(cx: number, cy: number): boolean {
  const p = P3_PRIMARIES;
  return pointInTriangle(cx, cy, p.r.x, p.r.y, p.g.x, p.g.y, p.b.x, p.b.y);
}

function xyToXYZ(cx: number, cy: number): [number, number, number] {
  const Y = 1;
  const X = (cx / cy) * Y;
  const Z = ((1 - cx - cy) / cy) * Y;
  return [X, Y, Z];
}

// sRGB and Display P3 share the same transfer function
function encodeGamma(
  lr: number,
  lg: number,
  lb: number,
): [number, number, number] {
  const scale = Math.max(1, lr, lg, lb);
  return [
    Math.round(linearToSrgb(Math.max(0, lr / scale)) * 255),
    Math.round(linearToSrgb(Math.max(0, lg / scale)) * 255),
    Math.round(linearToSrgb(Math.max(0, lb / scale)) * 255),
  ];
}

interface PixelData {
  inSrgb: boolean;
  inP3: boolean;
  inLocus: boolean;
  srgbColor: [number, number, number];
  p3Color: [number, number, number];
  locusDim: [number, number, number];
}

let pixelCache: PixelData[][] | null = null;
let cachedSize: [number, number] = [0, 0];

function computePixels(w: number, h: number): PixelData[][] {
  if (pixelCache && cachedSize[0] === w && cachedSize[1] === h)
    return pixelCache;

  const grid: PixelData[][] = new Array(h);
  for (let py = 0; py < h; py++) {
    grid[py] = new Array(w);
    for (let px = 0; px < w; px++) {
      const [cx, cy] = canvasToXy(px, py, w, h);

      const empty: PixelData = {
        inSrgb: false,
        inP3: false,
        inLocus: false,
        srgbColor: [0, 0, 0],
        p3Color: [0, 0, 0],
        locusDim: [BG[0], BG[1], BG[2]],
      };

      if (cx < -0.01 || cx > 0.78 || cy < -0.01 || cy > 0.88 || cy <= 0.001) {
        grid[py][px] = empty;
        continue;
      }

      const locus = isInsideLocus(cx, cy);
      if (!locus) {
        grid[py][px] = empty;
        continue;
      }

      const srgb = inSrgbTriangle(cx, cy);
      const p3 = inP3Triangle(cx, cy);

      const [X, Y, Z] = xyToXYZ(cx, cy);
      const [lr, lg, lb] = xyzToSrgbLinear(X, Y, Z);
      const srgbColor = encodeGamma(lr, lg, lb);

      let p3Color: [number, number, number] = [0, 0, 0];
      if (p3) {
        const [plr, plg, plb] = xyzToP3Linear(X, Y, Z);
        p3Color = encodeGamma(plr, plg, plb);
      }

      const dim = 0.12;
      const locusDim: [number, number, number] = [
        Math.round(BG[0] + (srgbColor[0] - BG[0]) * dim),
        Math.round(BG[1] + (srgbColor[1] - BG[1]) * dim),
        Math.round(BG[2] + (srgbColor[2] - BG[2]) * dim),
      ];

      grid[py][px] = {
        inSrgb: srgb,
        inP3: p3,
        inLocus: true,
        srgbColor,
        p3Color,
        locusDim,
      };
    }
  }

  pixelCache = grid;
  cachedSize = [w, h];
  return grid;
}

export function renderCieDiagram(
  canvas: HTMLCanvasElement,
  options: DiagramOptions,
): void {
  const { width: w, height: h } = canvas;
  const { showSrgb, showP3, showWavelengths, isP3Display } = options;

  const ctxOptions: CanvasRenderingContext2DSettings = isP3Display
    ? { colorSpace: "display-p3" }
    : {};
  const ctx = canvas.getContext("2d", ctxOptions)!;

  const pixels = computePixels(w, h);
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const idx = (py * w + px) * 4;
      const p = pixels[py][px];

      if (showSrgb && p.inSrgb) {
        if (isP3Display) {
          data[idx] = p.p3Color[0];
          data[idx + 1] = p.p3Color[1];
          data[idx + 2] = p.p3Color[2];
        } else {
          data[idx] = p.srgbColor[0];
          data[idx + 1] = p.srgbColor[1];
          data[idx + 2] = p.srgbColor[2];
        }
        data[idx + 3] = 255;
      } else if (showP3 && p.inP3 && !p.inSrgb) {
        if (isP3Display) {
          data[idx] = p.p3Color[0];
          data[idx + 1] = p.p3Color[1];
          data[idx + 2] = p.p3Color[2];
          data[idx + 3] = 255;
        } else {
          const stripe = (px + py) % STRIPE_PITCH < 3;
          if (stripe) {
            data[idx] = p.srgbColor[0];
            data[idx + 1] = p.srgbColor[1];
            data[idx + 2] = p.srgbColor[2];
          } else {
            data[idx] = BG[0];
            data[idx + 1] = BG[1];
            data[idx + 2] = BG[2];
          }
          data[idx + 3] = 255;
        }
      } else if (p.inLocus) {
        data[idx] = p.locusDim[0];
        data[idx + 1] = p.locusDim[1];
        data[idx + 2] = p.locusDim[2];
        data[idx + 3] = 255;
      } else {
        data[idx] = BG[0];
        data[idx + 1] = BG[1];
        data[idx + 2] = BG[2];
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  drawSpectralLocus(ctx, w, h);

  if (showSrgb) {
    drawGamutTriangle(
      ctx,
      SRGB_PRIMARIES,
      w,
      h,
      "rgba(255,255,255,0.7)",
      "sRGB",
      [15, -30],
    );
  }
  if (showP3) {
    drawGamutTriangle(
      ctx,
      P3_PRIMARIES,
      w,
      h,
      "rgba(0,255,255,0.7)",
      "Display P3",
      [15, -15],
    );
  }

  if (showWavelengths) {
    drawWavelengthLabels(ctx, w, h);
  } else {
    drawAxes(ctx, w, h);
  }
}

function spectralColor(x: number, y: number): string {
  const [X, Y, Z] = xyToXYZ(x, y);
  const [lr, lg, lb] = xyzToSrgbLinear(X, Y, Z);
  const [r, g, b] = encodeGamma(lr, lg, lb);
  return `rgb(${r},${g},${b})`;
}

function drawSpectralLocus(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.lineWidth = 2;

  for (let i = 1; i < SPECTRAL_LOCUS.length; i++) {
    const [, x0, y0] = SPECTRAL_LOCUS[i - 1];
    const [, x1, y1] = SPECTRAL_LOCUS[i];
    const [cx0, cy0] = xyToCanvas(x0, y0, w, h);
    const [cx1, cy1] = xyToCanvas(x1, y1, w, h);

    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(cx1, cy1);
    ctx.strokeStyle = spectralColor(x1, y1);
    ctx.stroke();
  }

  const last = SPECTRAL_LOCUS[SPECTRAL_LOCUS.length - 1];
  const first = SPECTRAL_LOCUS[0];
  const [lx, ly] = xyToCanvas(last[1], last[2], w, h);
  const [fx, fy] = xyToCanvas(first[1], first[2], w, h);
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(fx, fy);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.stroke();
}

interface Primaries {
  r: { x: number; y: number };
  g: { x: number; y: number };
  b: { x: number; y: number };
}

function drawGamutTriangle(
  ctx: CanvasRenderingContext2D,
  primaries: Primaries,
  w: number,
  h: number,
  color: string,
  label: string,
  labelOffset: [number, number],
) {
  const [rx, ry] = xyToCanvas(primaries.r.x, primaries.r.y, w, h);
  const [gx, gy] = xyToCanvas(primaries.g.x, primaries.g.y, w, h);
  const [bx, by] = xyToCanvas(primaries.b.x, primaries.b.y, w, h);

  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(gx, gy);
  ctx.lineTo(bx, by);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "14px system-ui";
  ctx.fillStyle = color;
  const labelX = rx + labelOffset[0];
  const labelY = ry + labelOffset[1];
  ctx.fillText(label, labelX, labelY);

  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(labelX - 2, labelY + 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

const WAVELENGTH_LABELS = [
  460, 470, 480, 490, 500, 510, 520, 530, 540, 560, 580, 600, 620, 700,
];

const locusCenter: [number, number] = [
  SPECTRAL_LOCUS.reduce((s, [, x]) => s + x, 0) / SPECTRAL_LOCUS.length,
  SPECTRAL_LOCUS.reduce((s, [, , y]) => s + y, 0) / SPECTRAL_LOCUS.length,
];

function drawWavelengthLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.font = "10px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.6)";

  for (const nm of WAVELENGTH_LABELS) {
    const entry = SPECTRAL_LOCUS.find(([wl]) => wl === nm);
    if (!entry) continue;

    const [, x, y] = entry;
    const [cx, cy] = xyToCanvas(x, y, w, h);

    const dx = x - locusCenter[0];
    const dy = y - locusCenter[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    const offset = 14;
    const lx = cx + nx * offset;
    const ly = cy - ny * offset;

    ctx.textAlign = nx > 0.3 ? "left" : nx < -0.3 ? "right" : "center";
    ctx.textBaseline = ny > 0.3 ? "bottom" : ny < -0.3 ? "top" : "middle";
    ctx.fillText(`${nm}`, lx, ly);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + nx * 5, cy - ny * 5);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawAxes(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.font = "11px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.4)";

  for (let i = 0; i <= 7; i++) {
    const v = i / 10;
    const [x, y] = xyToCanvas(v, 0, w, h);
    ctx.fillText(v.toFixed(1), x - 8, y + 15);
  }

  for (let i = 1; i <= 8; i++) {
    const v = i / 10;
    const [x, y] = xyToCanvas(0, v, w, h);
    ctx.fillText(v.toFixed(1), x - 30, y + 4);
  }

  ctx.fillText("x", w / 2, h - 8);
  ctx.fillText("y", 8, h / 2);
}
