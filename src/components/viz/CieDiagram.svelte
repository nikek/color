<script lang="ts">
  import { onMount } from 'svelte';
  import { renderCieDiagram } from '../../lib/canvas-utils';

  let container: HTMLDivElement;
  let showSrgb = $state(true);
  let showP3 = $state(true);
  let showWavelengths = $state(false);
  let isP3Display = $state(false);
  let mounted = $state(false);

  onMount(() => {
    const mq = window.matchMedia('(color-gamut: p3)');
    isP3Display = mq.matches;
    mounted = true;

    const onChange = (e: MediaQueryListEvent) => { isP3Display = e.matches; };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });

  $effect(() => {
    if (!mounted || !container) return;
    // colorSpace is locked at context creation — replace canvas to switch
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    canvas.className = 'max-w-full rounded';
    container.replaceChildren(canvas);
    renderCieDiagram(canvas, { showSrgb, showP3, showWavelengths, isP3Display });
  });
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6 space-y-4">
  <div class="flex justify-center">
    <div bind:this={container}></div>
  </div>

  <div class="flex gap-4 justify-center">
    <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
      <input type="checkbox" bind:checked={showSrgb} class="accent-white" />
      sRGB
    </label>
    <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
      <input type="checkbox" bind:checked={showP3} class="accent-teal-400" />
      Display P3
    </label>
    <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
      <input type="checkbox" bind:checked={showWavelengths} />
      Wavelengths
    </label>
  </div>

  {#if !isP3Display && showP3}
    <p class="text-xs text-text-secondary text-center">
      Striped area shows colors outside sRGB — your display cannot fully reproduce them.
    </p>
  {/if}
</div>
