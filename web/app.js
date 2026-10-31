/* ============================================================================
 * Pixel Bulwark 介绍页 — 语言切换 / 导航滚动定位
 * 纯静态脚本，无依赖，直接以 <script src> 加载（file:// 下同样可用）。
 * ==========================================================================*/
(function () {
  'use strict';

  var DICT = window.I18N || {};
  var LANGS = ['zh', 'en', 'ja'];
  var STORE_KEY = 'tinywar_intro_lang';

  /* ---------------------------------------------------------------- 语言 */

  function pickInitialLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* file:// 可能禁用 */ }
    if (saved && LANGS.indexOf(saved) !== -1) return saved;

    var nav = (navigator.language || navigator.userLanguage || 'zh').toLowerCase();
    if (nav.indexOf('ja') === 0) return 'ja';
    if (nav.indexOf('zh') === 0) return 'zh';
    if (nav.indexOf('en') === 0) return 'en';
    return 'zh';
  }

  function format(template, args) {
    if (!args || !args.length) return template;
    var i = 0;
    return template.replace(/%[ds]/g, function (m) {
      return i < args.length ? String(args[i++]) : m;
    });
  }

  function applyLang(lang) {
    var t = DICT[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = t[key];
      if (text === undefined) return;
      var raw = el.getAttribute('data-i18n-args');
      if (raw) {
        var args = [];
        try { args = JSON.parse(raw); } catch (e) { args = []; }
        text = format(text, args);
      }
      el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-alt');
      if (t[key] !== undefined) el.setAttribute('alt', t[key]);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });

    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : lang);
    if (t['hero.title']) document.title = 'Pixel Bulwark · ' + t['hero.title'];

    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* ignore */ }
  }

  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  /* ------------------------------------------------------- 导航滚动高亮 */

  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.topbar nav a'));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    if (!sections.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window) {
      var visible = {};
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting;
        });
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i].id]) { setActive(sections[i].id); break; }
        }
      }, { rootMargin: '-70px 0px -65% 0px', threshold: 0 });
      sections.forEach(function (s) { obs.observe(s); });
    } else {
      // 退化实现：滚动时取最靠近顶部的分区
      window.addEventListener('scroll', function () {
        var best = sections[0].id, bestTop = Infinity;
        sections.forEach(function (s) {
          var top = s.getBoundingClientRect().top;
          if (top < bestTop && top > -200) { bestTop = top; best = s.id; }
        });
        setActive(best);
      }, { passive: true });
    }
  }

  /* ------------------------------------------------------------ 启动 */

  applyLang(pickInitialLang());
  setupScrollSpy();
})();
