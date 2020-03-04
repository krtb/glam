import { probeURL } from '../src/utils/routing';

function navigate(path) {
  window.history.pushState({}, '', path);
}

describe('Exported functions', () => {
  beforeAll(() => {
    navigate('/probe/firefox/gc_ms/table');
  });

  it('probeURL', () => {
    expect(probeURL({ name: 'different_probe' })).toEqual(
      '/probe/firefox/different_probe/explore'
    );
    expect(probeURL({ product: 'fenix', name: 'different_probe' })).toEqual(
      '/probe/fenix/different_probe/explore'
    );
    expect(
      probeURL({ product: 'fenix', name: 'different_probe', view: 'table' })
    ).toEqual('/probe/fenix/different_probe/table');
    expect(probeURL({ name: 'different_probe', view: 'table' })).toEqual(
      '/probe/firefox/different_probe/table'
    );
    expect(
      probeURL({
        product: 'firefox',
        name: 'different_probe',
        view: 'explore',
      }),
    ).toEqual('/probe/firefox/different_probe/explore');
    expect(
      probeURL({
        product: undefined,
        name: 'different_probe',
        view: undefined,
      }),
    ).toEqual('/probe/firefox/different_probe/explore');
  });
});
