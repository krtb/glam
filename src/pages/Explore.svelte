<script>
  import { fade } from "svelte/transition";
  import Spinner from "udgl/LineSegSpinner.svelte";

  import Probe from "../components/Probe.svelte";
  import QuantileExplorerView from "../components/explore/QuantileExplorerView.svelte";
  import ProportionExplorerView from "../components/explore/ProportionExplorerView.svelte";
  import { store } from "../state/store";
  import { currentProbe } from "../state/telemetry-search";
  import { firefoxVersionMarkers } from '../state/product-versions';

  function handleBodySelectors(event) {
    const { selection, type } = event.detail;
    const field = {
      percentiles: "visiblePercentiles",
      timeHorizon: "timeHorizon",
      metricType: "proportionMetricType",
      activeBuckets: "activeBuckets"
    }[type];
    if (field) store.setField(field, selection);
  }
</script>

<Probe let:data let:temporaryViewTypeStore>
  <div in:fade class="graphic-body__content">
    {#if temporaryViewTypeStore === 'categorical'}
      <ProportionExplorerView
        markers={$firefoxVersionMarkers}
        data={data.data}
        probeType={`${$currentProbe.type}-${$currentProbe.kind}`}
        metricType={$store.proportionMetricType}
        activeBuckets={[...$store.activeBuckets]}
        timeHorizon={$store.timeHorizon}
        bucketOptions={data.bucketOptions}
        bucketColorMap={data.bucketColorMap}
        bucketSortOrder={data.bucketSortOrder}
        on:selection={handleBodySelectors}
        aggregationLevel={$store.aggregationLevel}>
        <h2>
          explore /
          <span>{$currentProbe.name}</span>
        </h2>
      </ProportionExplorerView>
    {:else if ['histogram', 'scalar'].includes(temporaryViewTypeStore)}
      <QuantileExplorerView
        markers={$firefoxVersionMarkers}
        data={data.data}
        probeType={temporaryViewTypeStore}
        timeHorizon={$store.timeHorizon}
        percentiles={$store.visiblePercentiles}
        on:selection={handleBodySelectors}
        aggregationLevel={$store.aggregationLevel}>
        <h2>
          explore /
          <span>{$currentProbe.name}</span>
        </h2>
      </QuantileExplorerView>
    {:else}
      <div class="graphic-body__content">
        <div style="width: 100%">
          <Spinner size={48} color={'var(--cool-gray-400)'} />
        </div>
      </div>
    {/if}
  </div>
</Probe>
