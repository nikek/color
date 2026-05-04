<script lang="ts">
  import { Canvas } from '@threlte/core';
  import * as THREE from 'three';
  import RgbCubeScene from './RgbCubeScene.svelte';
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6">
  <div class="aspect-square max-w-md mx-auto">
    <Canvas toneMapping={THREE.NoToneMapping}>
      <RgbCubeScene />
    </Canvas>
  </div>
  <p class="text-xs text-text-secondary text-center mt-3">Drag to rotate, scroll to zoom</p>
</div>
