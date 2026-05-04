<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import * as THREE from 'three';
  import { isInGamut, oklchToSrgb } from '../../lib/color';

  interface Props {
    unfolded: boolean;
  }

  let { unfolded }: Props = $props();

  const L_STEPS = 40;
  const H_STEPS = 96;
  const MAX_CHROMA = 0.37;
  const CHROMA_SEARCH_STEPS = 64;
  const DURATION = 1;

  function srgbToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function findMaxChroma(l: number, h: number): number {
    let lo = 0;
    let hi = MAX_CHROMA;
    for (let i = 0; i < CHROMA_SEARCH_STEPS; i++) {
      const mid = (lo + hi) / 2;
      if (isInGamut(l, mid, h, 'srgb')) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  const cols = H_STEPS + 1;
  const rows = L_STEPS + 1;
  const vertexCount = cols * rows;

  const vertexU = new Float32Array(vertexCount);
  const vertexR = new Float32Array(vertexCount);
  const vertexDist = new Float32Array(vertexCount);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];
  const posArray = new Float32Array(vertexCount * 3);

  for (let li = 0; li <= L_STEPS; li++) {
    const l = li / L_STEPS;
    for (let hi = 0; hi <= H_STEPS; hi++) {
      const hIdx = hi % H_STEPS;
      const hNorm = hi / H_STEPS;
      const h = (hIdx / H_STEPS) * 360;
      const maxC = findMaxChroma(l, h);
      const radius = (maxC / MAX_CHROMA) * 0.5;
      const idx = li * cols + hi;
      const u = hNorm - 0.5;

      vertexU[idx] = u;
      vertexR[idx] = radius;
      vertexDist[idx] = Math.abs(u) * 2;

      const angle = hNorm * Math.PI * 2;
      posArray[idx * 3] = Math.cos(angle) * radius;
      posArray[idx * 3 + 1] = l - 0.5;
      posArray[idx * 3 + 2] = Math.sin(angle) * radius;

      const [r, g, b] = oklchToSrgb(l, maxC, h);
      colors[idx * 3] = srgbToLinear(r / 255);
      colors[idx * 3 + 1] = srgbToLinear(g / 255);
      colors[idx * 3 + 2] = srgbToLinear(b / 255);
    }
  }

  for (let li = 0; li < L_STEPS; li++) {
    for (let hi = 0; hi < H_STEPS; hi++) {
      const a = li * cols + hi;
      const b = a + 1;
      const c = (li + 1) * cols + hi;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const posAttr = new THREE.BufferAttribute(posArray, 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  let progress = 0;

  useTask((delta) => {
    const target = unfolded ? 1 : 0;
    if (progress === target) return;

    const speed = 1 / DURATION;
    if (progress < target) {
      progress = Math.min(progress + speed * delta, target);
    } else {
      progress = Math.max(progress - speed * delta, target);
    }

    const t = easeInOutCubic(progress);
    const pos = posAttr.array as Float32Array;

    // Angular spread shrinks from 2π (full circle) toward 0 (flat)
    const spread = 2 * Math.PI * (1 - t);

    for (let v = 0; v < vertexCount; v++) {
      const u = vertexU[v];
      const r = vertexR[v];

      // Angle decreases: hue 180° stays at π, others compress toward it
      const angle = Math.PI + u * spread;

      // Arc component (circular, shrinking span)
      const xArc = Math.cos(angle) * r;
      const zArc = Math.sin(angle) * r;

      // Flat component (linear hue axis, z inverted)
      const xFlat = u;
      const zFlat = -r;

      const i = v * 3;
      pos[i] = xArc * (1 - t) + xFlat * t;
      pos[i + 2] = zArc * (1 - t) + zFlat * t;
    }

    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  });
</script>

<T.PerspectiveCamera makeDefault position={[1.5, 1, 1.5]} fov={40}>
  <OrbitControls enableDamping autoRotate autoRotateSpeed={0.5} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={1} />

<T.Mesh {geometry}>
  <T.MeshBasicMaterial vertexColors side={THREE.DoubleSide} />
</T.Mesh>
