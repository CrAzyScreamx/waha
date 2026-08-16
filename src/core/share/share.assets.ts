/**
 * Two browser assets served by SharePublicController: the public pairing page
 * and the widget injected into the dashboard shell (see Dockerfile). They live
 * here as strings so no extra build/copy step is needed to ship them.
 */

export const SHARE_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Link WhatsApp</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0f1419; color: #e6edf3; padding: 16px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .card { width: 100%; max-width: 420px; background: #161b22; border: 1px solid #26303b; border-radius: 14px; padding: 24px; }
  h1 { margin: 0 0 4px; font-size: 20px; }
  .session { margin: 0 0 20px; color: #8b98a5; font-size: 14px; }
  .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .tab { flex: 1; padding: 10px; border: 1px solid #26303b; background: transparent; color: #8b98a5; border-radius: 8px; font-size: 14px; cursor: pointer; }
  .tab[aria-selected="true"] { border-color: #25d366; color: #25d366; }
  ol { padding-left: 20px; margin: 0 0 16px; color: #8b98a5; font-size: 13px; line-height: 1.7; }
  .qr-box { display: flex; align-items: center; justify-content: center; min-height: 240px; background: #fff; border-radius: 10px; padding: 12px; }
  .qr-box img { width: 100%; max-width: 260px; display: block; }
  .qr-box.empty { background: #0f1419; border: 1px dashed #26303b; color: #8b98a5; font-size: 14px; text-align: center; }
  input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #26303b; background: #0f1419; color: #e6edf3; font-size: 16px; }
  button.primary { width: 100%; margin-top: 12px; padding: 12px; border: 0; border-radius: 8px; background: #25d366; color: #06231a; font-size: 15px; font-weight: 600; cursor: pointer; }
  button.primary:disabled { opacity: .5; cursor: default; }
  .code { margin-top: 16px; text-align: center; font-size: 30px; letter-spacing: 4px; font-weight: 700; color: #25d366; }
  .status { margin: 16px 0 0; text-align: center; font-size: 13px; color: #8b98a5; min-height: 18px; }
  .status.error { color: #f8737f; }
  .done { text-align: center; }
  .done .mark { font-size: 44px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<main class="card">
  <div id="pairing">
    <h1>Link WhatsApp</h1>
    <p class="session" id="session">&nbsp;</p>
    <div class="tabs" role="tablist">
      <button class="tab" id="tab-qr" role="tab" aria-selected="true">Scan QR</button>
      <button class="tab" id="tab-code" role="tab" aria-selected="false">Enter Code</button>
    </div>
    <section id="panel-qr">
      <ol>
        <li>Open WhatsApp on your phone</li>
        <li>Tap <b>Settings</b> &rarr; <b>Linked devices</b></li>
        <li>Tap <b>Link a device</b> and scan this code</li>
      </ol>
      <div class="qr-box empty" id="qr-box">Waiting for the QR code&hellip;</div>
    </section>
    <section id="panel-code" hidden>
      <ol>
        <li>Open WhatsApp &rarr; <b>Linked devices</b> &rarr; <b>Link a device</b></li>
        <li>Tap <b>Link with phone number instead</b></li>
        <li>Enter your phone number below and type the code you get</li>
      </ol>
      <input id="phone" type="tel" inputmode="tel" placeholder="Your phone number, e.g. 12132132130" />
      <button class="primary" id="get-code">Get code</button>
      <div class="code" id="code"></div>
    </section>
    <p class="status" id="status"></p>
  </div>
  <div class="done" id="done" hidden>
    <div class="mark" id="done-mark">&#10004;</div>
    <h1 id="done-title">Linked</h1>
    <p class="session" id="done-text">This link is closed now.</p>
  </div>
</main>
<script>
(function () {
  var API = '/share/' + location.pathname.split('/').filter(Boolean).pop();
  var el = function (id) { return document.getElementById(id); };
  var timer = null;
  var startRequested = false;

  function finish(mark, title, text) {
    clearTimeout(timer);
    el('pairing').hidden = true;
    el('done').hidden = false;
    el('done-mark').innerHTML = mark;
    el('done-title').textContent = title;
    el('done-text').textContent = text;
  }

  function setStatus(text, isError) {
    el('status').textContent = text || '';
    el('status').className = isError ? 'status error' : 'status';
  }

  function showTab(name) {
    var qr = name === 'qr';
    el('tab-qr').setAttribute('aria-selected', String(qr));
    el('tab-code').setAttribute('aria-selected', String(!qr));
    el('panel-qr').hidden = !qr;
    el('panel-code').hidden = qr;
  }

  el('tab-qr').onclick = function () { showTab('qr'); };
  el('tab-code').onclick = function () { showTab('code'); };

  function showQR(qr) {
    var box = el('qr-box');
    if (!qr) {
      box.className = 'qr-box empty';
      box.textContent = 'Waiting for the QR code\\u2026';
      return;
    }
    var img = box.querySelector('img');
    if (!img) {
      box.className = 'qr-box';
      box.textContent = '';
      img = document.createElement('img');
      img.alt = 'QR code';
      box.appendChild(img);
    }
    if (img.src !== qr) {
      img.src = qr;
    }
  }

  function start() {
    if (startRequested) { return; }
    startRequested = true;
    fetch(API + '/start', { method: 'POST' }).catch(function () {});
  }

  function apply(state) {
    el('session').textContent = state.session;
    if (state.status === 'WORKING') {
      finish('&#10004;', 'Linked', 'WhatsApp is connected. This link is closed now.');
      return;
    }
    if (state.status === 'FAILED' && startRequested) {
      setStatus('The session could not start, ask for a hand', true);
      return;
    }
    if (state.status === 'STOPPED' || state.status === 'FAILED') {
      setStatus('Starting the session\\u2026');
      start();
      return;
    }
    if (state.status === 'STARTING') {
      setStatus('Starting the session\\u2026');
      return;
    }
    if (state.status === 'SCAN_QR_CODE') {
      startRequested = false;
      setStatus('');
      showQR(state.qr);
      return;
    }
    setStatus('Session status: ' + state.status);
  }

  function poll() {
    fetch(API + '/state')
      .then(function (response) {
        if (response.status === 410 || response.status === 401) {
          finish('&#8709;', 'Link closed', 'Ask for a new link.');
          return null;
        }
        if (!response.ok) { throw new Error('HTTP ' + response.status); }
        return response.json();
      })
      .then(function (state) {
        if (!state) { return; }
        apply(state);
        timer = setTimeout(poll, 3000);
      })
      .catch(function () {
        setStatus('Connection problem, retrying\\u2026', true);
        timer = setTimeout(poll, 5000);
      });
  }

  el('get-code').onclick = function () {
    var phone = el('phone').value.replace(/\\D/g, '');
    if (phone.length < 8) {
      setStatus('Enter your phone number in international format', true);
      return;
    }
    el('get-code').disabled = true;
    setStatus('Requesting a code\\u2026');
    fetch(API + '/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    })
      .then(function (response) {
        if (!response.ok) { throw new Error('HTTP ' + response.status); }
        return response.json();
      })
      .then(function (data) {
        el('code').textContent = data.code;
        setStatus('Type this code on your phone');
      })
      .catch(function () {
        setStatus('Could not get a code, try again', true);
      })
      .finally(function () {
        el('get-code').disabled = false;
      });
  };

  poll();
})();
</script>
</body>
</html>
`;

export const SHARE_INJECT_JS = `(function () {
  'use strict';
  if (window.__wahaShareLink || window.top !== window) { return; }
  window.__wahaShareLink = true;

  var TAB_TEXT = 'Scan QR';
  var LABEL = 'Get a Share Link';

  function servers() {
    try { return JSON.parse(localStorage.getItem('servers') || '[]'); } catch (e) { return []; }
  }

  function pickServer(title) {
    var list = servers();
    if (!list.length) { return { url: location.origin, key: 'admin' }; }
    var match = list.filter(function (server) {
      return server.name && title.indexOf(server.name) !== -1;
    })[0] || list[0];
    var connection = match.connection || {};
    return { url: (connection.url || location.origin).replace(/\\/$/, ''), key: connection.key };
  }

  function findTab(dialog) {
    var best = null;
    var nodes = dialog.querySelectorAll('a, li, div, span, button');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].textContent.trim() !== TAB_TEXT) { continue; }
      if (!best || nodes[i].querySelectorAll('*').length < best.querySelectorAll('*').length) {
        best = nodes[i];
      }
    }
    return best;
  }

  function sessionName(dialog) {
    var title = dialog.querySelector('.p-dialog-title');
    var span = title && title.querySelector('span');
    return span ? span.textContent.trim() : '';
  }

  function showLink(box, link, expiresAt) {
    box.textContent = '';
    var input = document.createElement('input');
    input.readOnly = true;
    input.value = link;
    input.style.cssText = 'flex:1;min-width:0;padding:6px 8px;border-radius:6px;border:1px solid #3f4b5b;background:transparent;color:inherit;font-size:12px';
    input.onclick = function () { input.select(); };
    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'p-button p-button-sm';
    copy.textContent = 'Copy';
    copy.onclick = function () {
      input.select();
      navigator.clipboard.writeText(link).catch(function () {});
      copy.textContent = 'Copied';
    };
    var hint = document.createElement('small');
    hint.style.cssText = 'flex-basis:100%;opacity:.7';
    hint.textContent = 'Anyone with this link can pair the session. Valid until ' + new Date(expiresAt).toLocaleString() + '.';
    box.appendChild(input);
    box.appendChild(copy);
    box.appendChild(hint);
    navigator.clipboard.writeText(link).catch(function () {});
  }

  function attach(dialog) {
    if (dialog.querySelector('.waha-share-box')) { return; }
    var tab = findTab(dialog);
    if (!tab) { return; }
    var name = sessionName(dialog);
    if (!name) { return; }

    var box = document.createElement('div');
    box.className = 'waha-share-box';
    box.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'p-button p-button-sm p-button-outlined';
    button.textContent = LABEL;
    button.onclick = function () {
      var server = pickServer(dialog.querySelector('.p-dialog-title').textContent);
      var headers = { 'Content-Type': 'application/json' };
      if (server.key) { headers['X-Api-Key'] = server.key; }
      button.disabled = true;
      button.textContent = 'Creating\\u2026';
      fetch(server.url + '/api/sessions/' + encodeURIComponent(name) + '/share-link', {
        method: 'POST',
        headers: headers
      })
        .then(function (response) {
          if (!response.ok) { throw new Error('HTTP ' + response.status); }
          return response.json();
        })
        .then(function (data) { showLink(box, server.url + data.path, data.expiresAt); })
        .catch(function (error) {
          button.disabled = false;
          button.textContent = LABEL;
          var failed = document.createElement('small');
          failed.style.cssText = 'color:#f8737f';
          failed.textContent = 'Failed: ' + error.message;
          box.appendChild(failed);
        });
    };

    box.appendChild(button);
    var nav = tab.closest('ul, [role="tablist"]') || tab.parentElement;
    nav.insertAdjacentElement('afterend', box);
  }

  var pending = null;
  function scan() {
    pending = null;
    document.querySelectorAll('.p-dialog').forEach(attach);
  }

  new MutationObserver(function () {
    if (pending) { return; }
    pending = setTimeout(scan, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });

  scan();
})();
`;
