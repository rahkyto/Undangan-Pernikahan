// ===================================================================
// Undangan Pernikahan — Rivaldo & Merlinda
// script.js — gate, musik, countdown, animasi scroll (lazy reveal)
// ===================================================================

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------
   * 1. Gate / sampul — klik "Buka Undangan"
   * --------------------------------------------------------------- */
  var gate = document.getElementById('gate');
  var openBtn = document.getElementById('open-btn');
  var musicToggle = document.getElementById('music-toggle');
  var bgm = document.getElementById('bgm');

  document.body.style.overflow = 'hidden';

  openBtn.addEventListener('click', function () {
    gate.classList.add('hidden');
    document.body.style.overflow = 'auto';

    // Tampilkan tombol musik & coba putar otomatis
    // (autoplay hanya diizinkan browser setelah ada interaksi user,
    // klik tombol ini adalah interaksi yang sah)
    musicToggle.classList.add('visible');
    if (bgm) {
      bgm.volume = 0.55;
      var playPromise = bgm.play();
      if (playPromise && playPromise.then) {
        playPromise
          .then(function () {
            musicToggle.classList.add('playing');
            musicToggle.setAttribute('aria-pressed', 'true');
          })
          .catch(function () {
            // Autoplay ditolak browser — biarkan user menekan tombol musik manual
            musicToggle.classList.remove('playing');
            musicToggle.setAttribute('aria-pressed', 'false');
          });
      }
    }
  });

  /* -----------------------------------------------------------------
   * 2. Tombol musik manual
   * --------------------------------------------------------------- */
  if (musicToggle && bgm) {
    musicToggle.addEventListener('click', function () {
      if (bgm.paused) {
        bgm.play().catch(function () {});
        musicToggle.classList.add('playing');
        musicToggle.setAttribute('aria-pressed', 'true');
      } else {
        bgm.pause();
        musicToggle.classList.remove('playing');
        musicToggle.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* -----------------------------------------------------------------
   * 3. Countdown menuju hari-H
   *    28 September 2026, 10:00 WITA (UTC+8)
   * --------------------------------------------------------------- */
  var target = new Date('2026-09-28T10:00:00+08:00').getTime();
  var elD = document.getElementById('cd-d');
  var elH = document.getElementById('cd-h');
  var elM = document.getElementById('cd-m');
  var elS = document.getElementById('cd-s');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tickPulse(el) {
    if (reduceMotion) return;
    el.classList.remove('tick');
    // force reflow supaya animasi bisa diulang
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function updateCountdown() {
    var now = Date.now();
    var diff = Math.max(0, target - now);

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    var newS = pad(s);
    if (elS.textContent !== newS) tickPulse(elS);

    elD.textContent = pad(d);
    elH.textContent = pad(h);
    elM.textContent = pad(m);
    elS.textContent = newS;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* -----------------------------------------------------------------
   * 4. Animasi reveal saat scroll (lazy: baru animasi saat masuk viewport)
   *    Stagger otomatis untuk elemen dalam section yang sama.
   * --------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var staggerCounters = new WeakMap();

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var parent = el.closest('section') || document.body;
          var count = staggerCounters.get(parent) || 0;
          staggerCounters.set(parent, count + 1);

          var delay = Math.min(count * 90, 360); // ms, dibatasi biar tidak terlalu lama
          setTimeout(function () {
            el.classList.add('in');
          }, delay);

          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    // Fallback: tampilkan langsung tanpa animasi
    revealEls.forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* -----------------------------------------------------------------
   * 5. Fade-in foto setelah lazy-loaded selesai dimuat
   * --------------------------------------------------------------- */
  var photo = document.querySelector('.photo-arch img');
  if (photo) {
    if (photo.complete && photo.naturalWidth > 0) {
      photo.classList.add('loaded');
    } else {
      photo.addEventListener('load', function () {
        photo.classList.add('loaded');
      });
    }
  }
})();
