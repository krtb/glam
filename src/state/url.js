import page from 'page';


/**
 * Get the specified part of the path. NOT zero-indexed. For example, given the
 * following URL:
 *
 *   https://www.example.com/credits/developers/hamilton
 *
 * the results would be:
 *
 *   pathPart(1) => "credits"
 *   pathPart(2) => "developers"
 *   pathPart(3) => "hamilton"
 */
export function pathPart(partNumber) {
  const parts = window.location.pathname.split('/').filter((p) => p !== '');
  return parts[partNumber - 1];
}

export const url = {
  path: {
    get section() {
      return pathPart(1);
    },
    probe: {
      get product() {
        if (pathPart(1) === 'probe') {
          return pathPart(2);
        }
        return undefined;
      },
      get name() {
        if (pathPart(1) === 'probe') {
          return pathPart(3);
        }
        return undefined;
      },
      get view() {
        if (pathPart(1) === 'probe') {
          return pathPart(4);
        }
        return undefined;
      },
    },
  },
  get query() {
    return window.location.search;
  },
};

export function probeURL({ product = 'firefox', name, view = 'explore' } = {}, preserveQuery = true) {
  let nextURL = `/probe/${product}/${name}/${view}`;
  if (preserveQuery) {
    nextURL += url.query;
  }
  return nextURL;
}

export function navigateToProbe(probeDetails, preserveQuery = true) {
  const nextURL = probeURL(probeDetails, preserveQuery);
  page(nextURL);
}
