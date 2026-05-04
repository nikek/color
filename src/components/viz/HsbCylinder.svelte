<script lang="ts">
  import { Canvas } from '@threlte/core';
  import * as THREE from 'three';
  import HsbCylinderScene from './HsbCylinderScene.svelte';

  let hue = $state(0);
  let dragging = $state(false);

  function updateHue(e: PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    hue = Math.round(x * 360);
  }
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6">
  <div class="aspect-square max-w-md mx-auto">
    <Canvas toneMapping={THREE.NoToneMapping}>
      <HsbCylinderScene {hue} />
    </Canvas>
  </div>

  <div class="max-w-md mx-auto mt-4 space-y-1">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="relative h-5 rounded cursor-pointer select-none touch-none"
      style="background: linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))"
      onpointerdown={(e) => {
        dragging = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        updateHue(e);
      }}
      onpointermove={(e) => { if (dragging) updateHue(e); }}
      onpointerup={() => { dragging = false; }}
    >
      <div
        class="absolute -top-1 -bottom-1 w-1.5 -translate-x-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
        style="left: {(hue / 360) * 100}%"
      ></div>
    </div>
    <p class="text-xs text-text-secondary text-center">Hue: {hue}°</p>
  </div>

  <p class="text-xs text-text-secondary text-center mt-3">Drag to rotate, scroll to zoom</p>
</div>
