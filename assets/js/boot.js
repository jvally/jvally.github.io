/* Runs before first paint (not deferred) so locked content never flashes.
   Without JavaScript the `game` class is never added and the whole page is visible. */
(function () {
  var root = document.documentElement;
  root.classList.add('game');
  try {
    if (window.localStorage.getItem('vj:done') === '1') root.classList.add('game-done');
  } catch (e) { /* storage unavailable: start a fresh game */ }
})();
