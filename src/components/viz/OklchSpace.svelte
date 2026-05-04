<script lang="ts">
  import { Canvas } from '@threlte/core';
  import * as THREE from 'three';
  import OklchSpaceScene from './OklchSpaceScene.svelte';

  let unfolded = $state(false);
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6">
  <div class="aspect-square max-w-md mx-auto">
    <Canvas toneMapping={THREE.NoToneMapping}>
      <OklchSpaceScene {unfolded} />
    </Canvas>
  </div>

  <div class="flex items-center justify-center gap-3 mt-4">
    <button
      class="px-3 py-1.5 text-sm rounded-md border transition-colors {unfolded
        ? 'border-border text-text-secondary hover:text-text-primary'
        : 'border-accent bg-accent/10 text-accent'}"
      onclick={() => { unfolded = false; }}
    >Cylinder</button>
    <button
      class="px-3 py-1.5 text-sm rounded-md border transition-colors {unfolded
        ? 'border-accent bg-accent/10 text-accent'
        : 'border-border text-text-secondary hover:text-text-primary'}"
      onclick={() => { unfolded = true; }}
    >Unfolded</button>
  </div>

  <p class="text-xs text-text-secondary text-center mt-3">
    The sRGB gamut in OKLCH space. Notice the irregular shape — this is why sRGB is not perceptually uniform.
    Drag to rotate.
  </p>
</div>
