<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import * as THREE from 'three';
  import { isInGamut, oklchToSrgb } from '../../lib/color';

  const L_STEPS = 20;
  const C_STEPS = 16;
  const H_STEPS = 48;
  const MAX_CHROMA = 0.37;

  function createOklchGeometry(): THREE.BufferGeometry {
    const positions: number[] = [];
    const colors: number[] = [];

    for (let li = 1; li < L_STEPS; li++) {
      const l = li / L_STEPS;
      for (let ci = 1; ci <= C_STEPS; ci++) {
        const c = (ci / C_STEPS) * MAX_CHROMA;
        for (let hi = 0; hi < H_STEPS; hi++) {
          const h = (hi / H_STEPS) * 360;

          if (!isInGamut(l, c, h, 'srgb')) continue;

          const angle = (h / 360) * Math.PI * 2;
          const radius = c / MAX_CHROMA * 0.5;

          positions.push(
            Math.cos(angle) * radius,
            l - 0.5,
            Math.sin(angle) * radius,
          );

          const [r, g, b] = oklchToSrgb(l, c, h);
          colors.push(r / 255, g / 255, b / 255);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }

  const geometry = createOklchGeometry();
</script>

<T.PerspectiveCamera makeDefault position={[1.5, 1, 1.5]} fov={40}>
  <OrbitControls enableDamping autoRotate autoRotateSpeed={0.5} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={1} />

<T.Points {geometry}>
  <T.PointsMaterial vertexColors size={0.012} sizeAttenuation />
</T.Points>
