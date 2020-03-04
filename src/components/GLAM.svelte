<script>
  import page from "page";

  import Layout from "../components/Layout.svelte";
  import { store } from "../state/store";

  // Pages
  import Home from "../pages/Home.svelte";
  import Explore from "../pages/Explore.svelte";
  import Table from "../pages/Table.svelte";
  import NotFound from "../pages/NotFound.svelte";


  let component;
  let section = "";

  function updateSection(context, next) {
    section = context.pathname.split("/")[1];
    next();
  }

  function redirectToHomepage(path) {
    page.redirect(path, "/");
  }

  page("*", updateSection);
  page("/", () => component = Home);
  page("/probe/:probeProduct/:probeName/explore", () => component = Explore);
  page("/probe/:probeProduct/:probeName/table", () => component = Table);

  // Redirect partial routes to the homepage
  redirectToHomepage("/probe");
  redirectToHomepage("/probe/*");
  redirectToHomepage("/probe/*/*");

  page("*", () => component = NotFound);

  page.start();
</script>

{#if $store.token}
  <Layout section={section}>
    <svelte:component this={component} />
  </Layout>
{/if}
