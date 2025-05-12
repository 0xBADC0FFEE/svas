<script lang="ts" generics="T">
  import { LoaderCircle } from "@lucide/svelte";
  import type { Props } from "./Async";

  const {
    store,
    waiting,
    awaited,
    error,
    silent = false,
    class: classes,
  }: Props<T> = $props();
</script>

<div class={classes}>
  {#if $store === null}
    {#if waiting}
      {@render waiting()}
    {:else if !silent}
      <div class="w-full h-full flex justify-center items-center">
        <LoaderCircle class="animate-spin text-gray-400" />
      </div>
    {/if}
  {:else if $store instanceof Error}
    {#if error}
      {@render error($store)}
    {:else if !silent}
      <div class="w-full h-full flex justify-center items-center">
        Something went terribly wrong
      </div>
    {/if}
  {:else}
    {@render awaited($store)}
  {/if}
</div>
