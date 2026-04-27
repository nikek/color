<script lang="ts">
  import Slider from '../ui/Slider.svelte';
  import { relativeLuminance } from '../../lib/contrast';
  import { hslToRgb, oklchToSrgb } from '../../lib/color';

  let lightness = $state(70);
  let chroma = $state(0.15);
  const steps = 18;
  const hues = Array.from({ length: steps }, (_, i) => i * (360 / steps));

  let hslSwatches = $derived(
    hues.map(h => {
      const [r, g, b] = hslToRgb(h, 100, lightness / 100 * 50 + 25);
      return { h, r, g, b, lum: relativeLuminance(r, g, b) };
    })
  );

  let oklchSwatches = $derived(
    hues.map(h => {
      const l = lightness / 100;
      const [r, g, b] = oklchToSrgb(l, chroma, h);
      return { h, r, g, b, lum: relativeLuminance(r, g, b) };
    })
  );
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6 space-y-6">
  <div class="space-y-3">
    <Slider label="L" min={20} max={90} bind:value={lightness} />
  </div>

  <div class="space-y-2">
    <p class="text-sm text-text-secondary">HSL — fixed saturation & lightness, varying hue</p>
    <div class="flex gap-1">
      {#each hslSwatches as swatch}
        <div class="flex-1 flex flex-col items-center gap-1">
          <div
            class="w-full aspect-square rounded"
            style="background: rgb({swatch.r}, {swatch.g}, {swatch.b});"
          ></div>
          <span class="text-[10px] tabular-nums text-text-secondary">{swatch.lum.toFixed(2)}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="space-y-2">
    <p class="text-sm text-text-secondary">OKLCH — fixed lightness & chroma, varying hue</p>
    <div class="flex gap-1">
      {#each oklchSwatches as swatch}
        <div class="flex-1 flex flex-col items-center gap-1">
          <div
            class="w-full aspect-square rounded"
            style="background: oklch({lightness}% {chroma} {swatch.h});"
          ></div>
          <span class="text-[10px] tabular-nums text-text-secondary">{swatch.lum.toFixed(2)}</span>
        </div>
      {/each}
    </div>
  </div>

  <p class="text-xs text-text-secondary">
    Numbers below each swatch show relative luminance. Notice how HSL values vary wildly while OKLCH stays consistent.
  </p>
</div>
