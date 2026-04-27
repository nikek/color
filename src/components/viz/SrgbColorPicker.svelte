<script lang="ts">
  import Slider from '../ui/Slider.svelte';
  import HexInput from '../ui/HexInput.svelte';
  import { rgbToHex, hexToRgb, srgbToOklch } from '../../lib/color';

  let r = $state(66);
  let g = $state(133);
  let b = $state(244);

  let hex = $derived(rgbToHex(r, g, b));
  let oklch = $derived(srgbToOklch(r, g, b));

  let hexInput = $state(rgbToHex(66, 133, 244));
  let hexFocused = $state(false);

  $effect(() => {
    if (!hexFocused) hexInput = hex;
  });

  function handleHexChange(newHex: string) {
    hexInput = newHex;
    if (/^#[0-9a-fA-F]{6}$/.test(newHex)) {
      const [nr, ng, nb] = hexToRgb(newHex);
      r = nr;
      g = ng;
      b = nb;
    }
  }
</script>

<div class="rounded-xl bg-surface-raised border border-border p-6 space-y-5">
  <div class="flex gap-6 items-start">
    <div
      class="w-28 h-28 rounded-lg border border-border shrink-0"
      style="background: {hex};"
    ></div>

    <div class="flex-1 space-y-3">
      <Slider label="R" max={255} bind:value={r} />
      <Slider label="G" max={255} bind:value={g} />
      <Slider label="B" max={255} bind:value={b} />
    </div>
  </div>

  <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
    <div>
      <HexInput
        value={hexInput}
        onfocus={() => hexFocused = true}
        onblur={() => { hexFocused = false; hexInput = hex; }}
        oninput={(e: Event) => handleHexChange((e.target as HTMLInputElement).value)}
      />
    </div>
    <div class="text-text-secondary">
      <span class="font-mono">rgb({r}, {g}, {b})</span>
    </div>
    <div class="text-text-secondary">
      <span class="font-mono">oklch({oklch.l.toFixed(2)} {oklch.c.toFixed(3)} {oklch.h.toFixed(0)})</span>
    </div>
  </div>
</div>
