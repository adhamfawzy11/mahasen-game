/* Mahasen game widget v9 — minimal GTM loader */
(function () {
  'use strict';
  if (window.__mahasenWidgetV9) return;
  window.__mahasenWidgetV9 = true;

  var ORIGIN = 'https://adhamfawzy11.github.io';
  var GAME_URL = ORIGIN + '/mahasen-game/?embed=1&v=9';
  var frame = null, overlay = null, previousOverflow = '';
  var previousFocus = null, fallbackTimer = null, ready = false;

  function eventToGTM(payload) {
    if (!payload || typeof payload.event !== 'string' ||
        payload.event.indexOf('mahasen_') !== 0) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function style(el, css) { el.style.cssText = css; return el; }

  function closeGame() {
    if (!overlay) return;
    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
    overlay.parentNode && overlay.parentNode.removeChild(overlay);
    overlay = null; frame = null; ready = false;
    document.body.style.overflow = previousOverflow;
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    eventToGTM({event: 'mahasen_widget_close', game_version: 'v9'});
  }

  function openGame() {
    if (overlay || !document.body) return;

    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    ready = false;

    overlay = style(document.createElement('div'),
      'position:fixed;inset:0;z-index:2147483647;background:rgba(0,19,28,.77);display:flex;align-items:center;justify-content:center;padding:9px;box-sizing:border-box;');
    overlay.id = 'mahasen-widget-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'لعبة محاسن');
    overlay.setAttribute('aria-modal', 'true');

    var shell = style(document.createElement('div'),
      'position:relative;width:100%;max-width:540px;height:94vh;height:94dvh;max-height:900px;background:#e1f4fb;border-radius:18px;overflow:hidden;box-shadow:0 14px 50px #001d2e66;');

    frame = style(document.createElement('iframe'),
      'display:block;width:100%;height:100%;border:0;background:#e1f4fb;');
    frame.title = 'تحدي محاسن';
    frame.src = GAME_URL;
    frame.setAttribute('allow', 'autoplay');
    frame.setAttribute('loading', 'eager');

    var status = style(document.createElement('div'),
      'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:13px;text-align:center;padding:25px;background:#e1f4fb;color:#075f78;font:600 15px Tahoma,Arial,sans-serif;box-sizing:border-box;');
    status.id = 'mahasen-game-load-status';

    var message = document.createElement('div');
    message.textContent = 'جارٍ تحميل تحدي محاسن…';

    var openDirect = style(document.createElement('a'),
      'display:none;background:#076b83;color:#fff;padding:12px 17px;border-radius:13px;text-decoration:none;font:700 14px Tahoma,Arial,sans-serif;');
    openDirect.textContent = 'افتح اللعبة مباشرة';
    openDirect.href = GAME_URL;
    openDirect.target = '_blank';
    openDirect.rel = 'noopener noreferrer';

    var retry = style(document.createElement('button'),
      'display:none;background:#fff;border:1px solid #8bbfcf;color:#075f78;padding:10px 16px;border-radius:12px;font:700 13px Tahoma,Arial,sans-serif;cursor:pointer;');
    retry.type = 'button';
    retry.textContent = 'إعادة المحاولة';
    retry.onclick = function() {
      if (!frame || ready) return;
      message.textContent = 'جارٍ إعادة تحميل اللعبة…';
      openDirect.style.display = 'none';
      retry.style.display = 'none';
      frame.src = GAME_URL + '&retry=' + Date.now();
      fallbackTimer = setTimeout(showFallback, 6500);
    };

    status.appendChild(message);
    status.appendChild(openDirect);
    status.appendChild(retry);

    var close = style(document.createElement('button'),
      'position:absolute;z-index:11;top:12px;left:12px;width:42px;height:42px;border:0;border-radius:50%;background:#08647a;color:#fff;font-size:29px;cursor:pointer;');
    close.type = 'button';
    close.setAttribute('aria-label', 'إغلاق اللعبة');
    close.textContent = '×';
    close.onclick = closeGame;

    shell.appendChild(frame);
    shell.appendChild(status);
    shell.appendChild(close);
    overlay.appendChild(shell);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeGame(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    close.focus();

    function showFallback() {
      if (!overlay || ready) return;
      message.textContent = 'اللعبة مش قادرة تظهر داخل النافذة دي. افتحها مباشرة بدل الشاشة الفارغة.';
      openDirect.style.display = 'inline-block';
      retry.style.display = 'inline-block';
      eventToGTM({event:'mahasen_widget_load_timeout',game_version:'v9'});
    }

    fallbackTimer = setTimeout(showFallback, 6500);
    overlay._onGameReady = function() {
      if (ready || !overlay) return;
      ready = true;
      clearTimeout(fallbackTimer); fallbackTimer = null;
      status.style.display = 'none';
      eventToGTM({event:'mahasen_widget_ready',game_version:'v9'});
    };
    eventToGTM({event:'mahasen_widget_open',game_version:'v9'});
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGIN || !frame || e.source !== frame.contentWindow) return;
    var d = e.data;
    if (!d || d.type !== 'mahasen_game_event' || !d.payload) return;
    if (d.payload.event === 'mahasen_ready' && overlay && overlay._onGameReady) {
      overlay._onGameReady();
    }
    eventToGTM(d.payload);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay) closeGame();
  });

  function addLaunchButton() {
    if (!document.body || document.getElementById('mahasen-widget-launch')) return;
    var button = style(document.createElement('button'),
      'position:fixed;bottom:24px;right:18px;z-index:2147483000;background:#076b83;color:#fff;border:0;border-radius:28px;padding:14px 20px;font:700 15px Tahoma,Arial,sans-serif;box-shadow:0 5px 20px #002a3f55;cursor:pointer;max-width:calc(100vw - 36px);');
    button.id = 'mahasen-widget-launch';
    button.type = 'button';
    button.textContent = '🎯 العب واربح مع محاسن';
    button.onclick = openGame;
    document.body.appendChild(button);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addLaunchButton);
  else addLaunchButton();
})();