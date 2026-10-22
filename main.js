// FM-Pack GmbH — Website · Bewegung ist additiv: ohne JavaScript bleibt alles lesbar.
(function () {
  'use strict';
  document.documentElement.classList.remove('kein-js');
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  if (ruhig) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  /* ---------- geladen: die Klammer im Hero schließt sich ---------- */
  var geladen = function () { document.body.classList.add('geladen'); };
  raf(function () { setTimeout(geladen, 120); });
  setTimeout(geladen, 1200);

  /* ---------- Kopf ---------- */
  var kopf = document.querySelector('header');
  var ticking = false;
  function beiScroll() {
    if (kopf) kopf.classList.toggle('scrolled', scrollY > 24);
    scrub();
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { raf(beiScroll); ticking = true; } }, { passive: true });
  addEventListener('resize', scrub);

  /* ---------- Mobil-Menü (hell, aus dem Kopf heraus) ---------- */
  var menuKnopf = document.querySelector('.menu-knopf');
  var menuFlaeche = document.querySelector('.menu-flaeche');
  if (menuKnopf && menuFlaeche) {
    menuFlaeche.hidden = false;
    menuKnopf.addEventListener('click', function () {
      var auf = document.body.classList.toggle('menu-auf');
      menuKnopf.setAttribute('aria-expanded', auf ? 'true' : 'false');
      document.body.style.overflow = auf ? 'hidden' : '';
    });
    menuFlaeche.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-auf'); document.body.style.overflow = ''; });
    });
    addEventListener('resize', function () { if (innerWidth > 1100 && document.body.classList.contains('menu-auf')) { document.body.classList.remove('menu-auf'); document.body.style.overflow = ''; } });
  }

  /* ---------- Reveal: erst, wenn das Element in die Nähe kommt, plus Sicherheitsnetz ---------- */
  var revs = document.querySelectorAll('.rev');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    revs.forEach(function (el) { io.observe(el); });
  } else { revs.forEach(function (el) { el.classList.add('da'); }); }
  var nachholen = function () {
    var unten = scrollY + innerHeight;
    document.querySelectorAll('.rev:not(.da)').forEach(function (el) {
      if (el.getBoundingClientRect().top + scrollY < unten) el.classList.add('da');
    });
  };
  addEventListener('scroll', nachholen, { passive: true });
  setTimeout(nachholen, 2600);

  /* ---------- Scroll-Mechaniken: Statement (Skill scroll-text), Kette, Achsen ---------- */
  var statement = document.querySelector('.statement');
  var statementH2 = statement && statement.querySelector('h2');
  var statementWorte = [];
  function worteTeilen(knoten) {
    Array.prototype.slice.call(knoten.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        if (!n.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.appendChild(document.createTextNode(t));
          else { var i = document.createElement('i'); i.className = 'w'; i.textContent = t; frag.appendChild(i); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'I' && n.tagName !== 'SVG') worteTeilen(n);
    });
  }
  if (statementH2) { statementH2.setAttribute('data-fuell', ''); worteTeilen(statementH2); statementWorte = Array.prototype.slice.call(statementH2.querySelectorAll('i')); }
  var ketten = Array.prototype.slice.call(document.querySelectorAll('.kette, .achse'));

  function scrub() {
    var h = innerHeight;
    if (statementH2 && statementWorte.length) {
      // das TEXTELEMENT messen: Start bei 78 % der Fensterhöhe, voll bei 32 % — in beide Richtungen
      var r = statementH2.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (h * 0.78 - r.top) / (h * 0.46)));
      if (ruhig) p = 1;
      statement.style.setProperty('--p', p.toFixed(3));
      statementWorte.forEach(function (w, i) { w.classList.toggle('an', (i + 1) / statementWorte.length <= p + 0.02); });
    }
    ketten.forEach(function (k) {
      // Fortschritt aus dem Weg des Blocks durchs Fenster: die Spur füllt sich, solange der Block im Bild steht
      var b = k.getBoundingClientRect();
      var p2 = ruhig ? 1 : Math.min(1, Math.max(0, (h * 0.86 - b.top) / Math.max(1, Math.min(b.height, h * 0.6))));
      // Einrasten: kurz bei jedem Halt verweilen (Noah, 05.10.: am Ergebnis hängen bleiben)
      k.style.setProperty('--p', p2.toFixed(3));
      var halte = k.querySelectorAll('.station, .halt');
      halte.forEach(function (s, i) {
        var an = (i + 0.5) / halte.length <= p2 + 0.001;
        s.classList.toggle('an', an);
        if (an && p2 >= 0.999) s.classList.add('fertig'); else s.classList.remove('fertig');
      });
    });
  }
  scrub();

  /* ---------- Der Leistungsring: Segment anfassen, Mitte wechselt, Selbstlauf bis zur ersten Berührung ---------- */
  var ring = document.querySelector('.ring-buehne');
  if (ring) {
    var segs = Array.prototype.slice.call(ring.querySelectorAll('.seg'));
    var mitte = ring.querySelector('.ring-mitte');
    var liste = Array.prototype.slice.call(document.querySelectorAll('.ring-liste a'));
    var aktiv = -1, timer = null, angefasst = false;
    function zeige(i, sofort) {
      if (i === aktiv) return;
      aktiv = i;
      segs.forEach(function (s, j) { s.classList.toggle('an', j === i); });
      liste.forEach(function (a, j) { a.classList.toggle('an', j === i); });
      var s = segs[i];
      var setz = function () {
        mitte.querySelector('.ic').innerHTML = s.getAttribute('data-icon');
        mitte.querySelector('b').textContent = s.getAttribute('data-name');
        mitte.querySelector('p').textContent = s.getAttribute('data-satz');
        mitte.classList.remove('wechsel');
      };
      if (sofort || ruhig) { setz(); return; }
      mitte.classList.add('wechsel'); setTimeout(setz, 230);
    }
    segs.forEach(function (s, i) {
      s.addEventListener('mouseenter', function () { angefasst = true; zeige(i); });
      s.addEventListener('focus', function () { angefasst = true; zeige(i); });
      s.addEventListener('click', function () { location.href = s.getAttribute('data-href'); });
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = s.getAttribute('data-href'); } });
    });
    liste.forEach(function (a, i) {
      a.addEventListener('mouseenter', function () { angefasst = true; zeige(i); });
      a.addEventListener('focus', function () { angefasst = true; zeige(i); });
    });
    zeige(0, true);
    if (!ruhig) {
      timer = setInterval(function () { if (angefasst) { clearInterval(timer); return; } zeige((aktiv + 1) % segs.length); }, 4200);
    }
  }

  /* ---------- Regler: Presslingsgröße < 1 g … 200 g ---------- */
  var regler = document.querySelector('.regler input[type=range]');
  if (regler) {
    var anzeige = document.querySelector('[data-regler-wert]');
    var kreis = document.querySelector('[data-regler-kreis]');
    var satz = document.querySelector('[data-regler-satz]');
    var stufen = [
      [1, 'unter 1 g', 'Mikrotabletten: viele kleine Presslinge, die einzeln unter einem Gramm wiegen.'],
      [10, 'etwa 10 g', 'Kleine Presslinge in Tabletten- oder Bonbongröße, auch in Sonderformen.'],
      [60, 'etwa 60 g', 'Mittlere Presslinge, zum Beispiel als Portionsstück oder Würfel.'],
      [200, 'bis etwa 200 g', 'Große Presslinge am oberen Ende des Gewichtsbereichs.']
    ];
    var zeichne = function () {
      var v = parseFloat(regler.value); // 0..100 logarithmisch auf 0,5–200 g
      var g = 0.5 * Math.pow(400, v / 100);
      var f = (v / 100 * 100).toFixed(1) + '%';
      regler.style.setProperty('--f', f);
      var st = stufen[0];
      stufen.forEach(function (s) { if (g >= s[0] * 0.75) st = s; });
      if (anzeige) anzeige.textContent = g < 1 ? '< 1 g' : Math.round(g) + ' g';
      if (satz) { satz.querySelector('b').textContent = st[1]; satz.querySelector('p').textContent = st[2]; }
      if (kreis) { var r = 14 + Math.sqrt(g / 200) * 96; kreis.setAttribute('r', r.toFixed(1)); kreis.nextElementSibling && kreis.nextElementSibling.setAttribute('r', Math.max(4, r - 12).toFixed(1)); }
    };
    regler.addEventListener('input', zeichne); zeichne();
  }

  /* ---------- Wähler mit Chips: Verpackung, Beutel, Mischweg ---------- */
  document.querySelectorAll('[data-waehler]').forEach(function (w) {
    var chips = Array.prototype.slice.call(w.querySelectorAll('.chip'));
    var text = w.querySelector('.waehler-text');
    var grafik = w.querySelector('.buehne-grafik');
    function wahl(c) {
      chips.forEach(function (x) { x.classList.toggle('an', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      var setz = function () {
        if (text) { text.querySelector('b').textContent = c.getAttribute('data-titel'); text.querySelector('p').textContent = c.getAttribute('data-satz'); text.classList.remove('wechsel'); }
        if (grafik) grafik.querySelectorAll('[data-form]').forEach(function (g) { g.style.display = g.getAttribute('data-form') === c.getAttribute('data-form') ? '' : 'none'; });
      };
      if (ruhig || !text) { setz(); return; }
      text.classList.add('wechsel'); setTimeout(setz, 220);
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { wahl(c); }); });
    if (chips.length) wahl(chips[0]);
  });

  /* ---------- Schalter (zwei Zustände): Schutzfilm / Geschmacksfilm, Stickstoff an/aus ---------- */
  document.querySelectorAll('[data-schalter]').forEach(function (s) {
    var knoepfe = Array.prototype.slice.call(s.querySelectorAll('button'));
    var ziel = document.querySelector(s.getAttribute('data-schalter'));
    knoepfe.forEach(function (k) {
      k.addEventListener('click', function () {
        knoepfe.forEach(function (x) { x.classList.toggle('an', x === k); x.setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
        if (ziel) { ziel.setAttribute('data-zustand', k.getAttribute('data-wert')); }
        var t = document.querySelector(s.getAttribute('data-text') || '');
        if (t) { t.querySelector('b').textContent = k.getAttribute('data-titel'); t.querySelector('p').textContent = k.getAttribute('data-satz'); }
      });
    });
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-eintrag.auf .faq-antwort').forEach(function (a) { a.style.maxHeight = a.scrollHeight + 'px'; });
  document.querySelectorAll('.faq-frage').forEach(function (knopf) {
    knopf.addEventListener('click', function () {
      var eintrag = knopf.closest('.faq-eintrag'), antwort = eintrag.querySelector('.faq-antwort');
      var auf = eintrag.classList.toggle('auf');
      knopf.setAttribute('aria-expanded', auf ? 'true' : 'false');
      antwort.style.maxHeight = auf ? antwort.scrollHeight + 'px' : '';
    });
  });

  /* ---------- Hero-Video: läuft erst, wenn es kann; Poster bleibt sonst ---------- */
  if (!ruhig) document.querySelectorAll('.hero-film video').forEach(function (v) { v.play && v.play().catch(function () {}); });

  /* ---------- Anfrageformular → Formular-Dienst der HandwerksManufaktur (Worker), Rückmeldung per Parameter ---------- */
  var q = new URLSearchParams(location.search);
  document.querySelectorAll('.formular form').forEach(function (f) {
    var hinweis = f.querySelector('.form-hinweis');
    var knopf = f.querySelector('button[type="submit"]');
    var TEL = f.getAttribute('data-tel') || '';
    var MAIL = f.getAttribute('data-mail') || '';
    function sage(text, art) { if (!hinweis) return; hinweis.textContent = text; hinweis.className = 'form-hinweis ' + (art || ''); }
    f.addEventListener('submit', function (e) {
      var name = f.querySelector('[name="name"]'), mail = f.querySelector('[name="mail"]'), nachricht = f.querySelector('[name="nachricht"]'), ok = f.querySelector('[name="einwilligung"]');
      if (!name.value.trim()) { e.preventDefault(); sage('Bitte tragen Sie noch Ihren Namen ein.', 'fehler'); name.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) { e.preventDefault(); sage('Bitte tragen Sie eine gültige E-Mail-Adresse ein, damit wir antworten können.', 'fehler'); mail.focus(); return; }
      if (!nachricht.value.trim()) { e.preventDefault(); sage('Bitte schreiben Sie kurz, um welches Produkt es geht.', 'fehler'); nachricht.focus(); return; }
      if (ok && !ok.checked) { e.preventDefault(); sage('Bitte bestätigen Sie noch die Zeile zum Datenschutz.', 'fehler'); ok.focus(); return; }
      if (knopf) { knopf.disabled = true; knopf.querySelector('span').textContent = 'Wird gesendet …'; }
      sage('');
    });
    if (q.has('gesendet') || q.has('fehler')) {
      if (q.has('gesendet')) { f.reset(); sage('Danke, Ihre Anfrage ist angekommen. Frank Marsch meldet sich bei Ihnen.', 'gut'); }
      else sage('Das Absenden hat gerade nicht funktioniert. Rufen Sie uns an: ' + TEL + ' oder schreiben Sie an ' + MAIL + '.', 'fehler');
      history.replaceState(null, '', location.pathname + '#anfrage');
      var ziel = document.getElementById('anfrage'); if (ziel) ziel.scrollIntoView({ block: 'start' });
    }
  });

  /* ---------- Seitenaufrufe zählen — ohne Cookies, ohne Speicher im Browser, ohne IP, ohne Kennung ---------- */
  if (/(^|\.)fm-?pack\.de$/.test(location.hostname)) {
    var r = 'direkt';
    try {
      if (q.get('utm_source')) r = 'utm:' + q.get('utm_source');
      else if (document.referrer) { var hn = new URL(document.referrer).hostname.replace(/^www\./, ''); if (hn && hn !== location.hostname) r = hn; }
    } catch (e) {}
    var d = JSON.stringify({ t: 'v', s: location.hostname, p: location.pathname, g: innerWidth < 768 ? 'm' : 'd', id: Math.random().toString(36).slice(2, 12), r: r });
    var Z = 'https://seiten-zaehler.handwerksmanufaktur.workers.dev/z';
    try { if (!(navigator.sendBeacon && navigator.sendBeacon(Z, new Blob([d], { type: 'text/plain' })))) fetch(Z, { method: 'POST', body: d, keepalive: true, mode: 'no-cors' }); } catch (e) {}
  }
})();
