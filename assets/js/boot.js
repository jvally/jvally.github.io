/* Not deferred: marks the page as scripted before first paint so locked content never flashes.
   Without JavaScript neither class is added and the whole page is visible. */
document.documentElement.classList.add('js');
try {
  if (localStorage.getItem('vj:done') === '1') document.documentElement.classList.add('done');
} catch (e) { /* storage unavailable: start a fresh game */ }
