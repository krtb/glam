import { readable, derived, get } from 'svelte/store';
import FlexSearch from 'flexsearch';
// FIXME: this dependency cycle is innocuous but we should fix it.
import { store } from './store'; // eslint-disable-line import/no-cycle
import { url } from './url';

// TODO: Make this dynamic based on prod vs local dev.
const probeURL = '__BASE_DOMAIN__/api/v1/probes/';

export const probeSet = readable(undefined, async (set) => {
  const resp = await fetch(probeURL).then((r) => r.json());
  const data = Object.keys(resp.probes).map((key, i) => (
    { id: i, ...resp.probes[key] }
  ));
  set(data);
});

export const currentProbe = derived(probeSet, ($probeSet) => {
  if (!$probeSet) return undefined;
  return $probeSet.find((d) => d.name === url.path.probe.name);
});

const telemetrySearch = derived(probeSet, ($probeSet) => {
  if (!$probeSet) return { loaded: false };

  const search = new FlexSearch({
    suggest: true,
    // encode: 'advanced',
    // tokenize: 'full',
    // threshold: 1,
    // resolution: 3,
    doc: {
      id: 'id',
      field: ['name', 'description', 'type'],
    },
  });
  search.add($probeSet);
  search.loaded = true;
  const probe = get(currentProbe);
  if (probe && probe.name) {
    const probeInfo = $probeSet.find((d) => d.name === probe.name);
    if (probeInfo) {
      store.setField('probe', probeInfo);
    }
  }
  return search;
}, { loaded: false });

export default telemetrySearch;
