import { readable, derived, get } from 'svelte/store';
import FlexSearch from 'flexsearch';

import { createCatColorMap } from 'udgl/data-graphics/utils/color-maps';
import { createStore } from '../utils/create-store';

import { getProbeData } from './api';

import CONFIG from '../config.json';

// TODO: Make this dynamic based on prod vs local dev.
const probeURL = '__BASE_DOMAIN__/api/v1/probes/';

import { byKeyAndAggregation, getProbeViewType } from '../utils/probe-utils';


export function getField(fieldKey) {
  return CONFIG.fields[fieldKey];
}

export function getFieldValues(fieldKey) {
  return getField(fieldKey).values;
}

export function isField(fieldKey) {
  return Object.keys(CONFIG.fields).includes(fieldKey);
}

export function getFieldValueMetadata(fieldKey, valueKey) {
  return getFieldValues(fieldKey).find((v) => v.key === valueKey);
}

export function getFieldValueKey(fieldKey, valueKey) {
  const metadata = getFieldValueMetadata(fieldKey, valueKey);
  if (metadata && metadata.keyTransform) {
    if (metadata.keyTransform === 'NULL') { return null; }
  }
  return valueKey;
}

export function isValidFieldValue(fieldKey, valueKey) {
  const field = getField(fieldKey);
  if (field.skipValidation) return true;
  return getFieldValues(fieldKey).map((fv) => {
    // apply any key transforms that might need to happen.
    if (fv.keyTransform) {
      if (fv.keyTransform === 'NULL') return null;
    }
    return fv.key;
  }).includes(valueKey);
}

export function getFieldValueLabel(fieldKey, valueKey) {
  const metadata = getFieldValueMetadata(fieldKey, valueKey);
  return metadata ? metadata.label : undefined;
}

export function getDefaultFieldValue(fieldKey) {
  return getFieldValues(fieldKey)[0].key;
}

export function getFromQueryString(fieldKey, isMulti = false) {
  // const isMulti = getField(fieldKey).type === 'multi';
  const params = new URLSearchParams(window.location.search);
  const value = params.get(fieldKey);
  if (isMulti) {
    return JSON.parse(value);
  }
  return value;
}

export function getFromQueryStringOrDefault(fieldKey, isMulti = false) {
  const value = getFromQueryString(fieldKey, isMulti);
  if (!value) {
    return getDefaultFieldValue(fieldKey);
  }
  return value;
}

const initialState = {
  dashboardMode: { }, // FIXME: applicationStatus or dashboardMode, not both.
  aggregationLevel: getFromQueryStringOrDefault('aggregationLevel'),
  channel: getFromQueryStringOrDefault('channel'),
  os: getFromQueryString('os') || 'Windows',
  versions: getFromQueryString('versions', true) || [],
  searchIsActive: false,
  searchQuery: '',
  timeHorizon: getFromQueryString('timeHorizon') || 'MONTH',
  visiblePercentiles: getFromQueryString('visiblePercentiles', true) || [95, 75, 50, 25, 5],
  proportionMetricType: getFromQueryString('proportionMetricType') || 'proportions', //
  activeBuckets: getFromQueryString('activeBuckets', true) || [],
  applicationStatus: 'INITIALIZING', // FIXME: applicationStatus or dashboardMode, not both.
  url: window.location.href,
};

export const store = createStore(initialState);

store.reset = () => {
  const { token } = get(store);

  store.reinitialize();
  store.setField('token', token);
};

export const resetFilters = () => {
  store.setField('channel', getDefaultFieldValue('channel'));
  store.setField('os', getDefaultFieldValue('os'));
  store.setField('aggregationLevel', getDefaultFieldValue('aggregationLevel'));
};

export const URLComponents = derived(store, ($store) => {
  const url = new URL($store.url);
  const pathParts = url.pathname.split('/').filter((p) => p !== '');

  const components = {
    path: {
      section: pathParts[0],
    },
  };

  if (components.path.section === 'probe') {
    components.path.probe = {
      product: pathParts[1],
      name: pathParts[2],
      view: pathParts[3],
    };
  }

  components.search = url.search;

  return components;
});

export const probeSet = readable(undefined, async (set) => {
  const resp = await fetch(probeURL).then((r) => r.json());
  const data = Object.keys(resp.probes).map((key, i) => (
    { id: i, ...resp.probes[key] }
  ));
  set(data);
});

