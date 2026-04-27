import Color from 'colorjs.io';

export function srgbToOklch(r: number, g: number, b: number) {
  const c = new Color('srgb', [r / 255, g / 255, b / 255]);
  const [l, ch, h] = c.to('oklch').coords;
  return { l, c: ch, h: h || 0 };
}

export function oklchToSrgb(l: number, c: number, h: number): [number, number, number] {
  const color = new Color('oklch', [l, c, h]);
  const [r, g, b] = color.to('srgb').coords.map((v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255));
  return [r, g, b];
}

export function oklchToP3(l: number, c: number, h: number): [number, number, number] {
  const color = new Color('oklch', [l, c, h]);
  const [r, g, b] = color.to('p3').coords;
  return [r, g, b];
}

export function isInGamut(l: number, c: number, h: number, space = 'srgb'): boolean {
  const color = new Color('oklch', [l, c, h]);
  return color.inGamut(space);
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

export function xyzToSrgbLinear(x: number, y: number, z: number): [number, number, number] {
  return [
    3.2406 * x - 1.5372 * y - 0.4986 * z,
    -0.9689 * x + 1.8758 * y + 0.0415 * z,
    0.0557 * x - 0.2040 * y + 1.0570 * z,
  ];
}

export function xyzToP3Linear(x: number, y: number, z: number): [number, number, number] {
  return [
     2.4934969 * x - 0.9313836 * y - 0.4027108 * z,
    -0.8294890 * x + 1.7626641 * y + 0.0236247 * z,
     0.0358458 * x - 0.0761724 * y + 0.9568845 * z,
  ];
}

export function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
