<script lang="ts">
  interface Props {
    label: string;
    min?: number;
    max?: number;
    step?: number;
    value: number;
    trackStyle?: string;
  }

  let { label, min = 0, max = 255, step = 1, value = $bindable(), trackStyle = '' }: Props = $props();
</script>

<label class="flex items-center gap-3">
  <span class="w-8 text-sm text-text-secondary shrink-0">{label}</span>
  <input
    type="range"
    {min}
    {max}
    {step}
    bind:value
    class="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-accent"
    style={trackStyle}
  />
  <span class="w-12 text-sm text-right tabular-nums text-text-secondary">{value}</span>
</label>
