<script lang="ts">
  interface Props {
    value: string;
  }

  let { value = $bindable() }: Props = $props();

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let v = input.value.replace(/[^0-9a-fA-F#]/g, '');
    if (!v.startsWith('#')) v = '#' + v;
    if (v.length <= 7) value = v;
  }
</script>

<label class="flex items-center gap-2">
  <span class="text-sm text-text-secondary">Hex</span>
  <input
    type="text"
    {value}
    oninput={handleInput}
    maxlength="7"
    class="w-24 rounded bg-surface-raised border border-border px-2 py-1 text-sm font-mono text-text-primary"
  />
</label>
