import page from 'page';

import { get } from 'svelte/store';
import { store, URLComponents } from '../state/store';


function updateStoreURL(url) {
  store.setField('url', url);
}

function makeAbsolute(path) {
  const currentURL = new URL(window.location.href);
  if (!path.startsWith(currentURL.origin)) {
    return `${currentURL.origin}${path}`;
  }
  return path;
}

// Inspired by https://stackoverflow.com/a/52809105/4297741
export function registerStoreURLUpdaters() {
  // Navigation
  window.history.pushState = ((f) => function pushState(...args) {
    const ret = f.apply(this, args);
    const state = args[0];
    updateStoreURL(makeAbsolute(state.path));
    window.dispatchEvent(new Event('pushstate'));
    return ret;
  })(window.history.pushState);

  // Back/Forward buttons
  window.addEventListener('popstate', (evt) => {
    updateStoreURL(makeAbsolute(evt.state.path));
  });
}

export function probeURL({ product = 'firefox', name, view = 'explore' } = {}, preserveQuery = true) {
  let nextURL = `/probe/${product}/${name}/${view}`;
  if (preserveQuery) {
    nextURL += get(URLComponents).search;
  }
  return nextURL;
}

export function navigateToProbe(probeDetails, preserveQuery = true) {
  const nextURL = probeURL(probeDetails, preserveQuery);
  page.show(nextURL);
}
