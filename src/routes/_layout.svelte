<script lang="ts">
  import { onMount } from "svelte";
  import Nav from "../components/Nav.svelte";

  export let segment: string;

  let theme = "g90"; // "white" | "g10" | "g80" | "g90" | "g100"
  onMount(() => {
    document.documentElement.setAttribute("theme", theme);
  });
</script>

<Nav {segment} />

<main>
  <slot />
</main>

<style global lang="scss">
  @import "../styles/global.scss";
  main {
    position: relative;
    max-width: 56em;
    background-color: white;
    padding: 2em;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
