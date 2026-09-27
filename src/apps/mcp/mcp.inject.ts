/**
 * Dashboard widget: lets the MCP "Add App" dialog reuse the API key of an MCP
 * app on another session (config.share_key), and shows who shares a key in
 * "Edit App". The dashboard is an upstream prebuilt bundle, so this is served
 * together with SHARE_INJECT_JS from /share/inject.js (see Dockerfile).
 *
 * The dashboard sends requests with axios (XMLHttpRequest) and never puts the
 * session name in the dialog DOM - so the session is taken from its
 * GET /api/apps?session=... call, and share_key is added to its POST body.
 */
export const MCP_INJECT_JS = String.raw`(function () {
  'use strict';
  if (window.__wahaMcpShare || window.top !== window) { return; }
  window.__wahaMcpShare = true;

  var BOX = 'waha-mcp-share';
  var state = { session: '', shareKey: '' };

  var open = XMLHttpRequest.prototype.open;
  var send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__wahaReq = { method: String(method).toUpperCase(), path: String(url).replace(/^https?:\/\/[^\/]+/, '') };
    return open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    var req = this.__wahaReq;
    if (req && req.method === 'GET') {
      var match = req.path.match(/\/api\/apps\?(?:.*&)?session=([^&]+)/);
      if (match) { state.session = decodeURIComponent(match[1]); }
    }
    if (req && req.method === 'POST' && /\/api\/apps\/?(\?|$)/.test(req.path) && state.shareKey && typeof body === 'string') {
      try {
        var app = JSON.parse(body);
        if (app.app === 'mcp') {
          app.config = app.config || {};
          app.config.share_key = state.shareKey;
          body = JSON.stringify(app);
          state.shareKey = '';
        }
      } catch (e) {}
    }
    return send.call(this, body);
  };

  function server() {
    var list = [];
    try { list = JSON.parse(localStorage.getItem('servers') || '[]'); } catch (e) {}
    if (!list.length) { return { url: location.origin, key: 'admin' }; }
    var connection = list[0].connection || {};
    return { url: (connection.url || location.origin).replace(/\/$/, ''), key: connection.key };
  }

  function get(path) {
    var s = server();
    var headers = { Accept: 'application/json' };
    if (s.key) { headers['X-Api-Key'] = s.key; }
    return fetch(s.url + path, { headers: headers }).then(function (response) {
      if (!response.ok) { throw new Error('HTTP ' + response.status); }
      return response.json();
    });
  }

  // All MCP apps on all sessions this dashboard key can see: [{ session, app }]
  function mcpApps() {
    return get('/api/sessions?all=true').then(function (sessions) {
      return Promise.all(sessions.map(function (session) {
        return get('/api/apps?session=' + encodeURIComponent(session.name))
          .then(function (apps) {
            return apps.filter(function (app) { return app.app === 'mcp' && app.config && app.config.key_id; })
              .map(function (app) { return { session: session.name, app: app }; });
          })
          .catch(function () { return []; });
      }));
    }).then(function (lists) { return [].concat.apply([], lists); });
  }

  function label(dialog, text) {
    var labels = dialog.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim() === text) { return labels[i]; }
    }
    return null;
  }

  function isMcp(dialog) {
    return dialog.textContent.indexOf('What MCP Agent can do') !== -1;
  }

  function title(dialog) {
    var header = dialog.querySelector('.p-dialog-header');
    return header ? header.textContent.trim() : '';
  }

  function note(box, text) {
    var small = box.querySelector('small') || box.appendChild(document.createElement('small'));
    small.style.cssText = 'display:block;margin-top:4px;opacity:.7';
    small.textContent = text;
  }

  function addMode(box) {
    var heading = document.createElement('label');
    heading.innerHTML = '<b>API Key</b>';
    var select = document.createElement('select');
    select.className = 'p-inputtext p-component';
    select.style.cssText = 'width:100%;margin-top:4px';
    select.add(new Option('Create a new key for this session', ''));
    select.onchange = function () { state.shareKey = select.value; };
    box.appendChild(heading);
    box.appendChild(select);
    note(box, 'Loading MCP keys of other sessions…');
    state.shareKey = '';
    mcpApps().then(function (apps) {
      var owners = apps.filter(function (item) { return !item.app.config.shared && item.session !== state.session; });
      owners.forEach(function (item) {
        select.add(new Option('Share the key of ' + item.session + ' (' + item.app.id + ')', item.app.config.key));
      });
      note(box, owners.length
        ? 'Sharing adds this session to an existing key, so one MCP connection controls both sessions.'
        : 'No MCP app on another session to share a key with.');
    }).catch(function (error) { note(box, 'Could not load MCP keys: ' + error.message); });
  }

  function editMode(box, dialog) {
    var input = dialog.querySelector('input#id');
    var id = input ? input.value : '';
    if (!id) { return; }
    mcpApps().then(function (apps) {
      var self = apps.filter(function (item) { return item.app.id === id; })[0];
      if (!self) { return; }
      var others = apps.filter(function (item) {
        return item.app.id !== id && item.app.config.key_id === self.app.config.key_id;
      });
      if (self.app.config.shared) {
        var owner = others.filter(function (item) { return !item.app.config.shared; })[0];
        note(box, owner ? 'This app shares the API key of session ' + owner.session + '.' : 'The shared API key no longer exists - delete and re-create this app.');
      } else if (others.length) {
        note(box, 'This API key is also used by: ' + others.map(function (item) { return item.session; }).join(', ') + '.');
      }
    }).catch(function () {});
  }

  function attach(dialog) {
    var existing = dialog.querySelector('.' + BOX);
    var mode = title(dialog);
    if (!isMcp(dialog) || (mode !== 'Add App' && mode !== 'Edit App')) {
      if (existing) { existing.remove(); state.shareKey = ''; }
      return;
    }
    if (existing && existing.getAttribute('data-mode') === mode) { return; }
    if (existing) { existing.remove(); }
    var anchor = label(dialog, 'App Configuration');
    if (!anchor) { return; }
    var box = document.createElement('div');
    box.className = 'field ' + BOX;
    box.setAttribute('data-mode', mode);
    anchor.insertAdjacentElement('beforebegin', box);
    if (mode === 'Add App') { addMode(box); } else { editMode(box, dialog); }
  }

  var pending = null;
  function scan() {
    pending = null;
    document.querySelectorAll('.p-dialog').forEach(attach);
    // Dialog closed without saving - don't leak the choice into the next save
    if (!document.querySelector('.' + BOX + '[data-mode="Add App"]')) { state.shareKey = ''; }
  }

  new MutationObserver(function () {
    if (pending) { return; }
    pending = setTimeout(scan, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });

  scan();
})();
`;
