<script>
  import page from "page";

  import Layout from "../components/Layout.svelte";
  import { store, URLComponents } from "../state/store";

  // Pages
  import Home from "../pages/Home.svelte";
  import Explore from "../pages/Explore.svelte";
  import Table from "../pages/Table.svelte";
  import NotFound from "../pages/NotFound.svelte";
  import { registerStoreURLUpdaters } from "../utils/routing";

  registerStoreURLUpdaters();

  let component;

  function redirectToHomepage(path) {
    page.redirect(path, "/");
  }

  page("/", () => component = Home);
  page("/probe/:product/:name/explore", () => component = Explore);
  page("/probe/:product/:name/table", () => component = Table);

  // Redirect partial routes to the homepage
  redirectToHomepage("/probe");
  redirectToHomepage("/probe/*");
  redirectToHomepage("/probe/*/*");

  page("*", () => component = NotFound);

  page.start();
</script>

{#if $store.token}
  <Layout>
    <svelte:component this={component} />
  </Layout>
{/if}
