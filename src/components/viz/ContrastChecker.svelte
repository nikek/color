<script lang="ts">
  import Slider from '../ui/Slider.svelte';
  import { oklchToSrgb } from '../../lib/color';
  import { relativeLuminance, contrastRatio, meetsAA, meetsAAA } from '../../lib/contrast';

  let bgL = $state(40);
  let bgC = $state(0.1);
  let bgH = $state(260);
  let textL = $state(95);

  let bgRgb = $derived(oklchToSrgb(bgL / 100, bgC, bgH));
  let textRgb = $derived(oklchToSrgb(textL / 100, 0.01, bgH));

  let bgLum = $derived(relativeLuminance(...bgRgb));
  let textLum = $derived(relativeLuminance(...textRgb));
  let ratio = $derived(contrastRatio(bgLum, textLum));

  let bgCss = $derived(`oklch(${bgL}% ${bgC} ${bgH})`);
  let textCss = $derived(`oklch(${textL}% 0.01 ${bgH})`);
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6 space-y-5">
  <div class="grid md:grid-cols-2 gap-6">
    <div class="space-y-3">
      <p class="text-sm font-medium text-text-secondary">Background (OKLCH)</p>
      <Slider label="L" min={5} max={95} bind:value={bgL} />
      <Slider label="C" min={0} max={0.37} step={0.005} bind:value={bgC} />
      <Slider label="H" min={0} max={360} bind:value={bgH} />

      <p class="text-sm font-medium text-text-secondary mt-4">Text lightness</p>
      <Slider label="L" min={5} max={100} bind:value={textL} />
    </div>

    <div class="space-y-3">
      <div
        class="rounded-lg p-6 min-h-[140px] flex flex-col justify-center border border-border"
        style="background: {bgCss};"
      >
        <p class="text-lg font-medium leading-relaxed" style="color: {textCss};">
          The quick brown fox jumps over the lazy dog.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-2xl font-bold tabular-nums">{ratio.toFixed(2)}:1</span>
        <div class="flex gap-2">
          <span class="px-2 py-0.5 rounded text-xs font-medium {meetsAAA(ratio) ? 'bg-green-900 text-green-300' : meetsAA(ratio) ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}">
            AA {meetsAA(ratio) ? 'Pass' : 'Fail'}
          </span>
          <span class="px-2 py-0.5 rounded text-xs font-medium {meetsAAA(ratio) ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}">
            AAA {meetsAAA(ratio) ? 'Pass' : 'Fail'}
          </span>
        </div>
      </div>

      <p class="text-xs text-text-secondary">
        Try changing the hue (H) and chroma (C) while keeping lightness (L) fixed. Notice how the contrast ratio stays nearly constant — that's perceptual uniformity at work.
      </p>
    </div>
  </div>
</div>
