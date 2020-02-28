import { url, pathPart, probeURL } from '../src/state/url';

function navigate(path) {
  window.history.pushState({}, '', path);
}

describe('Exported functions', () => {
  beforeAll(() => {
    navigate('/probe/firefox/gc_ms/table');
  });

  it('pathPart', () => {
    expect(pathPart(-1)).toBeUndefined();
    expect(pathPart(0)).toBeUndefined();
    expect(pathPart(1)).toEqual('probe');
    expect(pathPart(2)).toEqual('firefox');
    expect(pathPart(3)).toEqual('gc_ms');
    expect(pathPart(4)).toEqual('table');
    expect(pathPart(5)).toBeUndefined();
    expect(pathPart(6)).toBeUndefined();
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
        view: 'explore'
      })
    ).toEqual('/probe/firefox/different_probe/explore');
    expect(
      probeURL({
        product: undefined,
        name: 'different_probe',
        view: undefined
      })
    ).toEqual('/probe/firefox/different_probe/explore');
  });
});

describe('Path getters', () => {
  describe('General', () => {
    it('url.path.section', () => {
      navigate('/contact');
      expect(url.path.section).toEqual('contact');

      navigate('/probe/firefox/gc_ms/table');
      expect(url.path.section).toEqual('probe');

      navigate('/about/data/methodology');
      expect(url.path.section).toEqual('about');

      navigate('/');
      expect(url.path.section).toBeUndefined();
    });
  });

  describe('Probe', () => {
    describe('On a probe page', () => {
      beforeAll(() => {
        navigate('/probe/firefox/gc_ms/table');
      });

      it('url.path.probe.product', () => {
        expect(url.path.probe.product).toEqual('firefox');
      });

      it('url.path.probe.name', () => {
        expect(url.path.probe.name).toEqual('gc_ms');
      });

      it('url.path.probe.view', () => {
        expect(url.path.probe.view).toEqual('table');
      });
    });

    describe('On a non-probe page', () => {
      beforeAll(() => {
        navigate('/about/data/methodology');
      });

      it('url.path.probe.product', () => {
        expect(url.path.probe.product).toBeUndefined();
      });

      it('url.path.probe.name', () => {
        expect(url.path.probe.name).toBeUndefined();
      });

      it('url.path.probe.view', () => {
        expect(url.path.probe.view).toBeUndefined();
      });
    });
  });
});
