<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import * as THREE from 'three';

  const SEGMENTS = 32;

  function srgbToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function createRgbCubeGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BoxGeometry(1, 1, 1, SEGMENTS, SEGMENTS, SEGMENTS);
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) + 0.5;
      const y = positions.getY(i) + 0.5;
      const z = positions.getZ(i) + 0.5;
      colors[i * 3] = srgbToLinear(x);
      colors[i * 3 + 1] = srgbToLinear(y);
      colors[i * 3 + 2] = srgbToLinear(z);
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }

  const geometry = createRgbCubeGeometry();
</script>

<T.PerspectiveCamera makeDefault position={[2, 1.8, 2]} fov={40}>
  <OrbitControls enableDamping autoRotate autoRotateSpeed={0.5} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={1} />

<T.Mesh {geometry}>
  <T.MeshBasicMaterial vertexColors side={THREE.DoubleSide} />
</T.Mesh>

<T.AxesHelper args={[1.3]} />
