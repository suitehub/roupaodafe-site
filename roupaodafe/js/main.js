/* =============================================================
   ROUPÃO DA FÉ · SCROLLYTELLING
   GSAP + ScrollTrigger + Lenis (arquivos locais, sem CDN)
   Regras: estados iniciais sempre via JS (sem JS = conteúdo visível),
   movimento só com transform/opacity e prefers-reduced-motion respeitado.
   ============================================================= */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* =============================================================
     1. GALERIA (inject antes de medir qualquer coisa)
     ============================================================= */
  var galTrack = document.querySelector("[data-htrack-gallery]");
  if (galTrack) {
    var galHtml = "";
    for (var i = 1; i <= 16; i++) {
      var n = pad(i);
      galHtml +=
        '<div class="gal">' +
        '<figure><img src="assets/Imagem' +
        i +
        '.jpg" alt="História ' +
        n +
        ' do projeto Roupão da Fé" decoding="async"></figure>' +
        '<p class="gal__caption"><b>História ' +
        n +
        "</b><span>um recomeço</span></p>" +
        "</div>";
    }
    galTrack.innerHTML = galHtml;
  }

  /* =============================================================
     2. SCROLL SUAVE (Lenis)
     ============================================================= */
  var lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduced) {
    try {
      lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    } catch (err) {
      lenis = null;
    }
  }

  if (lenis) {
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) {
        lenis.raf(t);
        window.requestAnimationFrame(raf);
      })(0);
    }
  }

  function lockScroll(lock) {
    if (lenis) {
      if (lock) lenis.stop();
      else lenis.start();
    }
    document.body.style.overflow = lock ? "hidden" : "";
  }

  /* =============================================================
     3. SPLASH · ANIMAÇÃO DA LOGO
     A cruz entra com mola (estilo framer motion) e é revelada de baixo
     para cima dentro de uma máscara, enquanto um anel se fecha — o anel
     é o próprio indicador de carga. Depois a assinatura entra em
     cascata, o conjunto dissolve e o pano creme sobe revelando o herói.
     ============================================================= */
  var preloader = document.getElementById("preloader");
  var preCount = document.getElementById("preCount");
  var preBar = document.getElementById("preBar");
  var preloaderDone = false;
  var introStarted = false;

  var splashRing = preloader ? preloader.querySelector("[data-splash-ring]") : null;
  var splashRingLen = 0;
  if (splashRing) {
    splashRingLen = 2 * Math.PI * Number(splashRing.getAttribute("r") || 0);
    splashRing.setAttribute("stroke-dasharray", splashRingLen.toFixed(2));
    splashRing.setAttribute("stroke-dashoffset", splashRingLen.toFixed(2));
  }

  function setCount(v) {
    if (preCount) preCount.textContent = String(v);
    if (preBar) preBar.style.transform = "scaleX(" + v / 100 + ")";
    /* o anel fecha conforme a carga avança */
    if (splashRing) {
      splashRing.setAttribute("stroke-dashoffset", (splashRingLen * (1 - v / 100)).toFixed(2));
    }
  }

  function runIntro() {
    if (introStarted) return;
    introStarted = true;
    if (!hasGsap || reduced) return;

    var hero = document.querySelector(".hero");
    if (!hero) return;

    /* O herói é só a imagem: ela entra inteira — sem zoom, sem nada
       cortado — apenas com um fundão suave. */
    var tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(".hero__bg-img", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.5 }, 0);
    tl.fromTo(".hero__bg-blur", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 1.8 }, 0);
  }

  function finishPreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    if (preloader) preloader.classList.add("is-done");
    /* limpa as molas do splash: nada fica rodando escondido */
    if (hasGsap && preloader) gsap.killTweensOf(preloader.querySelectorAll("*"));
    lockScroll(false);
    runIntro();
    /* a trilha entra junto com a página */
    iniciarMusica();
    if (hasGsap) ScrollTrigger.refresh();
  }

  /* ---------- splash: elementos e tempos ---------- */
  function splashEls() {
    return {
      halo: preloader.querySelector("[data-splash-halo]"),
      anel: preloader.querySelector("[data-splash-ring-wrap]"),
      marca: preloader.querySelector(".splash__mark"),
      corte: preloader.querySelector("[data-splash-clip]"),
      letras: preloader.querySelectorAll("[data-splash-ltr]"),
      tag: preloader.querySelectorAll("[data-splash-tag]"),
      contador: preloader.querySelector("[data-splash-count]"),
    };
  }

  /* entrada (≈1,7 s): mola no conjunto, máscara na cruz, cascata nas letras */
  function splashIn() {
    var el = splashEls();
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (el.halo) {
      tl.fromTo(
        el.halo,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out" },
        0,
      );
    }

    if (el.anel) {
      tl.fromTo(el.anel, { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9 }, 0.1);
    }

    if (el.marca) {
      tl.fromTo(
        el.marca,
        { scale: 0.82, y: 18, opacity: 0, filter: "blur(14px)" },
        { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "back.out(1.9)" },
        0.16,
      );
    }

    if (el.corte) {
      tl.fromTo(
        el.corte,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "power3.inOut" },
        0.3,
      );
    }

    if (el.letras.length) {
      tl.fromTo(
        el.letras,
        { y: 34, opacity: 0, filter: "blur(9px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.85, ease: "back.out(1.7)", stagger: 0.032 },
        0.5,
      );
    }

    if (el.tag.length) {
      tl.fromTo(
        el.tag,
        { y: 14, opacity: 0, filter: "blur(6px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.72, stagger: 0.06 },
        0.95,
      );
    }

    if (el.contador) {
      tl.fromTo(el.contador, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.85);
    }

    /* o halo respira enquanto a página carrega */
    if (el.halo) {
      tl.add(function () {
        gsap.to(el.halo, {
          scale: 1.08,
          opacity: 0.6,
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, 0.95);
    }

    return tl;
  }

  /* saída: o conjunto dissolve e, em seguida, o pano sobe */
  function splashOut() {
    var el = splashEls();
    var tl = gsap.timeline();

    /* o halo respira em loop infinito: matar só na hora da saída (matar na
       construção também derrubaria a entrada dele) e dissolver */
    tl.add(function () {
      if (!el.halo) return;
      gsap.killTweensOf(el.halo);
      gsap.to(el.halo, { scale: 1.4, opacity: 0, duration: 0.8, ease: "power2.in" });
    }, 0);

    if (el.letras.length) {
      tl.to(
        el.letras,
        { y: -30, opacity: 0, filter: "blur(8px)", duration: 0.5, stagger: 0.028, ease: "power2.in" },
        0,
      );
    }
    if (el.tag.length) {
      tl.to(el.tag, { y: -12, opacity: 0, duration: 0.4, stagger: 0.03, ease: "power2.in" }, 0.02);
    }
    if (el.contador) tl.to(el.contador, { y: 10, opacity: 0, duration: 0.4, ease: "power2.in" }, 0);
    if (el.anel) tl.to(el.anel, { scale: 1.12, opacity: 0, duration: 0.65, ease: "power2.in" }, 0.05);
    if (el.marca) {
      tl.to(
        el.marca,
        { scale: 1.08, opacity: 0, filter: "blur(10px)", duration: 0.65, ease: "power2.in" },
        0.05,
      );
    }

    tl.to(
      preloader,
      { yPercent: -101, duration: 0.95, ease: "power4.inOut", onStart: runIntro },
      0.24,
    );
    tl.add(finishPreloader);

    return tl;
  }

  function startPreloader() {
    if (!preloader) {
      finishPreloader();
      return;
    }

    lockScroll(true);

    /* trava de segurança: nunca prender a página (mesmo se a animação falhar) */
    window.setTimeout(finishPreloader, 6500);

    if (reduced) {
      setCount(100);
      finishPreloader();
      return;
    }

    if (hasGsap) {
      var linha = gsap.timeline();
      linha.add(splashIn(), 0);

      /* carga: de 0 a 100 enquanto a entrada termina (o anel se fecha) */
      var carga = { v: 0 };
      linha.to(
        carga,
        {
          v: 100,
          duration: 1.45,
          ease: "power2.inOut",
          onUpdate: function () {
            setCount(Math.round(carga.v));
          },
        },
        0.4,
      );

      /* a saída começa junto com o fim da carga (o pano sobe por volta de 2 s) */
      linha.add(splashOut(), ">-0.15");
    } else {
      /* sem GSAP: a logo aparece parada, o contador anda e o pano sobe por transição */
      preloader.classList.add("is-static");
      var v = 0;
      var iv = window.setInterval(function () {
        v = Math.min(100, v + 7);
        setCount(v);
        if (v >= 100) {
          window.clearInterval(iv);
          preloader.classList.add("is-leaving");
          window.setTimeout(finishPreloader, 950);
        }
      }, 45);
    }
  }

  /* =============================================================
     3.1 MÚSICA DE FUNDO
     A trilha entra assim que o pano do splash sobe. Como o navegador só
     libera som depois de um gesto, a primeira interação (toque, clique,
     tecla) também tenta tocar. O botão do canto liga/muta com suavidade
     e o vídeo em tela cheia assume o som: silencia enquanto está aberto e
     devolve depois — respeitando sempre a escolha de quem mutou.
     ============================================================= */
  var trilha = document.getElementById("trilha");
  var trilhaBtn = document.getElementById("trilhaBtn");
  var musicaVolume = 0.4;
  var musicaLigada = true; /* vontade de quem está vendo */
  var musicaSuspensa = false; /* silêncio temporário (vídeo aberto) */
  var musicaAudivel = false; /* som saindo de fato agora */
  var gestosMusica = ["pointerdown", "keydown", "touchstart", "wheel"];

  if (trilha) {
    /* nasce mudo: a entrada é sempre suave */
    trilha.volume = 0;
    trilha.muted = false;
  }

  function musicaAtiva() {
    return musicaAudivel && musicaLigada && !musicaSuspensa;
  }

  function pintarMusica() {
    if (!trilhaBtn) return;
    var ativa = musicaAtiva();
    trilhaBtn.classList.toggle("is-on", ativa);
    trilhaBtn.classList.toggle("is-off", !ativa);
    trilhaBtn.setAttribute("aria-pressed", ativa ? "true" : "false");
    trilhaBtn.setAttribute("title", ativa ? "Mutar música" : "Ligar música");
  }

  function volumeMusica(alvo, dur) {
    if (!trilha) return;
    if (hasGsap) {
      gsap.to(trilha, { volume: alvo, duration: dur, ease: "power2.out", overwrite: true });
    } else {
      trilha.volume = alvo;
    }
  }

  function tirarGestosMusica() {
    gestosMusica.forEach(function (ev) {
      window.removeEventListener(ev, primeiroGestoMusica, { capture: true });
    });
  }

  function podeTocarMusica() {
    return !!trilha && musicaLigada && !musicaSuspensa;
  }

  /* toca (do zero ou retomando de onde parou) subindo o volume */
  function tocarMusica(dur) {
    if (!podeTocarMusica()) return;
    var entrada = typeof dur === "number" ? dur : 2.2;

    if (!trilha.paused) {
      musicaAudivel = true;
      volumeMusica(musicaVolume, entrada);
      pintarMusica();
      return;
    }

    var promessa = null;
    try {
      promessa = trilha.play();
    } catch (err) {
      pintarMusica();
      return;
    }

    if (promessa && promessa.then) {
      promessa
        .then(function () {
          musicaAudivel = true;
          volumeMusica(musicaVolume, entrada);
          pintarMusica();
          tirarGestosMusica();
          anunciarTrilha();
        })
        .catch(function () {
          /* sem autorização ainda: o primeiro gesto tenta de novo */
          musicaAudivel = false;
          pintarMusica();
        });
    } else {
      musicaAudivel = true;
      volumeMusica(musicaVolume, entrada);
      pintarMusica();
      tirarGestosMusica();
      anunciarTrilha();
    }
  }

  /* desce o volume e só então pausa (se ninguém tiver religado) */
  function silenciarMusica(dur) {
    if (!trilha) return;
    var saida = typeof dur === "number" ? dur : 0.3;
    musicaAudivel = false;
    pintarMusica();

    if (hasGsap) {
      gsap.to(trilha, {
        volume: 0,
        duration: saida,
        ease: "power2.out",
        overwrite: true,
        onComplete: function () {
          if (trilha && !podeTocarMusica()) trilha.pause();
        },
      });
    } else {
      trilha.volume = 0;
      trilha.pause();
    }
  }

  function primeiroGestoMusica(e) {
    /* o clique no próprio botão não conta: ele decide o contrário */
    if (trilhaBtn && e && e.target && trilhaBtn.contains(e.target)) return;
    if (!trilha || !trilha.paused || !musicaLigada || musicaSuspensa) return;
    tocarMusica(1.8);
  }

  function iniciarMusica() {
    pintarMusica();
    /* tenta já na saída do splash; se o navegador barrar, o primeiro
       gesto de quem visita resolve */
    tocarMusica(2.4);
    gestosMusica.forEach(function (ev) {
      window.addEventListener(ev, primeiroGestoMusica, { capture: true, passive: true });
    });
  }

  /* o vídeo em tela cheia manda no som */
  function suspenderMusica() {
    musicaSuspensa = true;
    silenciarMusica(0.28);
  }

  function retomarMusica() {
    musicaSuspensa = false;
    if (musicaLigada) tocarMusica(0.9);
    else pintarMusica();
  }

  if (trilhaBtn) {
    trilhaBtn.addEventListener("click", function () {
      if (musicaAtiva()) {
        musicaLigada = false;
        silenciarMusica(0.35);
      } else {
        musicaLigada = true;
        tocarMusica(0.9);
      }
      pintarMusica();
    });
  }

  /* ---------- o texto que sai do próprio botão ---------- */
  var trilhaTexto = trilhaBtn ? trilhaBtn.querySelector("[data-trilha-texto]") : null;
  var trilhaPill = trilhaBtn ? trilhaBtn.querySelector(".trilha__pill") : null;
  var trilhaTitulo = trilhaBtn ? trilhaBtn.querySelector("[data-trilha-titulo]") : null;
  var trilhaAviso = trilhaBtn ? trilhaBtn.querySelector("[data-trilha-aviso]") : null;
  var trilhaStatus = trilhaBtn ? trilhaBtn.querySelector("[data-trilha-status]") : null;
  var avisoAberto = false;
  var anunciouTrilha = false;
  var timerAviso = null;
  var AVISO_MS = 5000;

  /* quantos pixels cabem ao lado da bolinha sem encostar na borda */
  function trilhaDisponivel() {
    if (!trilhaBtn) return 240;
    var disco = trilhaBtn.querySelector(".trilha__disc");
    var caixa = (disco || trilhaBtn).getBoundingClientRect();
    return Math.max(150, Math.round(window.innerWidth - caixa.right - 18));
  }

  /* abre a moldura com a largura exata da frase — assim não sobra
     área invisível de clique e a frase volta inteira para o botão */
  function mostrarTrilhaTexto(qual) {
    if (!trilhaTexto || !trilhaPill || !trilhaTitulo || !trilhaAviso) return;
    trilhaTitulo.style.display = qual === "titulo" ? "block" : "none";
    trilhaAviso.style.display = qual === "aviso" ? "block" : "none";

    trilhaPill.style.whiteSpace = "nowrap";
    trilhaPill.style.width = "max-content";
    var natural = Math.ceil(trilhaPill.getBoundingClientRect().width);
    var limite = trilhaDisponivel();
    var largura = Math.min(natural, limite);

    /* se não couber numa linha, a frase quebra em duas e a largura trava */
    trilhaPill.style.whiteSpace = natural > limite ? "normal" : "nowrap";
    trilhaPill.style.width = largura + "px";
    trilhaTexto.style.maxWidth = largura + "px";
    trilhaBtn.classList.add("is-aberto");
  }

  function esconderTrilhaTexto() {
    if (!trilhaTexto || !trilhaBtn) return;
    trilhaTexto.style.maxWidth = "0px";
    trilhaBtn.classList.remove("is-aberto");
  }

  /* o aviso que aparece sozinho depois do splash: 5 s na tela e volta */
  function mostrarAvisoTrilha() {
    if (!trilhaBtn || musicaSuspensa) {
      /* se o vídeo entrou na frente, o aviso fica para a próxima */
      anunciouTrilha = false;
      return;
    }
    avisoAberto = true;
    mostrarTrilhaTexto("aviso");
    if (trilhaStatus) {
      trilhaStatus.textContent =
        "Tocando Canto de Vitória, do Quarteto JASD. Use o botão para silenciar a música.";
    }
    if (timerAviso) window.clearTimeout(timerAviso);
    timerAviso = window.setTimeout(function () {
      timerAviso = null;
      avisoAberto = false;
      esconderTrilhaTexto();
    }, AVISO_MS);
  }

  function anunciarTrilha() {
    if (anunciouTrilha || !trilhaBtn) return;
    anunciouTrilha = true;
    /* um respiro para o pano do splash terminar de subir */
    window.setTimeout(mostrarAvisoTrilha, 650);
  }

  /* no hover (e no foco) a faixa que está tocando sai do botão.
     Só vale para quem tem ponteiro: no toque o aviso já conta tudo. */
  if (trilhaBtn && window.matchMedia("(hover: hover)").matches) {
    trilhaBtn.addEventListener("mouseenter", function () {
      if (!avisoAberto) mostrarTrilhaTexto("titulo");
    });
    trilhaBtn.addEventListener("mouseleave", function () {
      if (!avisoAberto) esconderTrilhaTexto();
    });
    trilhaBtn.addEventListener("focus", function () {
      /* só no foco pelo teclado: depois de um clique o texto não fica preso */
      if (!avisoAberto && trilhaBtn.matches(":focus-visible")) mostrarTrilhaTexto("titulo");
    });
    trilhaBtn.addEventListener("blur", function () {
      if (!avisoAberto) esconderTrilhaTexto();
    });
  }

  window.addEventListener("resize", function () {
    /* girar o celular com o aviso na tela: mede de novo */
    if (avisoAberto) mostrarTrilhaTexto("aviso");
  });

  /* =============================================================
     4. MENU MOBILE
     ============================================================= */
  var menu = document.getElementById("menu");
  var menuToggle = document.getElementById("menuToggle");
  var menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    if (menu) {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    }
    if (menuToggle) menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    docEl.classList.toggle("menu-open", open);
    lockScroll(open);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menuOpen);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) setMenu(false);
  });

  /* =============================================================
     5. ÂNCORAS (passam pelo Lenis quando disponível)
     ============================================================= */
  function headerOffset() {
    var h = document.getElementById("header");
    return h && !h.classList.contains("is-hidden") ? h.offsetHeight : 0;
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#") {
      e.preventDefault();
      return;
    }
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);

    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset() + 1;
    if (lenis) {
      lenis.scrollTo(top, { duration: 1.5, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    } else {
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    }
  });

  /* =============================================================
     6. HEADER · BARRA DE PROGRESSO · TRILHA DE CAPÍTULOS
     ============================================================= */
  var header = document.getElementById("header");
  var topFill = document.getElementById("topbarFill");
  var railFill = document.getElementById("railFill");
  var lastY = window.pageYOffset || 0;

  function onScroll() {
    var y = window.pageYOffset || docEl.scrollTop || 0;
    var max = Math.max(1, docEl.scrollHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, y / max));

    if (topFill) topFill.style.transform = "scaleX(" + p + ")";
    if (railFill) railFill.style.transform = "scaleY(" + p + ")";

    if (header) {
      header.classList.toggle("is-scrolled", y > 24);
      if (!menuOpen && preloaderDone) {
        if (y > lastY + 3 && y > 170) header.classList.add("is-hidden");
        else if (y < lastY - 3 || y < 120) header.classList.remove("is-hidden");
      }
      lastY = y;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* =============================================================
     7. TEXTO DIVIDIDO (palavras com máscara)
     ============================================================= */
  function splitWords(el) {
    if (el.getAttribute("data-split-done")) return [];
    var words = [];

    function build(node, isEm) {
      var frag = document.createDocumentFragment();
      Array.prototype.forEach.call(node.childNodes, function (child) {
        if (child.nodeType === 3) {
          var tokens = child.textContent.split(/(\s+)/);
          tokens.forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            var w = document.createElement("span");
            w.className = "word" + (isEm ? " word--em" : "");
            var inner = document.createElement("span");
            inner.className = "word__inner";
            inner.textContent = tok;
            w.appendChild(inner);
            frag.appendChild(w);
            words.push(inner);
          });
        } else if (child.nodeType === 1) {
          if (child.tagName === "BR") {
            frag.appendChild(document.createElement("br"));
            return;
          }
          /* a palavra viva do símbolo entra inteira numa máscara só (ela
             troca de texto com a rolagem), mas guarda a marca para o JS
             encontrá-la depois do split */
          if (child.hasAttribute && child.hasAttribute("data-simbolo-palavra")) {
            var vivo = document.createElement("span");
            vivo.className = "word word--em simbolo__palavra";
            vivo.setAttribute("data-simbolo-palavra", "");
            var dentro = document.createElement("span");
            dentro.className = "word__inner";
            dentro.textContent = child.textContent;
            vivo.appendChild(dentro);
            frag.appendChild(vivo);
            words.push(dentro);
            return;
          }
          var em = isEm || child.tagName === "EM";
          frag.appendChild(build(child, em));
        }
      });
      return frag;
    }

    el.setAttribute("aria-label", "");
    var frag = build(el, false);
    el.textContent = "";
    el.appendChild(frag);
    el.setAttribute(
      "aria-label",
      words
        .map(function (w) {
          return w.textContent;
        })
        .join(" "),
    );
    el.setAttribute("data-split-done", "1");
    return words;
  }

  /* =============================================================
     8. ANIMAÇÕES DE ROLAGEM
     ============================================================= */
  function setupScrollAnimations() {
    if (!hasGsap || reduced) return;

    /* títulos divididos (o herói entra pelo pré-carregador, sem trigger) */
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var words = splitWords(el);
      if (!words.length || el.closest(".hero")) return;
      gsap.from(words, {
        yPercent: 112,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    /* revelações simples */
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.from(el, {
        autoAlpha: 0,
        y: 36,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    /* parallax de fundos */
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-parallax")) || 40;
      var section = el.parentElement || el;
      gsap.fromTo(
        el,
        { y: -d },
        {
          y: d,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });

    /* contador 38 mil */
    var stat = document.getElementById("statCount");
    if (stat) {
      var target = parseInt(stat.textContent, 10) || 38;
      var obj = { v: 0 };
      stat.textContent = "0";
      ScrollTrigger.create({
        trigger: stat,
        start: "top 88%",
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            v: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: function () {
              stat.textContent = String(Math.round(obj.v));
            },
          });
        },
      });
    }

    /* trilha de capítulos ativa */
    document.querySelectorAll("[data-chapter]").forEach(function (sec) {
      var id = sec.getAttribute("data-chapter");
      var item = document.querySelector('.rail__item[data-rail="' + id + '"]');
      if (!item) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: function (self) {
          item.classList.toggle("is-active", self.isActive);
        },
      });
    });
  }

  /* =============================================================
     9. CENA 01 · PASSOS COM VISUAL FIXO
     Cada seção de passos (a história e o quarteto) tem o seu próprio
     conjunto: os gatilhos e o contador são resolvidos dentro da seção,
     senão um capítulo ativaria os passos do outro.
     ============================================================= */
  function setupSteps() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(".steps"));
    if (!sections.length) return;

    sections.forEach(function (section) {
      var steps = Array.prototype.slice.call(section.querySelectorAll(".step[data-step]"));
      if (!steps.length) return;
      var shots = Array.prototype.slice.call(section.querySelectorAll(".shot[data-visual]"));
      var counter = section.querySelector("[data-visual-count]");

      function activate(idx) {
        steps.forEach(function (s, n) {
          s.classList.toggle("is-active", n === idx);
        });
        shots.forEach(function (s, n) {
          /* com um único visual (o quarteto) ele fica sempre visível */
          if (shots.length === 1) {
            s.classList.add("is-active");
            return;
          }
          s.classList.toggle("is-active", n === idx);
        });
        if (counter) counter.textContent = pad(idx + 1);
      }

      activate(0);

      if (!hasGsap || reduced) return;

      steps.forEach(function (step, idx) {
        ScrollTrigger.create({
          trigger: step,
          start: "top 65%",
          end: "bottom 65%",
          onToggle: function (self) {
            if (self.isActive) activate(idx);
          },
        });
      });
    });
  }

  /* =============================================================
     10. CENA 03 · FASES (17 etapas em 4 grupos)
     ============================================================= */
  function setupPhases() {
    var section = document.querySelector("[data-phase-scene]");
    if (!section) return;
    var phases = Array.prototype.slice.call(section.querySelectorAll(".phase"));
    var dots = Array.prototype.slice.call(section.querySelectorAll(".phases__dots i"));
    var count = section.querySelector("[data-phase-current]");
    var current = -1;

    function setPhase(i) {
      if (i === current) return;
      current = i;
      phases.forEach(function (p, n) {
        p.classList.toggle("is-active", n === i);
      });
      dots.forEach(function (d, n) {
        d.classList.toggle("is-active", n === i);
      });
      if (count) count.textContent = pad(i + 1);
    }

    setPhase(0);

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: function (self) {
        var i = Math.floor(self.progress * phases.length);
        if (i >= phases.length) i = phases.length - 1;
        setPhase(i);
      },
    });
  }

  /* =============================================================
     11. CENAS HORIZONTAIS (02 símbolo · 04 histórias)
     Montadas no boot (seção 15), depois do pin do batismo, para os
     gatilhos nascerem já com o espaçamento certo no documento.
     ============================================================= */
  function setupHorizontal(viewport) {
    var track = viewport.querySelector("[data-htrack]");
    if (!track) return;
    var bar = viewport.querySelector("[data-hprogress]");

    function distance() {
      return Math.max(1, track.scrollWidth - window.innerWidth);
    }

    gsap.to(track, {
      x: function () {
        return -distance();
      },
      ease: "none",
      scrollTrigger: {
        trigger: viewport,
        start: "top top",
        end: function () {
          return "+=" + (distance() + window.innerHeight * 0.35);
        },
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (bar) bar.style.transform = "scaleX(" + self.progress + ")";
        },
      },
    });
  }

  /* =============================================================
     11.1 A PALAVRA VIVA DO SÍMBOLO
     "…um símbolo de esperança." guarda a última palavra num slot de
     largura fixa (a maior delas, medida em "em" para valer em qualquer
     tela): conforme os blocos atravessam a cena, a palavra troca de texto
     entrando pela mesma máscara da revelação do título — a nova surge de
     baixo, a antiga sai por cima — sem deslocar nada ao redor.
     ============================================================= */
  function setupSimboloPalavra() {
    var marca = document.querySelector("[data-simbolo-palavra]");
    if (!marca) return;
    var viewport = marca.closest("[data-hscene]");
    if (!viewport) return;
    var atual = marca.querySelector(".word__inner") || marca;
    var blocos = [].slice.call(viewport.querySelectorAll(".panel"));
    if (!blocos.length) return;

    /* a palavra de cada bloco é o próprio h3; o convite final ("Fazer parte
       começa com um gesto.") não é uma palavra só e mantém a anterior */
    var palavras = [];
    var anterior = atual.textContent.trim();
    blocos.forEach(function (bloco) {
      var h3 = bloco.querySelector("h3");
      var texto = (bloco.getAttribute("data-palavra") || (h3 ? h3.textContent : "")).trim();
      if (texto && texto.indexOf(" ") === -1) {
        texto = texto.charAt(0).toLowerCase() + texto.slice(1);
        anterior = /\.$/.test(texto) ? texto : texto + ".";
      }
      palavras.push(anterior);
    });

    var entrando = null; /* clone que está entrando na máscara, se houver */
    var alvo = null; /* palavra que está chegando */

    /* troca o texto dentro da própria máscara, com a mesma entrada da
       revelação do título (de baixo para cima, "power4.out") */
    function trocar(palavra) {
      if (!palavra || palavra === atual.textContent) return;
      var animar = hasGsap && !reduced && atual !== marca && !!marca.querySelector(".word__inner");

      if (entrando) {
        /* o que estava no ar chega ao fim na hora, sem pular palavra */
        if (animar) gsap.killTweensOf([entrando, atual]);
        atual.textContent = alvo;
        if (entrando.parentNode) entrando.parentNode.removeChild(entrando);
        entrando = null;
        alvo = null;
        if (atual.textContent === palavra) return;
      }

      if (!animar) {
        atual.textContent = palavra;
        return;
      }

      /* se a revelação do título ainda estiver no ar neste elemento,
         ela sai de cena: a troca assume o comando dele */
      gsap.killTweensOf(atual);

      var novo = atual.cloneNode(true);
      novo.removeAttribute("style");
      novo.textContent = palavra;
      novo.classList.add("simbolo__entra");
      marca.appendChild(novo);
      entrando = novo;
      alvo = palavra;

      gsap.fromTo(novo, { yPercent: 112 }, { yPercent: 0, duration: 0.62, ease: "power4.out" });
      gsap.to(atual, {
        yPercent: -112,
        duration: 0.62,
        ease: "power4.out",
        onComplete: function () {
          if (entrando !== novo) return;
          gsap.set(atual, { clearProps: "transform" });
          atual.textContent = palavra;
          if (novo.parentNode) novo.parentNode.removeChild(novo);
          entrando = null;
          alvo = null;
        },
      });
    }

    /* o slot fica do tamanho da maior palavra — assim o título nunca se
       remonta quando a palavra muda; a medida sai em "em" (razão entre a
       largura e o tamanho da fonte), então vale em qualquer tela. A régua é
       uma sonda fora da tela, para não mexer no que está aparecendo. */
    function medirSlot() {
      var voz = getComputedStyle(atual);
      var sonda = document.createElement("span");
      sonda.setAttribute("aria-hidden", "true");
      sonda.style.position = "absolute";
      sonda.style.left = "-9999px";
      sonda.style.top = "0";
      sonda.style.visibility = "hidden";
      sonda.style.whiteSpace = "nowrap";
      sonda.style.fontFamily = voz.fontFamily;
      sonda.style.fontSize = voz.fontSize;
      sonda.style.fontStyle = voz.fontStyle;
      sonda.style.fontWeight = voz.fontWeight;
      sonda.style.letterSpacing = voz.letterSpacing;
      document.body.appendChild(sonda);
      var tamanho = parseFloat(voz.fontSize) || 16;
      var maior = 0;
      palavras.forEach(function (t) {
        sonda.textContent = t;
        maior = Math.max(maior, sonda.getBoundingClientRect().width);
      });
      if (sonda.parentNode) sonda.parentNode.removeChild(sonda);
      marca.style.width = ((maior + 1.2) / tamanho).toFixed(3) + "em";
    }

    /* com ou sem máscara (movimento reduzido), a palavra inicial é a do
       primeiro bloco — que é o "esperança." do próprio título */
    if (atual.textContent.trim() !== palavras[0]) atual.textContent = palavras[0];
    medirSlot();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirSlot);

    /* geometria dos blocos (centro de cada um, na coordenada da trilha) e o
       ponto de leitura — um pouco à esquerda do centro: assim, numa tela
       larga, quem manda no começo é o primeiro bloco */
    var centros = [];
    var referencia = 0;
    function medirTrilha() {
      centros = blocos.map(function (bloco) {
        return bloco.offsetLeft + bloco.offsetWidth / 2;
      });
      referencia = window.innerWidth * 0.42;
    }
    medirTrilha();

    var indice = -1;
    var ultimoTx = 0;

    /* pinta a palavra do bloco que está na altura de leitura */
    function pintar(tx) {
      ultimoTx = tx;
      var melhor = 0;
      var menor = Infinity;
      for (var i = 0; i < centros.length; i++) {
        var d = Math.abs(centros[i] + tx - referencia);
        if (d < menor) {
          menor = d;
          melhor = i;
        }
      }
      if (melhor === indice) return;
      indice = melhor;
      trocar(palavras[melhor]);
    }

    if (viewport.classList.contains("is-pinned") && hasGsap && !reduced) {
      /* cena travada: a palavra segue o deslocamento real da trilha, lido a
         cada quadro — assim ela troca junto com o bloco, e não depois dele
         (o amortecedor do scrub continua andando entre um scroll e outro) */
      var track = viewport.querySelector("[data-htrack]");
      if (track) {
        gsap.ticker.add(function () {
          pintar(Number(gsap.getProperty(track, "x")) || 0);
        });
      }
    } else {
      /* modo deslizante (movimento reduzido ou sem GSAP): acompanha o
         deslize lateral, sem animação de máscara */
      var scroller = viewport.querySelector(".hscene__scroller");
      if (scroller) {
        scroller.addEventListener(
          "scroll",
          function () {
            pintar(-scroller.scrollLeft);
          },
          { passive: true },
        );
      }
    }

    pintar(0);
    window.addEventListener("resize", function () {
      medirTrilha();
      indice = -1;
      pintar(ultimoTx);
    });
  }

  /* =============================================================
     12. CÓPIA DO PIX
     ============================================================= */
  (function pixCopy() {
    var btn = document.getElementById("copyPix");
    var hint = document.getElementById("copyHint");
    if (!btn) return;
    var KEY = "11987612710";
    var original = hint ? hint.textContent : "";

    function done() {
      btn.classList.add("is-copied");
      if (hint) {
        hint.classList.add("is-copied");
        hint.textContent = "Chave copiada!";
      }
      window.setTimeout(function () {
        btn.classList.remove("is-copied");
        if (hint) {
          hint.classList.remove("is-copied");
          hint.textContent = original;
        }
      }, 2400);
    }

    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = KEY;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        /* silencioso */
      }
      document.body.removeChild(ta);
    }

    btn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(KEY).then(done, legacy);
      } else {
        legacy();
      }
    });
  })();

  /* =============================================================
     13. CENAS HORIZONTAIS — interação no modo deslizante
     ============================================================= */
  function setupSceneInteraction() {
    document.querySelectorAll(".hscene__viewport").forEach(function (viewport) {
      var scroller = viewport.querySelector(".hscene__scroller");
      if (!scroller) return;
      var prevBtn = viewport.querySelector("[data-hprev]");
      var nextBtn = viewport.querySelector("[data-hnext]");
      var bar = viewport.querySelector("[data-hprogress]");

      function isPinned() {
        return viewport.classList.contains("is-pinned");
      }
      function maxScroll() {
        return scroller.scrollWidth - scroller.clientWidth;
      }
      function stepSize() {
        var first = scroller.querySelector(".panel, .vid, .gal");
        if (!first) return scroller.clientWidth * 0.8;
        var gap = parseFloat(getComputedStyle(first.parentElement).gap) || 24;
        return first.getBoundingClientRect().width + gap;
      }
      function updateBtns() {
        var m = maxScroll();
        if (prevBtn && nextBtn) {
          prevBtn.disabled = scroller.scrollLeft <= 2;
          nextBtn.disabled = m <= 2 || scroller.scrollLeft >= m - 2;
        }
        /* barra de progresso lateral — na cena travada quem manda é o
           ScrollTrigger (que conduz a trilha com a rolagem vertical) */
        if (bar && !isPinned()) {
          bar.style.transform = "scaleX(" + (m > 0 ? scroller.scrollLeft / m : 0) + ")";
        }
      }

      /* anima o deslize lateral (GSAP funciona mesmo com a aba oculta,
         diferente do scrollBy({behavior:"smooth"}) nativo) */
      function tweenTo(left) {
        var target = Math.max(0, Math.min(left, maxScroll()));
        if (hasGsap && !reduced) {
          var proxy = { x: scroller.scrollLeft };
          gsap.to(proxy, {
            x: target,
            duration: 0.6,
            ease: "power3.out",
            overwrite: true,
            onUpdate: function () {
              scroller.scrollLeft = proxy.x;
              updateBtns();
            },
          });
        } else {
          scroller.scrollLeft = target;
          updateBtns();
        }
      }

      /* roda do mouse/trackpad → movimento lateral (o Lenis não deve
         capturar o evento; nas extremidades a página volta a rolar) */
      scroller.addEventListener(
        "wheel",
        function (e) {
          if (isPinned() || maxScroll() <= 2) return;
          if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; /* eixo X já é nativo */
          var m = maxScroll();
          if ((e.deltaY > 0 && scroller.scrollLeft >= m - 1) || (e.deltaY < 0 && scroller.scrollLeft <= 0)) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          scroller.scrollLeft += e.deltaY;
          updateBtns();
        },
        { passive: false },
      );

      /* arrastar com o mouse */
      var dragging = false;
      var moved = 0;
      var startX = 0;
      var startLeft = 0;

      scroller.addEventListener("pointerdown", function (e) {
        if (isPinned() || e.pointerType === "touch" || maxScroll() <= 2) return;
        if (e.target.closest && e.target.closest("a, button")) return;
        dragging = true;
        moved = 0;
        startX = e.clientX;
        startLeft = scroller.scrollLeft;
        scroller.classList.add("is-dragging");
        e.preventDefault();
        try {
          scroller.setPointerCapture(e.pointerId);
        } catch (err) {
          /* silencioso */
        }
      });

      scroller.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var d = e.clientX - startX;
        if (Math.abs(d) > moved) moved = Math.abs(d);
        scroller.scrollLeft = startLeft - d;
        updateBtns();
      });

      function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        scroller.classList.remove("is-dragging");
        try {
          scroller.releasePointerCapture(e.pointerId);
        } catch (err) {
          /* silencioso */
        }
      }
      scroller.addEventListener("pointerup", endDrag);
      scroller.addEventListener("pointercancel", endDrag);

      /* não navega para o link dentro do painel se foi só um arraste */
      scroller.addEventListener(
        "click",
        function (e) {
          if (moved > 6) {
            e.preventDefault();
            e.stopPropagation();
            moved = 0;
          }
        },
        true,
      );

      /* botões ←/→ */
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          tweenTo(scroller.scrollLeft - stepSize());
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          tweenTo(scroller.scrollLeft + stepSize());
        });
      }

      scroller.addEventListener("scroll", updateBtns, { passive: true });
      window.addEventListener("resize", updateBtns);
      window.addEventListener("load", updateBtns);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateBtns);
      }
      updateBtns();
    });
  }

  /* =============================================================
     14. SCROLLYTELLING HORIZONTAL · BATISMOS (cena fixa)
     Espelho da construção do Skiper30 (colunas verticais em parallax) no
     eixo X. Ao chegar na seção a tela trava (pin) e está vazia: as faixas
     nascem fora do quadro, à direita, e só andam — da direita para a
     esquerda — enquanto o scroll desce. Cada faixa percorre o próprio
     deslocamento inicial (fora do quadro) + a largura do conteúdo, ou
     seja, entra inteira pela direita e sai inteira pela esquerda; só
     depois de a tela ficar vazia de novo o scroll é liberado.
     ============================================================= */
  function setupBatismo() {
    var stage = document.querySelector("[data-batismo]");
    if (!stage) return;
    var rows = Array.prototype.slice.call(stage.querySelectorAll(".batismo__row"));
    if (!rows.length) return;

    /* percurso = posição inicial (fora do quadro) + largura do conteúdo:
       a faixa começa invisível à direita e termina invisível à esquerda */
    function travel(row) {
      return Math.max(120, row.offsetLeft + row.scrollWidth);
    }

    function longestTravel() {
      return rows.reduce(function (m, row) {
        return Math.max(m, travel(row));
      }, 0);
    }

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: function () {
          /* percurso mais longo + um respiro com a tela vazia antes de
             destravar (a página só continua depois de as fotos passarem) */
          return "+=" + Math.round(longestTravel() + window.innerHeight * 0.5);
        },
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    rows.forEach(function (row) {
      tl.fromTo(
        row,
        { x: 0 },
        { x: function () { return -travel(row); }, ease: "none", duration: 1 },
        0,
      );
    });
  }

  /* =============================================================
     15. VÍDEO REEL (abre em tela cheia)
     Espelho da construção de referência: a miniatura roda em loop e o
     rótulo "Reproduzir" segue o ponteiro com molas leves (rigidez 100,
     amortecimento 10, massa 0.1). Ao clicar, o quadro nasce de uma
     fresta no meio da tela (clip-path inset 43.5% / 43.5% / 33.5%) e
     cresce até ocupar tudo com mola de massa 1, rigidez 100 e
     amortecimento 20; ao fechar, encolhe de volta e só então some
     (opacidade em 0.2s, começando depois de 0.8s).
     ============================================================= */

  /* Mola de um grau — a mesma equação do framer-motion:
     a = (-k·(x - alvo) - c·v) / m, integrada em passos curtos. */
  function Mola(cfg, aoMudar) {
    this.k = cfg.stiffness;
    this.c = cfg.damping;
    this.m = cfg.mass || 1;
    this.x = cfg.value || 0;
    this.v = 0;
    this.alvo = this.x;
    this.repouso = cfg.repouso || 0.01;
    this.repousoV = cfg.repousoV || 0.05;
    this.aoMudar = aoMudar;
    this.raf = 0;
    this.ultimo = 0;
    this.passo = this.passo.bind(this);
  }

  /* salta direto para um valor (sem animar) */
  Mola.prototype.pular = function (valor) {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.x = this.alvo = valor;
    this.v = 0;
    this.aoMudar(valor);
  };

  /* mira um valor; se já estiver animando, só troca o alvo (mantém a
     velocidade, como o .set() do framer-motion) */
  Mola.prototype.mover = function (alvo) {
    this.alvo = alvo;
    if (!this.raf) {
      this.ultimo = performance.now();
      this.raf = requestAnimationFrame(this.passo);
    }
  };

  Mola.prototype.passo = function (agora) {
    var dt = Math.min((agora - this.ultimo) / 1000, 1 / 15);
    this.ultimo = agora;
    var partes = Math.max(1, Math.ceil(dt / (1 / 180)));
    var h = dt / partes;
    for (var i = 0; i < partes; i++) {
      var a = (-this.k * (this.x - this.alvo) - this.c * this.v) / this.m;
      this.v += a * h;
      this.x += this.v * h;
    }
    if (Math.abs(this.x - this.alvo) < this.repouso && Math.abs(this.v) < this.repousoV) {
      this.raf = 0;
      this.x = this.alvo;
      this.v = 0;
      this.aoMudar(this.x);
      return;
    }
    this.aoMudar(this.x);
    this.raf = requestAnimationFrame(this.passo);
  };

  /* Tween simples em rAF (ease-out) para o que na referência não é mola:
     o véu e a opacidade da saída. */
  function tween(dur, atraso, de, para, aoMudar, aoFim) {
    var inicio = performance.now() + atraso * 1000;
    var fim = inicio + Math.max(dur, 0.001) * 1000;
    function passo(agora) {
      if (agora < inicio) {
        requestAnimationFrame(passo);
        return;
      }
      var t = Math.min(1, (agora - inicio) / (fim - inicio));
      aoMudar(de + (para - de) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(passo);
      else if (aoFim) aoFim();
    }
    requestAnimationFrame(passo);
  }

  function setupReel() {
    var secao = document.querySelector("[data-reel]");
    if (!secao) return;

    var gatilho = secao.querySelector("[data-reel-open]");
    var pop = secao.querySelector("[data-reel-pop]");
    var quadro = secao.querySelector("[data-reel-frame]");
    var veu = secao.querySelector("[data-reel-veil]");
    var botaoFechar = secao.querySelector(".reel-pop__close");
    var aviso = secao.querySelector(".reel-pop__exit");
    var video = pop.querySelector("video[slot=media]");
    var mini = gatilho.querySelector("video");
    var cursor = secao.querySelector("[data-reel-cursor]");
    if (!gatilho || !pop || !quadro || !video) return;

    /* A miniatura só roda quando aparece na tela (o arquivo tem 6 MB) e
       fica parada no primeiro quadro quando o movimento é reduzido. */
    if (mini) {
      mini.muted = true;
      var tocarMini = function () {
        var pr = mini.play();
        if (pr && pr.catch) pr.catch(function () {});
      };
      if (reduced) {
        mini.pause();
      } else if ("IntersectionObserver" in window) {
        var observador = new IntersectionObserver(
          function (entradas) {
            entradas.forEach(function (entrada) {
              if (entrada.isIntersecting) tocarMini();
              else mini.pause();
            });
          },
          { rootMargin: "200px 0px" },
        );
        observador.observe(gatilho);
      } else {
        tocarMini();
      }
    }

    /* ---------- rótulo que segue o ponteiro (molas leves) ---------- */
    if (cursor && !reduced) {
      var cx = 0;
      var cy = 0;
      var co = 0;
      var pintarCursor = function () {
        cursor.style.transform = "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0)";
        cursor.style.opacity = co.toFixed(3);
      };
      var molaX = new Mola({ stiffness: 100, damping: 10, mass: 0.1, repouso: 0.05, repousoV: 0.5 }, function (v) {
        cx = v;
        pintarCursor();
      });
      var molaY = new Mola({ stiffness: 100, damping: 10, mass: 0.1, repouso: 0.05, repousoV: 0.5 }, function (v) {
        cy = v;
        pintarCursor();
      });
      var molaO = new Mola({ stiffness: 100, damping: 10, mass: 0.1, repouso: 0.002, repousoV: 0.02 }, function (v) {
        co = v;
        pintarCursor();
      });

      gatilho.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        var caixa = gatilho.getBoundingClientRect();
        molaO.mover(1);
        molaX.mover(e.clientX - caixa.left);
        molaY.mover(e.clientY - caixa.top);
      });
      gatilho.addEventListener("pointerleave", function () {
        molaO.mover(0);
      });
    }

    /* ---------- pop-up ---------- */
    var recorte = 0; /* 0 = fresta no meio · 1 = quadro inteiro */
    var opacidade = 0;
    var opacidadePorMola = true;
    var aberto = false;

    /* o véu e o aviso da margem acendem juntos */
    var pintarVeu = function (v) {
      veu.style.opacity = v.toFixed(3);
      if (aviso) aviso.style.opacity = v.toFixed(3);
    };

    var pintarQuadro = function () {
      /* recorte 0 = fresta no meio (43.5% / 33.5%) · 1 = tela cheia */
      var l = ((1 - recorte) * 43.5).toFixed(3);
      var b = ((1 - recorte) * 33.5).toFixed(3);
      quadro.style.clipPath = "inset(" + l + "% " + l + "% " + b + "% " + l + "%)";
      quadro.style.opacity = opacidade.toFixed(3);
    };

    var molaQuadro = new Mola({ stiffness: 100, damping: 20, mass: 1, repouso: 0.0008, repousoV: 0.02 }, function (v) {
      recorte = v;
      if (opacidadePorMola) opacidade = v < 0 ? 0 : v > 1 ? 1 : v;
      pintarQuadro();
    });

    var abrirVideo = function () {
      if (aberto) return;
      aberto = true;
      pop.hidden = false;
      if (lenis) lenis.stop();

      /* o vídeo assume o som do site enquanto estiver aberto */
      suspenderMusica();

      if (reduced) {
        pintarVeu(1);
        molaQuadro.pular(1);
      } else {
        recorte = 0;
        opacidade = 0;
        opacidadePorMola = true;
        molaQuadro.pular(0);
        molaQuadro.mover(1);
        tween(0.2, 0, 0, 1, pintarVeu);
      }
      pintarQuadro();

      /* o vídeo recomeça do zero: o clique é a autorização para o som */
      try {
        video.currentTime = 0;
      } catch (err) {
        /* sem metadados ainda: toca desde o começo de qualquer forma */
      }
      var pr = video.play();
      if (pr && pr.catch) pr.catch(function () {});
      if (botaoFechar) botaoFechar.focus({ preventScroll: true });
    };

    var fecharVideo = function () {
      if (!aberto) return;
      aberto = false;
      if (lenis) lenis.start();
      video.pause();

      /* a trilha volta (se quem está vendo não tiver mutado) */
      retomarMusica();

      if (reduced) {
        pintarVeu(0);
        molaQuadro.pular(0);
        pop.hidden = true;
        gatilho.focus({ preventScroll: true });
        return;
      }

      /* no fechamento a opacidade vai por tween (0.8s de espera + 0.2s)
         enquanto a mola encolhe o recorte de volta até a fresta */
      opacidadePorMola = false;
      molaQuadro.mover(0);
      tween(0.2, 0, 1, 0, pintarVeu);
      tween(
        0.2,
        0.8,
        1,
        0,
        function (v) {
          opacidade = v;
          pintarQuadro();
        },
        function () {
          pop.hidden = true;
          gatilho.focus({ preventScroll: true });
        },
      );
    };

    gatilho.addEventListener("click", function (e) {
      e.preventDefault();
      abrirVideo();
    });

    Array.prototype.forEach.call(pop.querySelectorAll("[data-reel-close]"), function (el) {
      el.addEventListener("click", fecharVideo);
    });

    /* com o vídeo aberto a página de trás não anda: roda do mouse, teclado
       e toque ficam presos no pop-up (sem mexer no layout da página) */
    pop.addEventListener(
      "wheel",
      function (e) {
        if (!aberto) return;
        e.preventDefault();
        e.stopPropagation();
      },
      { passive: false },
    );

    document.addEventListener("keydown", function (e) {
      if (!aberto) return;
      if (e.key === "Escape" || e.key === "Esc") {
        fecharVideo();
        return;
      }
      if (
        e.key === " " ||
        e.key === "Spacebar" ||
        e.key.indexOf("Arrow") === 0 ||
        e.key === "PageUp" ||
        e.key === "PageDown" ||
        e.key === "Home" ||
        e.key === "End"
      ) {
        e.preventDefault();
      }
    });
  }

  /* =============================================================
     15.1 CAPAS DOS VÍDEOS
     A thumbnail do YouTube pode falhar (rede ou vídeo sem imagem em
     HD): quando isso acontece, caímos no formato menor e o fundo
     gradiente do cartão aparece por baixo.
     ============================================================= */
  function setupVideoThumbs() {
    document.querySelectorAll('img[src*="img.youtube.com"]').forEach(function (img) {
      img.addEventListener("error", function () {
        if (img.dataset.fallback) return;
        img.dataset.fallback = "1";
        img.src = img.src.replace("hqdefault", "mqdefault");
      });
    });
  }

  /* =============================================================
     15.2 CARTÕES DE PREGAÇÃO CABEM NA CENA
     A cena trava na tela inteira: se o cartão (capa + texto) for mais
     alto que a faixa que sobra, o rodapé do cartão fica cortado. Aqui a
     largura é medida para o conjunto caber — a capa continua em 16:9 e,
     em tela baixa, a descrição sai para devolver altura aos cartões.
     ============================================================= */
  function setupVideoFit() {
    var sec = document.getElementById("pregações");
    if (!sec) return;
    var scroller = sec.querySelector(".hscene__scroller");
    var viewport = sec.querySelector("[data-hscene]");
    var cards = [].slice.call(sec.querySelectorAll(".vid"));
    if (!scroller || !viewport || !cards.length) return;

    function clear() {
      cards.forEach(function (card) {
        card.classList.remove("is-tight");
        card.style.removeProperty("flex-basis");
      });
    }

    function bodyHeight() {
      var h = 0;
      cards.forEach(function (card) {
        var body = card.querySelector(".vid__body");
        if (body) h = Math.max(h, body.offsetHeight);
      });
      return h;
    }

    function apply(width) {
      cards.forEach(function (card) {
        card.style.flexBasis = width + "px";
      });
    }

    function fit() {
      clear();

      /* fora do travamento (tela baixa, movimento reduzido) a cena cresce
         com o conteúdo e nada é cortado: a largura do CSS basta */
      if (!viewport.classList.contains("is-pinned")) return;

      var avail = scroller.clientHeight;
      if (!avail) return;

      /* largura que deixa a capa 16:9 + o texto dentro da faixa */
      function widthFor(body) {
        var w = ((avail - body) * 16) / 9;
        /* nunca mais largo que a tela (com respiro nas laterais) */
        var ceiling = Math.max(240, Math.round(window.innerWidth * 0.86));
        return Math.max(210, Math.min(520, ceiling, Math.round(w)));
      }

      var body = bodyHeight();
      var width = widthFor(body);

      /* estreito demais para ler: a descrição sai (capa + título ficam) */
      if (width < 280) {
        cards.forEach(function (card) {
          card.classList.add("is-tight");
        });
        body = bodyHeight();
        width = widthFor(body);
      }

      /* a largura muda a quebra do texto — mede de novo até assentar */
      for (var i = 0; i < 2; i++) {
        apply(width);
        var next = widthFor(bodyHeight());
        if (next === width) break;
        width = next;
      }
      apply(width);
    }

    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    var timer = null;
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        fit();
        if (hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      }, 180);
    }

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    if (hasGsap && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.addEventListener("refreshInit", fit);
    }
  }

  /* =============================================================
     15.3 FOTO AMPLIADA
     Clicar (ou tocar) numa foto do plantio abre a imagem inteira num véu
     escuro, com o X no canto. Fecham: o X, o véu, o Esc — e a página de
     trás não rola enquanto a foto está aberta.
     ============================================================= */
  function setupLightbox() {
    var box = document.getElementById("lightbox");
    if (!box) return;
    var img = box.querySelector("img");
    var closeBtn = box.querySelector(".lightbox__close");
    var opener = null;
    var isOpen = false;

    function open(link) {
      var src = link.getAttribute("href");
      var inner = link.querySelector("img");
      if (!src) return;
      opener = link;
      if (img) {
        img.src = src;
        img.alt = inner ? inner.alt : "";
      }
      box.hidden = false;
      isOpen = true;
      document.documentElement.classList.add("is-lightbox");
      if (lenis) lenis.stop();
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      box.hidden = true;
      if (img) img.removeAttribute("src");
      document.documentElement.classList.remove("is-lightbox");
      if (lenis) lenis.start();
      if (opener && opener.focus) opener.focus({ preventScroll: true });
      opener = null;
    }

    document.querySelectorAll("[data-zoom]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        open(link);
      });
    });

    box.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        close();
      }
    });
  }

  /* =============================================================
     16. BOOT
     ============================================================= */
  setupSceneInteraction();
  setupReel();
  setupVideoThumbs();
  setupLightbox();

  /* Tudo o que trava na tela (pin) cria espaçamento no documento, então
     precisa nascer em ordem — batismo, cenas horizontais, fases — antes
     das trilhas de capítulo/passos. Se nascerem fora de ordem, os gatilhos
     ficam com posições antigas e a página trava na hora errada. */
  if (hasGsap && !reduced) {
    docEl.classList.add("has-motion");
    setupBatismo();

    /* cenas horizontais (02 símbolo · 03 pregações · 04 histórias):
       conduzidas pela rolagem em qualquer tela — nada de arrastar para o
       lado, basta descer que os blocos atravessam um após o outro até o
       último e o scroll destrava. Em telas muito baixas (celular deitado,
       janela achatada) a cena não trava: o cartão não caberia inteiro, e a
       faixa passa a rolar na horizontal, com arrasto, roda e setas. */
    var mmScenes = gsap.matchMedia();
    mmScenes.add("(min-height: 520px) and (prefers-reduced-motion: no-preference)", function () {
      var pinadas = [];
      /* cenas com data-hscene-static (a galeria de histórias) NÃO travam:
         passam direto com a rolagem e as fotos extras ficam acessíveis
         deslizando para o lado */
      document.querySelectorAll("[data-hscene]").forEach(function (viewport) {
        if (viewport.hasAttribute("data-hscene-static")) return;
        viewport.classList.add("is-pinned");
        var scroller = viewport.querySelector(".hscene__scroller");
        if (scroller) scroller.scrollLeft = 0;
        pinadas.push(viewport);
        setupHorizontal(viewport);
      });
      return function () {
        pinadas.forEach(function (viewport) {
          viewport.classList.remove("is-pinned");
        });
      };
    });

    /* cena fixa do "Como participar" (17 etapas): telas amplas apenas; em
       telas curtas as quatro fases ficam empilhadas normalmente */
    var mmPhases = gsap.matchMedia();
    mmPhases.add(
      "(min-width: 901px) and (min-height: 740px) and (prefers-reduced-motion: no-preference)",
      function () {
        docEl.classList.add("pinned");
        setupPhases();
        return function () {
          docEl.classList.remove("pinned");
        };
      },
    );
  }

  /* =============================================================
     13. DOAÇÃO — MERCADO PAGO (Checkout Pro)
     Escolhe o valor (20, 50, 100 ou livre), manda para o backend da
     Vercel e redireciona o doador ao checkout do Mercado Pago.
     O Access Token fica no servidor, nunca aqui.
     ============================================================= */
  (function doacaoMercadoPago() {
    var form = document.getElementById("doacaoForm");
    if (!form) return;

    /* backend do checkout (Vercel) — https://github.com/suitehub/roupaodafe-doacoes */
    var MP_ENDPOINT = "https://roupaodafe-doacoes-suite-hub1.vercel.app/api/create-preference";

    /* mantenha estes limites iguais aos de mp-api/api/create-preference.js */
    var MIN = 5;
    var MAX = 5000;

    var chips = Array.prototype.slice.call(form.querySelectorAll("[data-valor]"));
    var outro = document.getElementById("doacaoOutro");
    var input = document.getElementById("doacaoValor");
    var totalEl = document.getElementById("doacaoTotal");
    var btn = document.getElementById("doacaoBtn");
    var btnText = btn ? btn.querySelector("[data-doacao-text]") || btn : null;
    var msg = document.getElementById("doacaoMsg");
    var escolhido = "";
    var enviando = false;

    var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

    function configurado() {
      return MP_ENDPOINT.indexOf("SEU-PROJETO") === -1 && /^https?:\/\//.test(MP_ENDPOINT);
    }

    function setMsg(texto, tipo) {
      if (!msg) return;
      msg.textContent = texto || "";
      msg.className = "doacao__msg" + (tipo ? " is-" + tipo : "");
    }

    /* aceita 50 | 50,00 | 1.234,56 | 1234.56 | 1.000 (mil) */
    function parseValor(texto) {
      var s = String(texto == null ? "" : texto).replace(/[^\d.,]/g, "").trim();
      if (!s) return NaN;

      if (s.indexOf(",") !== -1) {
        s = s.replace(/\./g, "").replace(",", ".");
      } else {
        var partes = s.split(".");
        if (partes.length > 2) {
          s = partes.join("");
        } else if (partes.length === 2 && partes[1].length === 3) {
          s = partes.join("");
        }
      }

      var n = Number(s);
      return isFinite(n) && n > 0 ? n : NaN;
    }

    function valorAtual() {
      if (escolhido === "outro") return parseValor(input ? input.value : "");
      return Number(escolhido);
    }

    function atualizar() {
      var n = valorAtual();
      var ok = isFinite(n) && n > 0;
      if (totalEl) totalEl.textContent = brl.format(ok ? n : 0);
      chips.forEach(function (chip) {
        chip.setAttribute(
          "aria-pressed",
          chip.getAttribute("data-valor") === escolhido ? "true" : "false"
        );
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        escolhido = chip.getAttribute("data-valor");
        var livre = escolhido === "outro";
        if (outro) outro.hidden = !livre;
        if (livre && input) input.focus();
        setMsg("");
        atualizar();
      });
    });

    if (input) {
      input.addEventListener("input", function () {
        setMsg("");
        atualizar();
      });
    }

    function mensagemDeErro(status, dados) {
      var codigo = (dados && dados.error) || "";

      if (status === 429 || codigo === "too_many_requests") {
        return "Muitas tentativas seguidas. Espere um minutinho e tente de novo.";
      }
      if (codigo === "amount_out_of_range" && dados && dados.min) {
        return (
          "O valor precisa ficar entre " +
          brl.format(dados.min) +
          " e " +
          brl.format(dados.max) +
          "."
        );
      }
      if (codigo === "server_not_configured") {
        return "O pagamento online ainda não está ativo. Use a chave Pix abaixo.";
      }
      return "Não foi possível abrir o pagamento agora. Tente novamente ou use o Pix.";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (enviando) return;

      if (!configurado()) {
        setMsg("O pagamento online ainda está sendo configurado. Use o Pix abaixo.", "error");
        return;
      }

      var n = valorAtual();

      if (!escolhido) {
        setMsg("Escolha um valor para doar.", "error");
        return;
      }
      if (!isFinite(n) || n <= 0) {
        setMsg("Digite um valor válido para doar.", "error");
        return;
      }
      if (n < MIN) {
        setMsg("O valor mínimo para doar é " + brl.format(MIN) + ".", "error");
        return;
      }
      if (n > MAX) {
        setMsg("O valor máximo por doação é " + brl.format(MAX) + ".", "error");
        return;
      }

      enviando = true;
      if (btn) btn.disabled = true;
      if (btnText) btnText.textContent = "Abrindo o Mercado Pago…";
      setMsg("");

      fetch(MP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n }),
      })
        .then(function (resposta) {
          return resposta
            .json()
            .catch(function () {
              return {};
            })
            .then(function (dados) {
              return { status: resposta.status, dados: dados };
            });
        })
        .then(function (res) {
          var link = res.dados && (res.dados.init_point || res.dados.sandbox_init_point);
          if (!link) throw { status: res.status, dados: res.dados };
          window.location.href = link;
        })
        .catch(function (err) {
          enviando = false;
          if (btn) btn.disabled = false;
          if (btnText) btnText.textContent = "Doar com Mercado Pago";
          setMsg(
            err && err.dados
              ? mensagemDeErro(err.status, err.dados)
              : "Sem conexão com o servidor de pagamentos. Verifique sua internet e tente de novo.",
            "error"
          );
          if (window.console) console.error("[doação]", err);
        });
    });

    /* volta do Mercado Pago: ?doacao=sucesso | pendente | falha */
    var retorno = "";
    try {
      retorno = new URLSearchParams(window.location.search).get("doacao") || "";
    } catch (err) {
      retorno = "";
    }

    var textos = {
      sucesso: ["Doação aprovada. Muito obrigado por apoiar essa missão!", "ok"],
      pendente: ["Doação registrada e aguardando a confirmação do pagamento. Obrigado!", "ok"],
      falha: ["O pagamento não foi concluído. Se quiser, tente novamente.", "error"],
    };

    if (retorno && textos[retorno]) {
      var t = textos[retorno];
      setMsg(t[0], t[1]);
      if (input) {
        /* limpa o valor para não repetir sem querer */
        input.value = "";
      }

      /* com o splash na frente, o salto do #doar pode se perder:
         refaz o caminho quando o splash sai */
      var irParaDoacao = function () {
        var alvo = document.getElementById("doar");
        if (!alvo) return;
        var top = alvo.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      };
      var pre = document.getElementById("preloader");
      var agendado = false;
      var depoisDoSplash = function (atraso) {
        if (agendado) return;
        agendado = true;
        window.setTimeout(function () {
          if (hasGsap) ScrollTrigger.refresh();
          irParaDoacao();
        }, atraso);
      };

      if (!pre || pre.classList.contains("is-done")) {
        depoisDoSplash(120);
      } else if (window.MutationObserver) {
        var observador = new MutationObserver(function () {
          if (pre.classList.contains("is-done")) {
            observador.disconnect();
            depoisDoSplash(160);
          }
        });
        observador.observe(pre, { attributes: true, attributeFilter: ["class"] });
        window.setTimeout(function () {
          if (observador) observador.disconnect();
          depoisDoSplash(0);
        }, 7000);
      } else {
        depoisDoSplash(3200);
      }
    }

    atualizar();
  })();

  /* depois do travamento montado: aí a faixa dos cartões já tem a altura
     final da cena e o ajuste da largura mede o espaço certo */
  setupVideoFit();

  setupScrollAnimations();
  setupSimboloPalavra();
  setupSteps();
  startPreloader();
  onScroll();

  if (hasGsap) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });
  }
})();
