<script>
  import page from "page";

  import Layout from "../components/Layout.svelte";
  import { store } from "../state/store";
  import { url } from "../state/url";

  // Pages
  import Home from "../pages/Home.svelte";
  import Explore from "../pages/Explore.svelte";
  import Table from "../pages/Table.svelte";


  let component;
  let section = "";

  function updateSection(context, next) {
    section = context.pathname.split("/")[1];
    next();
  }

  page(
    "/",
    updateSection,
    () => component = Home,
  );

  page(
    "/probe/:product/:name/explore",
    updateSection,
    () => component = Explore,
  );

  page(
    "/probe/:product/:name/table",
    updateSection,
    () => component = Table,
  );

  page.start();
</script>

{#if $store.token}
  <Layout section={section}>
    <svelte:component this={component} />
  </Layout>
{/if}
