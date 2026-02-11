<script lang="ts" generics="T">
  import { LoaderCircle, RotateCcw } from "@lucide/svelte";
  import type { Props } from "./Async";

  const {
    store,
    waiting,
    awaited,
    error,
    silent = false,
  }: Props<T> = $props();
</script>

{#if $store === null}
  {#if waiting}
    {@render waiting()}
  {:else if !silent}
    <LoaderCircle class="animate-spin m-auto text-muted-foreground" />
  {/if}
{:else if $store instanceof Error}
  {#if error}
    {@render error($store)}
  {:else if !silent}
    <div class="m-auto flex flex-col items-center gap-4">
      <span class="text-destructive">Something went terribly wrong</span>
      <button
      class="p-4 border border-muted-foreground hover:bg-muted cursor-pointer rounded-md flex items-center gap-2"
      onclick={() => window.location.reload()}>
        <RotateCcw size={16} />
      </button>
    </div>
  {/if}
{:else}
  {@render awaited($store)}
{/if}
