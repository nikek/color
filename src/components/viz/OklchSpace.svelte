<script lang="ts">
  import { Canvas } from '@threlte/core';
  import OklchSpaceScene from './OklchSpaceScene.svelte';
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6">
  <div class="aspect-square max-w-md mx-auto">
    <Canvas>
      <OklchSpaceScene />
    </Canvas>
  </div>
  <p class="text-xs text-text-secondary text-center mt-3">
    The sRGB gamut in OKLCH space. Notice the irregular shape — this is why sRGB is not perceptually uniform.
    Drag to rotate.
  </p>
</div>
