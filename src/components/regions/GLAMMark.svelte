<script>
  import { tooltip } from "udgl/utils/tooltip";
  import Logo from "udgl/icons/GLAM.svelte";

  import { store } from "../../state/store";
  import { url } from "../../state/url";
</script>

<style>
  a {
    align-self: center;
    text-decoration: none;
  }
</style>

<a href={`/${url.query}`} on:click={store.reset}>
  <h1>
    <Logo />
    <div
      use:tooltip={{ text: 'The Glean Aggregated Metrics Dashboard', distance: 16 }}>
      GLAM
    </div>
  </h1>
</a>
