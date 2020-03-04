<script>
  import { tooltip } from "udgl/utils/tooltip";
  import Logo from "udgl/icons/GLAM.svelte";

  import { store, URLComponents } from "../../state/store";
</script>

<style>
  a {
    align-self: center;
    text-decoration: none;
  }
</style>

<a href={`/${$URLComponents.search}`} on:click={store.reset}>
  <h1>
    <Logo />
    <div
      use:tooltip={{ text: 'The Glean Aggregated Metrics Dashboard', distance: 16 }}>
      GLAM
    </div>
  </h1>
</a>
