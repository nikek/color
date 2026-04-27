<script lang="ts">
  interface Props {
    color: string;
    size?: string;
    label?: string;
  }

  let { color, size = '4rem', label = '' }: Props = $props();
</script>

<div class="flex flex-col items-center gap-1">
  <div
    class="rounded-lg border border-border"
    style="background: {color}; width: {size}; height: {size};"
  ></div>
  {#if label}
    <span class="text-xs text-text-secondary">{label}</span>
  {/if}
</div>
