<script>
import { onMount } from 'svelte';

import App from 'udgl/layout/App.svelte';
import Toolbar from 'udgl/layout/Toolbar.svelte';
import Content from 'udgl/layout/Content.svelte';
import ContentHeader from 'udgl/layout/ContentHeader.svelte';
import ContentBody from 'udgl/layout/ContentBody.svelte';
import ContentFooter from 'udgl/layout/ContentFooter.svelte';

import MainSelectors from '../components/regions/MainSelectors.svelte';
import GLAMMark from '../components/regions/GLAMMark.svelte';
import Footer from '../components/regions/Footer.svelte';
import Search from '../components/search/Search.svelte';
import ProbeViewControl from '../components/controls/ProbeViewControl.svelte';
import ProbeDetails from '../components/regions/ProbeDetails.svelte';

import { currentQuery } from '../state/store';

export let section;

let visible = false;

function updateQueryString() {
  if (window.history.pushState) {
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${$currentQuery}`;
    window.history.pushState({ path: newurl }, '', newurl);
  }
}

$: if (visible) {
  updateQueryString($currentQuery);
}

onMount(() => { visible = true; });
</script>

<App>
  <Toolbar sticky>
    <GLAMMark />
    <Search />
    <MainSelectors />
  </Toolbar>
  <Content centered>
    <ContentHeader>
      {#if section === "probe"}
        <ProbeViewControl />
      {/if}
    </ContentHeader>
    <ContentBody>
      <div class="graphic-body">
        <slot></slot>
        {#if section === "probe"}
          <!-- Marking up the probe details here ensures that they don't
               re-animate when the user switches between the Explore page and
               the Table page -->
          <div class="graphic-body__details">
            <ProbeDetails />
          </div>
        {/if}
      </div>
    </ContentBody>
    <ContentFooter>
      <Footer />
    </ContentFooter>
  </Content>
</App>