export const currentProbe = derived([probeSet, URLComponents], ([$probeSet, $URLComponents]) => {
  if (!$probeSet || $URLComponents.path.section !== 'probe') return undefined;
  return $probeSet.find((d) => d.name === $URLComponents.path.probe.name);
});

export const telemetrySearch = derived([probeSet, currentProbe], ([$probeSet, $currentProbe]) => {
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
  return search;
}, { loaded: false });

export const searchResults = derived(
  [telemetrySearch, store], ([$telemetrySearch, $store]) => {
    const $query = $store.searchQuery;
    let resultSet = [];
    if ($telemetrySearch.loaded) {
      resultSet = $telemetrySearch.search($query).map((r, searchID) => ({ ...r, searchID }));
    }
    return { results: resultSet, total: $telemetrySearch.length };
  },
);

export const hasDefaultControlFields = derived(store, ($store) => Object.values(CONFIG.fields)
  .every((field) => (!field.values || (field.skipValidation === true))
    || field.values[0].key === $store[field.key]));

// ///// probe querying infrastructure.

function getParamsForQueryString(obj) {
  return {
    versions: obj.versions,
    channel: obj.channel,
    os: obj.os,
    aggregationLevel: obj.aggregationLevel,
    timeHorizon: obj.timeHorizon,
    proportionMetricType: obj.proportionMetricType,
    activeBuckets: obj.activeBuckets,
    visiblePercentiles: obj.visiblePercentiles,
  };
}

function getParamsForDataAPI(storeValue, URLComponentsValue) {
  const channelValue = getFieldValueKey('channel', storeValue.channel);
  const osValue = getFieldValueKey('os', storeValue.os);
  const params = getParamsForQueryString(storeValue);
  delete params.timeHorizon;
  delete params.proportionMetricType;
  delete params.activeBuckets;
  delete params.visiblePercentiles;

  if (URLComponentsValue.path.section === 'probe') {
    params.probe = URLComponentsValue.path.probe.name;
  }

  params.os = osValue;
  params.channel = channelValue;
  return params;
}

const toQueryStringPair = (k, v) => {
  if (Array.isArray(v)) {
    return `${k}=${encodeURIComponent(JSON.stringify(v))}`;
  }
  return `${k}=${encodeURIComponent(v)}`;
};

function toQueryString(params) {
  const keys = Object.keys(params);
  keys.sort();
  return keys.map((k) => toQueryStringPair(k, params[k])).join('&');
}

function probeSelected(probeValue) {
  return probeValue !== undefined && probeValue !== 'null' && probeValue !== null;
}

function paramsAreValid(params) {
  return Object.entries(params)
    .filter(([k]) => isField(k))
    .every(([fieldKey, valueKey]) => isValidFieldValue(fieldKey, valueKey))
    && probeSelected(params.probe);
}


export const datasetResponse = (level, key, data) => ({ level, key, data });


// FIXME: let's remove this function. It's almost comically redundant.
export function responseToData(data, probeClass = 'quantile', probeType, aggregationMethod = 'build_id') {
  return byKeyAndAggregation(data, probeClass, aggregationMethod, { probeType }, { removeZeroes: probeType === 'histogram-enumerated' });
}

const makeSortOrder = (latest, which = 'counts') => (a, b) => {
  // get latest data point and see
  if (latest[which][a] < latest[which][b]) return 1;
  if (latest[which][a] >= latest[which][b]) return -1;
  return 0;
};

function latestDatapoint(tr) {
  const series = Object.values(Object.values(tr)[0])[0];
  // FIXME: this should be the last value, not the second to last
  return series[series.length - 1];
}

export function getBucketKeys(tr) {
  return Object.keys(latestDatapoint(tr).counts);
}

export function extractBucketMetadata(transformedData) {
  const etc = {};

  const options = getBucketKeys(transformedData);

  const cmpBuckets = getBucketKeys(transformedData);
  const sorter = makeSortOrder(latestDatapoint(transformedData));
  cmpBuckets.sort(sorter);
  const cmp = createCatColorMap(cmpBuckets);
  const initialBuckets = cmpBuckets.slice(0, 10);
  etc.bucketOptions = options;
  etc.bucketColorMap = cmp;
  etc.initialBuckets = initialBuckets;
  etc.bucketSortOrder = sorter;
  return etc;
}

