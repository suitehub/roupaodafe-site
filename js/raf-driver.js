/* Driver híbrido de animação.
   O GSAP, o Lenis e o lazy-load das imagens dependem de rAF/visibilidade,
   que o navegador suspende em documentos ocultos (aba em segundo plano,
   painéis incorporados). Sem isso as animações travam e as fotos nunca
   carregam — aqui o rAF cai para um timer quando o documento fica oculto. */
(function () {
  var nativeRAF = window.requestAnimationFrame.bind(window);
  var nativeCAF = window.cancelAnimationFrame.bind(window);
  var hidden = document.visibilityState !== "visible";
  var seq = 0;
  var timers = {};
  var lastY = -1;

  window.requestAnimationFrame = function (cb) {
    if (!hidden) return nativeRAF(cb);
    var id = ++seq;
    timers[id] = window.setTimeout(function () {
      delete timers[id];
      cb(performance.now());
      /* Em documento oculto o navegador não dispara eventos de scroll
         (os "scroll steps" do rendering não rodam). Sem eles o
         ScrollTrigger e os listeners de rolagem nunca atualizam —
         então repropagamos quando a posição muda. */
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y !== lastY) {
        lastY = y;
        window.dispatchEvent(new Event("scroll"));
      }
    }, 16);
    return id;
  };

  window.cancelAnimationFrame = function (id) {
    if (timers[id] !== undefined) {
      window.clearTimeout(timers[id]);
      delete timers[id];
      return;
    }
    nativeCAF(id);
  };

  document.addEventListener("visibilitychange", function () {
    hidden = document.visibilityState !== "visible";
    if (!hidden && window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
})();
