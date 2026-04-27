<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import * as THREE from 'three';
  import { hslToRgb } from '../../lib/color';

  const HUE_STEPS = 64;
  const SAT_STEPS = 16;
  const LIGHT_STEPS = 32;

  function createHslCylinder(): THREE.BufferGeometry {
    const positions: number[] = [];
    const colors: number[] = [];

    for (let li = 0; li <= LIGHT_STEPS; li++) {
      const l = li / LIGHT_STEPS;
      for (let si = 1; si <= SAT_STEPS; si++) {
        const s = si / SAT_STEPS;
        for (let hi = 0; hi < HUE_STEPS; hi++) {
          const h = (hi / HUE_STEPS) * 360;
          const angle = (hi / HUE_STEPS) * Math.PI * 2;
          const radius = s * 0.5;

          positions.push(
            Math.cos(angle) * radius,
            l - 0.5,
            Math.sin(angle) * radius,
          );

          const [r, g, b] = hslToRgb(h, s * 100, l * 100);
          colors.push(r / 255, g / 255, b / 255);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }

  const geometry = createHslCylinder();
</script>

<T.PerspectiveCamera makeDefault position={[1.5, 1.2, 1.5]} fov={40}>
  <OrbitControls enableDamping autoRotate autoRotateSpeed={0.5} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={1} />

<T.Points {geometry}>
  <T.PointsMaterial vertexColors size={0.015} sizeAttenuation />
</T.Points>
