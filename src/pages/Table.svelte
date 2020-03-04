<script>
  import { fade } from "svelte/transition";

  import Probe from "../components/Probe.svelte";
  import ProbeTableView from "../components/table/ProbeTableView.svelte";
  import { store, currentProbe } from "../state/store";
</script>

<Probe let:data let:temporaryViewTypeStore>
  <div class="graphic-body__content graphic-body__content--no-padding">
    <div in:fade>
      <!-- this conditional is a stopgap until we fix https://github.com/mozilla/glam/issues/206 -->
      {#if $currentProbe && $currentProbe.type}
        <ProbeTableView
          data={data.data}
          probeType={temporaryViewTypeStore}
          colorMap={data.bucketColorMap}
          visibleBuckets={[...$store.activeBuckets]}
          aggregationLevel={$store.aggregationLevel}>
          <h2 class="graphic-body__title--padding">
            table /
            <span>{$currentProbe.name}</span>
          </h2>
        </ProbeTableView>
      {/if}
    </div>
  </div>
</Probe>
