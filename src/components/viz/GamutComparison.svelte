<script lang="ts">
  let isWideGamut = $state(false);

  import { onMount } from 'svelte';
  onMount(() => {
    isWideGamut = window.matchMedia('(color-gamut: p3)').matches;
  });

  const p3Colors = [
    { label: 'Vivid Red', p3: 'color(display-p3 1 0.1 0.1)', srgb: 'rgb(255, 26, 26)' },
    { label: 'Electric Green', p3: 'color(display-p3 0.2 1 0.2)', srgb: 'rgb(51, 255, 51)' },
    { label: 'Deep Cyan', p3: 'color(display-p3 0 0.9 0.95)', srgb: 'rgb(0, 230, 242)' },
    { label: 'Hot Pink', p3: 'color(display-p3 1 0.2 0.6)', srgb: 'rgb(255, 51, 153)' },
    { label: 'Bright Orange', p3: 'color(display-p3 1 0.55 0)', srgb: 'rgb(255, 140, 0)' },
    { label: 'Ultra Violet', p3: 'color(display-p3 0.5 0.1 1)', srgb: 'rgb(128, 26, 255)' },
  ];
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6 space-y-5">
  {#if isWideGamut}
    <p class="text-sm text-accent">Your display supports Display P3 — you can see the difference below.</p>
  {:else}
    <p class="text-sm text-text-secondary">Your display is sRGB — both columns will look identical. On a wide-gamut display, the P3 column would show more vivid colors.</p>
  {/if}

  <div class="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
    <span class="text-xs text-text-secondary font-medium">Display P3</span>
    <span class="text-xs text-text-secondary font-medium">sRGB fallback</span>
    <span></span>

    {#each p3Colors as { label, p3, srgb }}
      <div class="h-12 rounded border border-border" style="background: {p3};"></div>
      <div class="h-12 rounded border border-border" style="background: {srgb};"></div>
      <span class="text-xs text-text-secondary">{label}</span>
    {/each}
  </div>
</div>
