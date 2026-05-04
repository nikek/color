<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import * as THREE from 'three';
  import { hsbToRgb } from '../../lib/color';

  interface Props {
    hue: number;
  }

  let { hue }: Props = $props();

  const HUE_STEPS = 64;
  const SAT_STEPS = 16;
  const BRIGHT_STEPS = 32;

  function srgbToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function createHsbCylinder(): THREE.BufferGeometry {
    const positions: number[] = [];
    const colors: number[] = [];

    for (let bi = 0; bi <= BRIGHT_STEPS; bi++) {
      const b = bi / BRIGHT_STEPS;
      for (let si = 1; si <= SAT_STEPS; si++) {
        const s = si / SAT_STEPS;
        for (let hi = 0; hi < HUE_STEPS; hi++) {
          const h = (hi / HUE_STEPS) * 360;
          const angle = (hi / HUE_STEPS) * Math.PI * 2;
          const radius = s * 0.5;

          positions.push(
            Math.cos(angle) * radius,
            b - 0.5,
            Math.sin(angle) * radius,
          );

          const [r, g, bl] = hsbToRgb(h, s * 100, b * 100);
          colors.push(srgbToLinear(r / 255), srgbToLinear(g / 255), srgbToLinear(bl / 255));
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }

  const PLANE_STEPS = 32;

  function createHuePlane(h: number): THREE.BufferGeometry {
    const angle = (h / 360) * Math.PI * 2;
    const cols = PLANE_STEPS + 1;
    const rows = PLANE_STEPS + 1;
    const vertexCount = cols * rows;
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const indices: number[] = [];

    let idx = 0;
    for (let bi = 0; bi < rows; bi++) {
      const b = bi / PLANE_STEPS;
      for (let si = 0; si < cols; si++) {
        const s = si / PLANE_STEPS;
        const radius = s * 0.5;

        positions[idx * 3] = Math.cos(angle) * radius;
        positions[idx * 3 + 1] = b - 0.5;
        positions[idx * 3 + 2] = Math.sin(angle) * radius;

        const [r, g, bl] = hsbToRgb(h, s * 100, b * 100);
        colors[idx * 3] = srgbToLinear(r / 255);
        colors[idx * 3 + 1] = srgbToLinear(g / 255);
        colors[idx * 3 + 2] = srgbToLinear(bl / 255);
        idx++;
      }
    }

    for (let bi = 0; bi < PLANE_STEPS; bi++) {
      for (let si = 0; si < PLANE_STEPS; si++) {
        const a = bi * cols + si;
        const b = a + 1;
        const c = a + cols;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    return geometry;
  }

  let planeGeometry = $derived(createHuePlane(hue));
  const cylinderGeometry = createHsbCylinder();
</script>

<T.PerspectiveCamera makeDefault position={[1.5, 1.2, 1.5]} fov={40}>
  <OrbitControls enableDamping autoRotate autoRotateSpeed={0.5} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={1} />

<T.Points geometry={cylinderGeometry}>
  <T.PointsMaterial vertexColors size={0.015} sizeAttenuation />
</T.Points>

<T.Mesh geometry={planeGeometry}>
  <T.MeshBasicMaterial vertexColors side={THREE.DoubleSide} />
</T.Mesh>