// let's determine the probe type here
// so we can handle things accordingly.

// function probeTypeAndKind(probeTypeString) {
//   const [probeType, probeKind] = probeTypeString.split('-');
//   return { probeType, probeKind };
// }


export function isCategorical(probeType, probeKind) {
  return ((probeType === 'histogram' && probeKind === 'enumerated')
  || probeKind === 'categorical' || probeKind === 'flag' || probeKind === 'boolean');
}

export function fetchDataForGLAM(params) {
  return getProbeData(params, store.getState().token).then(
    (payload) => {
      // FIXME: this should not be reading from probeSet. The response is kind
      // of messed up, so once the API / data is fixed the response should
      // consume from payload.response[0].metric_type. Until then, however,
      // we'll have to use the probeSet values for the probeType and probeKind,
      // since they're more accurate than what is in
      // payload.response[0].metric_type.
      const st = get(store);
      const { aggregationLevel } = st;

      const {
        active: probeActive,
        type: probeType,
        kind: probeKind,
      } = get(currentProbe);

      if (!('response' in payload)) {
        const er = new Error('The data for this probe is unavailable.');
        if (!probeActive) er.moreInformation = 'This probe appears to be inactive, so it\'s possible we don\'t have data for it.';
        throw er;
      }

      return {
        data: responseToData(payload.response,
          isCategorical(probeType, probeKind) ? 'proportion' : 'quantile',
          `${probeType}-${probeKind}`, aggregationLevel),
        probeType,
        probeKind,
      };
    },
  );
}

function intersection(a, b) {
  const aSet = new Set(a);
  const bSet = new Set(b);
  return new Set(
    [...a].filter((x) => bSet.has(x)),
  );
}

export function updateStoreAfterDataIsReceived({ data }) {
  const probe = get(currentProbe);
  // THIS WILL BE FALSE BECAUSE WE HAVE NOT RECEIVED THE PROBE DATA YET.
  const viewType = getProbeViewType(probe.type, probe.kind);
  const isCategoricalTypeProbe = viewType === 'categorical';
  let etc = {};
  if (isCategoricalTypeProbe) {
    etc = extractBucketMetadata(data);
  }

  // if the proposed initial buckets have no overlap, reset activeBuckets.
  // if (st.activeBuckets.length === 0 || intersection(st.activeBuckets, etc.initialBuckets).size !== st.activeBuckets.length) {
  if (isCategoricalTypeProbe) store.setField('activeBuckets', etc.initialBuckets);
  // }
  // store.setField('applicationStatus', 'ACTIVE');
  return { data, viewType, ...etc };
}

const cache = {};
let previousQuery;

export const dataset = derived([store, probeSet, URLComponents], ([$store, $probeSet, $URLComponents], set) => {
  // FIXME: we have to check for whether probeSet is loaded before
  // moving on. This is because the data fetch does _not_ return
  // the proper information about probe types & kinds (specifically,
  // enumerated histograms are coded as linear in the demo data set).
  // This should be checked again once we have verified that the bug
  // in the demo data is fixed.
  if (!$probeSet) return;

  const params = getParamsForDataAPI($store, $URLComponents);
  const qs = toQueryString(params);

  // // invalid parameters, probe selected.
  if (!paramsAreValid(params) && $URLComponents.path.section === 'probe') {
    const message = datasetResponse('ERROR', 'INVALID_PARAMETERS');
    // store.setField('dashboardMode', message);
    return message;
  }

  // // no probe selected.
  if ($URLComponents.path.section !== 'probe') {
    const message = datasetResponse('INFO', 'DEFAULT_VIEW');
    // if ($store.dashboardMode.key !== 'DEFAULT_VIEW') {
    //   store.setField('dashboardMode', message);
    // }
    return message;
  }

  if (!(qs in cache)) {
    cache[qs] = fetchDataForGLAM(params, $store);
  }

  // compare the previousQuery to the current one.
  // if the actual query params have changed, let's update the
  // data set.
  if (previousQuery !== qs) {
    previousQuery = qs;
    set(cache[qs].then(updateStoreAfterDataIsReceived));
  }
});
