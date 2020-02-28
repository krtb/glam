import GLAM from './components/GLAM.svelte';
import { authenticate } from './utils/auth';
import { store } from './state/store';

authenticate((token) => {
  store.setField('token', token);
});

const glam = new GLAM({
  target: document.body,
});

export default glam;
