// ../../../../../packages/protocol/dist/version.js
var PROVIDER_GLOBAL = "claude";

// ../../../../../packages/protocol/dist/storage.js
var STORAGE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
function isValidStorageKey(key) {
  return typeof key === "string" && STORAGE_KEY_RE.test(key);
}

// ../../../../../packages/protocol/dist/errors.js
var BYOPErrorCode = {
  /** User rejected the connect/consent request. (≈ 4001) */
  USER_REJECTED: 4001,
  /** Origin is not connected / has no grant for this method. (≈ 4100) */
  UNAUTHORIZED: 4100,
  /** Method exists but the origin's scope doesn't cover it (model/tool not granted). */
  SCOPE_EXCEEDED: 4110,
  /** A per-action write consent was denied by the user. */
  CONSENT_DENIED: 4120,
  /** Budget or rate limit hit (tokens/day or calls/min). */
  BUDGET_EXCEEDED: 4290,
  /** Unknown method. (≈ 4200) */
  UNSUPPORTED_METHOD: 4200,
  /** Bad params. (≈ -32602) */
  INVALID_PARAMS: -32602,
  /** The sidekick daemon is not installed / not reachable. The SDK maps this to its
   *  "install the sidekick" fallback. */
  PROVIDER_UNAVAILABLE: 4900,
  /** Backend error (model/tool failed for a non-policy reason). */
  BACKEND_ERROR: 4500
};

// ../../../../../packages/sdk/dist/connect-chip.js
function rungFromError(e) {
  if (e?.code !== BYOPErrorCode.PROVIDER_UNAVAILABLE)
    return null;
  return e?.data?.reason === "unpaired" ? { kind: "unpaired" } : { kind: "unreachable" };
}
var CHROME_STORE_URL = "https://chromewebstore.google.com/detail/injmjolmnekmahlnackakiamjepegagb";
var RELAY_DMG_URL = "https://github.com/sameeeeeeep/switchboard/releases/latest/download/Switchboard.dmg";
var STYLE = `
:host { all: initial; }
* { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
.chip, .btn { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; border: 0;
  font-size: 13px; font-weight: 600; line-height: 1; border-radius: 10px; }
/* The canonical connect lockup \u2014 the SAME mark + wordmark on every wrapp, so users recognize
   "Connect Switchboard" the way they knew the MetaMask button. Dark pill, lime glyph, locked in
   the shadow root so a host app can't restyle it away. */
.btn { padding: 9px 15px 9px 11px; background: #12151C; color: #E8EDF4; border: 1px solid #2C3444; }
.btn.connect:hover { background: #161B24; border-color: #3A4A18; }
.btn.get { color: #C3CAD6; border-color: #262C38; }
.btn.get:hover { color: #E8EDF4; border-color: #3A4353; }
.btn .arr { color: #6E7C90; font-weight: 500; margin-left: -2px; }
/* The Switchboard mark: lime rounded square with the top-right notch (matches the side-panel brand).
   Muted to slate when the sidekick isn't installed yet \u2014 the mark "lights up" once you can connect. */
.glyph { position: relative; width: 16px; height: 16px; border-radius: 5px; background: #C8F250;
  box-shadow: 0 0 12px rgba(200,242,80,.45); flex: none; }
.glyph::after { content: ""; position: absolute; top: 4px; right: 4px; width: 4px; height: 4px;
  border-radius: 50%; background: #0A0C10; }
.btn.get .glyph { background: #6E7C90; box-shadow: none; }
.wrap { position: relative; display: inline-block; }
.chip { background: #1A1F29; border: 1px solid #262C38; padding: 6px 10px 6px 7px; color: #E8EDF4; }
.chip:hover { border-color: #3A4353; }
.av { width: 26px; height: 26px; border-radius: 7px; background: #C8F250; color: #0A0C10; display: grid;
  place-items: center; font-weight: 700; font-size: 12px; overflow: hidden; flex: none; }
.av img { width: 100%; height: 100%; object-fit: cover; }
.who { display: flex; flex-direction: column; gap: 3px; min-width: 0; text-align: left; }
.who .hi { font-size: 12.5px; font-weight: 600; white-space: nowrap; }
.who .proj { font-size: 10.5px; font-weight: 500; color: #99A3B7; white-space: nowrap; }
.caret { color: #6E7C90; font-size: 9px; margin-left: 2px; }
.menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 2147483000; width: 232px;
  background: #1A1F29; border: 1px solid #262C38; border-radius: 12px; padding: 7px;
  box-shadow: 0 18px 40px -20px rgba(0,0,0,.7); }
.menu .lbl { padding: 8px 10px 6px; font-size: 10px; font-weight: 600; letter-spacing: .06em;
  text-transform: uppercase; color: #6E7C90; }
.menu .proj-row { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px;
  background: #20262F; cursor: pointer; border: 0; width: 100%; color: #E8EDF4; font-size: 13px; font-weight: 600; }
.menu .proj-row:hover { background: #262d38; }
.menu .proj-row .go { margin-left: auto; color: #C8F250; font-size: 11px; font-weight: 600; }
.menu .sep { height: 1px; background: #262C38; margin: 6px 4px; }
.menu .item { display: block; width: 100%; text-align: left; padding: 8px 10px; border: 0; border-radius: 8px;
  background: transparent; color: #B4BECE; font-size: 13px; font-weight: 500; cursor: pointer; }
.menu .item:hover { background: #20262F; color: #E8EDF4; }
.menu .foot { padding: 8px 10px 4px; font-size: 11px; font-weight: 500; color: #6E7C90; line-height: 1.4; }
/* Setup-ladder pills (sidekick asleep / unpaired): quiet and informative, never red \u2014 nothing is
   broken. Amber only while the daemon is unreachable; the glyph stays muted until it's reachable. */
.dot { width: 7px; height: 7px; border-radius: 50%; background: #E8B84B; flex: none;
  box-shadow: 0 0 8px rgba(232,184,75,.45); }
.menu .body { padding: 8px 10px 2px; font-size: 12px; font-weight: 500; color: #B4BECE; line-height: 1.45; }
`;
function mountConnect(target, opts = {}) {
  const installUrl = opts.installUrl ?? "https://thelastprompt.ai/switchboard/";
  const host = document.createElement("div");
  host.style.display = "inline-block";
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = STYLE;
  root.append(style);
  const mount = document.createElement("div");
  root.append(mount);
  target.append(host);
  let state2 = { kind: "booting" };
  let menuOpen = false;
  let destroyed = false;
  let relay2 = null;
  let seq = 0;
  let wasConnected = false;
  let lastProjectKey;
  let sessionDisconnected = false;
  const onDocClick = (e) => {
    if (menuOpen && !host.contains(e.target)) {
      menuOpen = false;
      render();
    }
  };
  document.addEventListener("click", onDocClick);
  const initEvent = `${PROVIDER_GLOBAL}#initialized`;
  let lateWatching = false;
  const onLateInit = () => {
    lateWatching = false;
    window.removeEventListener(initEvent, onLateInit);
    if (!destroyed)
      void refresh();
  };
  function watchForLateProvider() {
    if (lateWatching || destroyed)
      return;
    lateWatching = true;
    window.addEventListener(initEvent, onLateInit);
  }
  function el3(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls)
      n.className = cls;
    if (text != null)
      n.textContent = text;
    return n;
  }
  async function refresh() {
    const my = ++seq;
    const r = await whenRelayReady(2500, { installUrl });
    if (destroyed || my !== seq)
      return;
    if (!(r instanceof Relay)) {
      watchForLateProvider();
      state2 = { kind: "not-installed", installUrl };
      return render();
    }
    relay2 = r;
    subscribe(r);
    const h = await r.health();
    if (destroyed || my !== seq)
      return;
    if (h && !h.reachable) {
      state2 = { kind: "unreachable", appMissing: h.installedHere === false };
      emitTransition(false);
      return render();
    }
    if (h && !h.paired) {
      state2 = { kind: "unpaired" };
      emitTransition(false);
      return render();
    }
    let permErr = null;
    const grant = sessionDisconnected ? null : await r.permissions().catch((e) => {
      permErr = e;
      return null;
    });
    if (destroyed || my !== seq)
      return;
    if (!grant) {
      const rung = !h ? rungFromError(permErr) : null;
      if (rung) {
        state2 = rung;
        emitTransition(false);
        return render();
      }
      state2 = { kind: "disconnected", relay: r };
      emitTransition(false);
      return render();
    }
    const wantsContext = opts.context !== "none";
    const [user, project] = await Promise.all([
      r.identity(),
      wantsContext ? r.context.active().catch(() => null) : Promise.resolve(null)
    ]);
    if (destroyed || my !== seq)
      return;
    const wasAlreadyConnected = wasConnected;
    state2 = { kind: "connected", relay: r, user, project };
    emitTransition(true);
    const projKey = project ? project.id ?? project.name : null;
    if (wasAlreadyConnected && lastProjectKey !== void 0 && projKey !== lastProjectKey)
      opts.onProjectChange?.(project);
    lastProjectKey = projKey;
    render();
  }
  function emitTransition(connected) {
    if (connected === wasConnected)
      return;
    wasConnected = connected;
    if (connected && relay2)
      opts.onConnect?.(relay2);
    else if (!connected)
      opts.onDisconnect?.();
  }
  let subscribed = false;
  function subscribe(r) {
    if (subscribed)
      return;
    subscribed = true;
    r.on("permissionsChanged", () => {
      void refresh();
    });
    r.on("disconnect", () => {
      void refresh();
    });
    r.on("health", () => {
      void refresh();
    });
  }
  async function doConnect() {
    if (!relay2)
      return;
    try {
      sessionDisconnected = false;
      await relay2.connect(opts.scope);
      await refresh();
    } catch (e) {
      const err = e;
      if (err?.code !== BYOPErrorCode.PROVIDER_UNAVAILABLE)
        return;
      await refresh();
      if (state2.kind === "disconnected") {
        const rung = rungFromError(err);
        if (rung) {
          state2 = rung;
          emitTransition(false);
          render();
        }
      }
    }
  }
  async function doPick() {
    if (!relay2)
      return;
    menuOpen = false;
    render();
    await relay2.context.pick().catch(() => null);
    await refresh();
  }
  async function doDisconnect() {
    if (!relay2)
      return;
    menuOpen = false;
    sessionDisconnected = true;
    await relay2.disconnect().catch(() => {
    });
    await refresh();
  }
  function render() {
    if (destroyed)
      return;
    mount.textContent = "";
    if (state2.kind === "booting")
      return;
    if (state2.kind === "not-installed") {
      const url = state2.installUrl;
      const wrap2 = el3("div", "wrap");
      const b = el3("button", "btn get");
      b.append(el3("span", "glyph"), el3("span", void 0, "Get Switchboard"), el3("span", "arr", "\u2197"));
      b.onclick = (e) => {
        e.stopPropagation();
        menuOpen = !menuOpen;
        render();
      };
      wrap2.append(b);
      if (menuOpen) {
        const menu = el3("div", "menu");
        menu.append(el3("div", "body", "Two parts: the Chrome extension, then Switchboard for Mac."));
        const store = el3("button", "item", "1 \xB7 Add to Chrome \u2197");
        store.onclick = () => {
          menuOpen = false;
          render();
          window.open(CHROME_STORE_URL, "_blank", "noopener");
        };
        const guide = el3("button", "item", "2 \xB7 Get Switchboard for Mac \u2197");
        guide.onclick = () => {
          menuOpen = false;
          render();
          window.open(url, "_blank", "noopener");
        };
        menu.append(store, guide);
        wrap2.append(menu);
      }
      mount.append(wrap2);
      return;
    }
    if (state2.kind === "unreachable") {
      const appMissing = state2.appMissing === true;
      const wrap2 = el3("div", "wrap");
      const b = el3("button", "btn get");
      b.append(el3("span", "glyph"), el3("span", void 0, appMissing ? "Get Switchboard for Mac" : "Your sidekick is asleep"), el3("span", appMissing ? "arr" : "dot", appMissing ? "\u2197" : void 0), ...appMissing ? [] : [el3("span", "caret", "\u25BE")]);
      b.onclick = (e) => {
        e.stopPropagation();
        menuOpen = !menuOpen;
        render();
      };
      wrap2.append(b);
      if (menuOpen) {
        const menu = el3("div", "menu");
        if (appMissing) {
          menu.append(el3("div", "body", "Extension \u2713 \u2014 now the other half: Switchboard, the Mac app that holds your Claude."));
          const dl = el3("button", "item", "Download Switchboard.dmg \u2197");
          dl.onclick = () => {
            menuOpen = false;
            render();
            window.open(RELAY_DMG_URL, "_blank", "noopener");
          };
          menu.append(dl, el3("div", "sep"));
        } else {
          menu.append(el3("div", "body", "Open the Switchboard menubar app to wake it."));
          const retry = el3("button", "item", "Retry");
          retry.onclick = () => {
            menuOpen = false;
            render();
            void refresh();
          };
          menu.append(retry, el3("div", "sep"));
        }
        const setup = el3("button", "item", "New here? Full setup \u2197");
        setup.onclick = () => {
          menuOpen = false;
          render();
          window.open(installUrl, "_blank", "noopener");
        };
        menu.append(setup);
        wrap2.append(menu);
      }
      mount.append(wrap2);
      return;
    }
    if (state2.kind === "unpaired") {
      const wrap2 = el3("div", "wrap");
      const b = el3("button", "btn connect");
      b.append(el3("span", "glyph"), el3("span", void 0, "Almost there \u2014 pair in the side panel"), el3("span", "caret", "\u25BE"));
      b.onclick = (e) => {
        e.stopPropagation();
        menuOpen = !menuOpen;
        render();
      };
      wrap2.append(b);
      if (menuOpen) {
        const menu = el3("div", "menu");
        menu.append(el3("div", "body", "Click the Switchboard icon in your Chrome toolbar and paste your pairing token."));
        const retry = el3("button", "item", "Retry");
        retry.onclick = () => {
          menuOpen = false;
          render();
          void refresh();
        };
        menu.append(retry);
        wrap2.append(menu);
      }
      mount.append(wrap2);
      return;
    }
    if (state2.kind === "disconnected") {
      const b = el3("button", "btn connect");
      b.append(el3("span", "glyph"), el3("span", void 0, "Connect Switchboard"));
      b.onclick = doConnect;
      mount.append(b);
      return;
    }
    const { user, project } = state2;
    const rawName = user?.name?.trim();
    const collides = !!rawName && !!project?.name && rawName.toLowerCase() === project.name.toLowerCase();
    const name = !rawName || collides ? "there" : rawName;
    const wrap = el3("div", "wrap");
    const chip = el3("button", "chip");
    const av = el3("div", "av");
    if (user?.avatar) {
      const img = el3("img");
      img.src = user.avatar;
      img.alt = name;
      av.append(img);
    } else
      av.textContent = name.charAt(0).toUpperCase();
    const wantsContext = opts.context !== "none";
    const who = el3("div", "who");
    who.append(el3("div", "hi", `Hi ${name}`));
    who.append(el3("div", "proj", wantsContext ? project ? project.name : "No context lent" : "Connected"));
    chip.append(av, who, el3("span", "caret", "\u25BE"));
    chip.onclick = (e) => {
      e.stopPropagation();
      menuOpen = !menuOpen;
      render();
    };
    wrap.append(chip);
    if (menuOpen) {
      const menu = el3("div", "menu");
      if (wantsContext) {
        menu.append(el3("div", "lbl", "Working on"));
        const row = el3("button", "proj-row");
        row.append(el3("span", void 0, project ? project.name : "Choose a context"));
        row.append(el3("span", "go", project ? "Switch \u25B8" : "Choose \u25B8"));
        row.onclick = doPick;
        menu.append(row, el3("div", "sep"));
      }
      const dc = el3("button", "item", "Disconnect this app");
      dc.onclick = doDisconnect;
      menu.append(dc);
      menu.append(el3("div", "foot", "Connectors, budgets & activity live in the Switchboard toolbar panel."));
      wrap.append(menu);
    }
    mount.append(wrap);
  }
  render();
  void refresh();
  return {
    refresh: () => void refresh(),
    destroy: () => {
      destroyed = true;
      document.removeEventListener("click", onDocClick);
      window.removeEventListener(initEvent, onLateInit);
      host.remove();
    }
  };
}

// ../../../../../packages/sdk/dist/index.js
var warnedStorageKeys = /* @__PURE__ */ new Set();
function warnBadStorageKey(key) {
  if (isValidStorageKey(key) || warnedStorageKeys.has(key))
    return;
  warnedStorageKeys.add(key);
  const suggestion = String(key).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[^A-Za-z0-9]+/, "") || "key";
  console.warn(`[relay.storage] invalid key ${JSON.stringify(key)} \u2014 this write/read WILL be rejected by the daemon and silently do nothing.
  Keys map 1:1 to files (<key>.json) in this origin's folder, so they must match ${STORAGE_KEY_RE}.
  ":" is not allowed (illegal on NTFS; "a:b" is Alternate Data Stream syntax on Windows). Try ${JSON.stringify(suggestion)}.`);
}
var Relay = class {
  provider;
  constructor(provider) {
    this.provider = provider;
  }
  get version() {
    return this.provider.version;
  }
  capabilities() {
    return this.provider.request({ method: "claude_capabilities" });
  }
  connect(scope) {
    return this.provider.request({ method: "claude_connect", params: scope });
  }
  /** Drop this app's connection for the current page session. The grant persists (a later connect()
   *  won't reprompt) — this is "disconnect from this tab", not "revoke". Full revoke lives in the panel. */
  disconnect() {
    return this.provider.request({ method: "claude_disconnect" });
  }
  permissions() {
    return this.provider.request({ method: "claude_permissions" });
  }
  /** The setup-ladder snapshot (reachable/paired/connected), answered by the EXTENSION from its
   *  own state — never the daemon — so it resolves fast (<1s) in every degraded state, including
   *  the ones where every other method would hang. Resolves null when the extension is too old to
   *  know `claude_health` (or its worker is unreachable): callers MUST treat null as "unknown"
   *  and fall back to probing permissions() exactly as before — that skew guard is load-bearing
   *  while store users run an older extension against newer app bundles. */
  health() {
    const answer = this.provider.request({ method: "claude_health" }).catch(() => null);
    const timer = new Promise((resolve) => setTimeout(() => resolve(null), 1500));
    return Promise.race([answer, timer]);
  }
  /** The paired user's public identity (name/avatar), or null if unavailable. Convenience over
   *  capabilities().user — what the connect chip greets with ("Hi Sameep"). */
  identity() {
    return this.capabilities().then((c) => c.user ?? null).catch(() => null);
  }
  /** Synthesize speech ON-DEVICE via a local model/engine (no cloud, no connector, no credits).
   *  Returns audio as a playable data: URL, or null if no local TTS is available.
   *
   *    const clip = await relay.speak("hey, it's Maya");
   *    if (clip) new Audio(clip.audio).play();
   */
  speak(text, opts) {
    return this.provider.request({ method: "claude_speak", params: { text, voice: opts?.voice } }).catch(() => null);
  }
  listTools() {
    return this.provider.request({ method: "claude_listTools" }).then((r) => r.tools);
  }
  callTool(name, args) {
    const call = { name, arguments: args };
    return this.provider.request({ method: "claude_callTool", params: call });
  }
  complete(params) {
    return this.provider.request({ method: "claude_complete", params });
  }
  /** Streamed completion as an async iterator of deltas. Ends after a `done`/`error` delta. */
  async *stream(params) {
    const { streamId } = await this.provider.request({ method: "claude_stream", params });
    const queue = [];
    let notify = null;
    let ended = false;
    const handler = (payload) => {
      const p = payload;
      if (p.streamId !== streamId)
        return;
      queue.push(p);
      if (p.type === "done" || p.type === "error")
        ended = true;
      notify?.();
    };
    this.provider.on("delta", handler);
    try {
      while (true) {
        if (queue.length === 0) {
          if (ended)
            break;
          await new Promise((r) => notify = r);
          notify = null;
          continue;
        }
        yield queue.shift();
      }
    } finally {
      this.provider.removeListener("delta", handler);
    }
  }
  on(event, handler) {
    this.provider.on(event, handler);
  }
  /**
   * Per-origin local storage — a private on-disk key/value store for this app, plus `bind` to point
   * it at a real folder the user picks. Values are opaque strings (store JSON). Isolated per origin;
   * reads are free, writes need the site not to be read-only, and `bind` prompts for the exact path.
   *
   *   await relay.storage.set("workspace", JSON.stringify(data));
   *   const raw = await relay.storage.get("workspace");
   *   await relay.storage.bind("~/Documents/Projects/brandbrain/.data"); // existing files appear as records
   */
  get storage() {
    const req = (params) => this.provider.request({ method: "claude_storage", params });
    const k = (key) => {
      warnBadStorageKey(key);
      return key;
    };
    return {
      get: (key) => req({ op: "get", key: k(key) }).then((r) => r.value ?? null),
      set: (key, value) => req({ op: "set", key: k(key), value }).then(() => void 0),
      delete: (key) => req({ op: "delete", key: k(key) }).then((r) => r.ok),
      list: () => req({ op: "list" }).then((r) => r.keys ?? []),
      info: () => req({ op: "info" }).then((r) => r.info),
      /** Point this app's store at a real folder (triggers a path-consent click). */
      bind: (path) => req({ op: "bind", path }).then((r) => r.info),
      /** Open a NATIVE folder chooser on the daemon's machine (macOS today). The user picking a
       *  folder in an OS dialog that names this origin IS the path consent, so a successful pick
       *  comes back already bound. Resolves undefined on cancel or when no native picker exists —
       *  keep a typed-path `bind` as the fallback UI. */
      pick: (reason) => req({ op: "pick", reason }).then((r) => r.info).catch(() => void 0)
    };
  }
  /**
   * Shared, cross-app context — your portable brand knowledge. Publish a whole context; read the one
   * the user selected for this app; or open the picker. Selection happens in the side panel, so an
   * app only ever receives the context the user chose to lend it — never the whole library.
   *
   *   await relay.context.publish({ name: "Aamras", kind: "brand", data: brand });
   *   const active = await relay.context.active();   // the brand the user loaded for this app, or null
   */
  get context() {
    const req = (params) => this.provider.request({ method: "claude_context", params });
    return {
      publish: (context) => req({ op: "publish", context }).then((r) => r.id),
      list: () => req({ op: "list" }).then((r) => r.contexts ?? []),
      active: () => req({ op: "active" }).then((r) => r.context ?? null),
      pick: () => req({ op: "pick" }).then((r) => r.context ?? null),
      /** Read ONE context listed via `list()` in full, and make it this app's selection. Needs the
       *  kind granted at connect (ScopeRequest.contextKinds) — powers in-app brand dropdowns. */
      use: (id) => req({ op: "use", id }).then((r) => r.context ?? null)
    };
  }
};
var DEFAULT_INSTALL_URL = "https://thelastprompt.ai/switchboard/";
function getRelay(opts) {
  const provider = globalThis[PROVIDER_GLOBAL];
  if (provider?.isRelay)
    return new Relay(provider);
  return { installed: false, installUrl: opts?.installUrl ?? DEFAULT_INSTALL_URL };
}
function whenRelayReady(timeoutMs = 3e3, opts) {
  const now = getRelay(opts);
  if (now instanceof Relay)
    return Promise.resolve(now);
  return new Promise((resolve) => {
    const onInit = () => {
      cleanup();
      resolve(getRelay(opts));
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve({ installed: false, installUrl: opts?.installUrl ?? DEFAULT_INSTALL_URL });
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener(`${PROVIDER_GLOBAL}#initialized`, onInit);
    }
    window.addEventListener(`${PROVIDER_GLOBAL}#initialized`, onInit);
  });
}

// src/store/bankit.js
var CSS = `
.bankit{font:inherit;font-size:11px;line-height:1;letter-spacing:.01em;display:inline-flex;align-items:center;
  gap:.42em;padding:.45em .68em;margin-left:.2em;border:1px solid currentColor;border-radius:999px;
  background:transparent;color:inherit;opacity:.55;cursor:pointer;vertical-align:middle;
  transition:opacity .14s ease;white-space:nowrap;font-weight:500;}
.bankit:hover:not(:disabled){opacity:1;}
.bankit:disabled{cursor:default;}
.bankit.is-done{opacity:.78;}
.bankit.is-bad{opacity:.9;}
.bankit-offer{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-top:12px;padding:12px 14px;
  border:1px dashed currentColor;border-radius:10px;opacity:.92;font-size:12.5px;line-height:1.5;}
.bankit-offer .bo-main{flex:1 1 240px;min-width:0;}
.bankit-offer .bo-line{font-weight:600;}
.bankit-offer .bo-sub{opacity:.62;font-size:11.5px;margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.bankit-offer .bo-sw{width:11px;height:11px;border-radius:3px;display:inline-block;}
.bankit-offer .bo-acts{display:flex;align-items:center;gap:8px;flex:0 0 auto;}
.bankit-offer button{font:inherit;font-size:11.5px;padding:.5em .8em;border-radius:7px;cursor:pointer;
  border:1px solid currentColor;background:transparent;color:inherit;}
.bankit-offer button.bo-use{background:currentColor;}
.bankit-offer button.bo-use span{filter:invert(1) grayscale(1) contrast(3);}
.bankit-offer button.bo-skip{opacity:.62;}
.bankit-offer button.bo-skip:hover{opacity:1;}
`;
function injectCss() {
  if (typeof document === "undefined" || document.getElementById("bankit-css")) return;
  const s = document.createElement("style");
  s.id = "bankit-css";
  s.textContent = CSS;
  (document.head || document.documentElement).append(s);
}
var el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
var slugId = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
var nameKey = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
function hostOf(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : "https://" + raw).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split("/")[0].replace(/^www\./i, "").toLowerCase();
  }
}
var GENERIC = /* @__PURE__ */ new Set([
  "com",
  "co",
  "net",
  "org",
  "io",
  "ai",
  "app",
  "dev",
  "shop",
  "store",
  "xyz",
  "me",
  "us",
  "uk",
  "in",
  "eu",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "au",
  "ca",
  "jp",
  "example",
  "test",
  "local",
  "myshopify",
  "webflow",
  "squarespace",
  "wixsite",
  "github",
  "vercel",
  "netlify",
  "pages"
]);
function siteKey(host) {
  const parts = String(host || "").toLowerCase().split(".").filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) if (!GENERIC.has(parts[i])) return parts[i];
  return parts[0] || "";
}
function matchBankedByUrl(metas, url, kind = "brand") {
  const key = siteKey(hostOf(url));
  if (!key || key.length < 3) return null;
  const pool = (metas || []).filter((m) => m && (m.kind || "").toLowerCase() === String(kind).toLowerCase());
  return pool.find((m) => nameKey(m.name) === key) || pool.find((m) => {
    const n = nameKey(m.name);
    return n.length >= 4 && (n.includes(key) || key.includes(n));
  }) || null;
}
async function listContexts(relay2) {
  if (!relay2 || !relay2.context || typeof relay2.context.list !== "function") return [];
  try {
    const metas = await relay2.context.list();
    return Array.isArray(metas) ? metas : [];
  } catch {
    return [];
  }
}
async function findBankedForUrl(relay2, url, kind = "brand") {
  if (!url) return null;
  return matchBankedByUrl(await listContexts(relay2), url, kind);
}
async function useContext(relay2, id) {
  if (!relay2 || !relay2.context || typeof relay2.context.use !== "function") return null;
  try {
    return await relay2.context.use(id) || null;
  } catch {
    return null;
  }
}
function mountBankIt(mount, opts = {}) {
  const { relay: relay2, kind, draft, contexts, onPublished } = opts;
  if (!mount || !relay2 || !relay2.context || typeof relay2.context.publish !== "function") return null;
  if (!draft || !String(draft.name || "").trim() || !kind) return null;
  injectCss();
  const name = String(draft.name).trim();
  const id = String(draft.id || slugId(name) || slugId(kind + "-" + name));
  if (!id) return null;
  const already = (contexts || []).some((c) => {
    if (!c || (c.kind || "").toLowerCase() !== String(kind).toLowerCase()) return false;
    return c.id === id || nameKey(c.name) === nameKey(name);
  });
  const btn = el("button", "bankit");
  btn.type = "button";
  const label = (t) => {
    btn.textContent = t;
  };
  if (already) {
    btn.classList.add("is-done");
    label("already in your library \u2713 \xB7 update it");
    btn.title = `re-publishes ${name} over the copy already in your Switchboard library \u2014 same entry, refreshed`;
  } else {
    label(`\u2191 Bank ${name} \u2014 every app can borrow it`);
    btn.title = "puts it in your Switchboard library; each app still asks before it can use it.";
  }
  btn.addEventListener("click", async () => {
    if (btn.disabled) return;
    const prev = btn.textContent;
    btn.disabled = true;
    btn.classList.remove("is-bad");
    label("banking\u2026");
    try {
      await relay2.context.publish({ id, name, kind, data: draft.data || {} });
      btn.classList.add("is-done");
      label("in your library \u2713");
      if (typeof onPublished === "function") {
        onPublished({ id, name, kind, updatedAt: Date.now() });
      }
    } catch (e) {
      btn.disabled = false;
      btn.classList.add("is-bad");
      label(prev);
      btn.title = "couldn't bank it \u2014 " + String(e?.message || e).slice(0, 140);
    }
  });
  mount.append(btn);
  return btn;
}
function mountBorrowOffer(mount, opts = {}) {
  if (!mount) return null;
  injectCss();
  const { name, detail, swatches, onUse, onDismiss } = opts;
  const label = String(name || "that brand");
  mount.textContent = "";
  const box = el("div", "bankit-offer");
  const main = el("div", "bo-main");
  main.append(el("div", "bo-line", `you've already banked ${label} \u2014 use that instead of re-reading the site?`));
  const sub = el("div", "bo-sub");
  sub.append(el("span", null, detail || "from your Switchboard library"));
  for (const c of (swatches || []).slice(0, 4)) {
    const sw = el("span", "bo-sw");
    sw.style.background = c;
    sw.title = String(c);
    sub.append(sw);
  }
  main.append(sub);
  const acts = el("div", "bo-acts");
  const use = el("button", "bo-use");
  use.type = "button";
  use.append(el("span", null, `use ${label}`));
  const skip = el("button", "bo-skip", "read the site anyway");
  skip.type = "button";
  const close = () => {
    mount.textContent = "";
    mount.hidden = true;
  };
  use.addEventListener("click", () => {
    close();
    if (typeof onUse === "function") onUse();
  });
  skip.addEventListener("click", () => {
    close();
    if (typeof onDismiss === "function") onDismiss();
  });
  acts.append(use, skip);
  box.append(main, acts);
  mount.append(box);
  mount.hidden = false;
  return box;
}
function clearBorrowOffer(mount) {
  if (!mount) return;
  mount.textContent = "";
  mount.hidden = true;
}

// src/kit/storekey.js
function migrateLocalKey(oldKey, newKey) {
  if (oldKey === newKey) return;
  try {
    if (localStorage.getItem(newKey) !== null) {
      localStorage.removeItem(oldKey);
      return;
    }
    const old = localStorage.getItem(oldKey);
    if (old === null) return;
    localStorage.setItem(newKey, old);
    localStorage.removeItem(oldKey);
  } catch {
  }
}

// src/adforge.js
var $ = (id) => document.getElementById(id);
var INSTALL_URL = "https://thelastprompt.ai/switchboard/";
var STORE_KEY = "adforge-state";
migrateLocalKey("adforge:state", STORE_KEY);
var SAMPLE_URL = "https://www.allbirds.com";
var ANGLE_IDEAS = ["UGC hook", "Problem \u2192 agitate \u2192 solve", "Founder story", "Offer-led urgency"];
var CTAS = ["Shop Now", "Learn More", "Get Offer", "Sign Up"];
var URL_RE = /(https?:\/\/[^\s"')]+\.(?:png|jpe?g|webp))|"(?:rawUrl|url|minUrl)"\s*:\s*"([^"]+)"/i;
var relay = null;
var notInstalled = false;
var forging = false;
var casting = false;
var lastAction = null;
var lent = null;
var urlRevealed = false;
var autoForgeKey = null;
var libraryMetas = [];
var borrowSkipped = "";
var state = {
  url: SAMPLE_URL,
  steer: "",
  // the one optional knob — a free-text angle steer
  source: "url",
  // "brand" (lent context) | "url" — what the current concepts came from
  brand: null,
  // {name, product, tone, audience, colors} the concepts were forged from
  concepts: [],
  picked: -1,
  aspect: "1:1",
  images: {},
  // real generated URLs, keyed "1:1" / "4:5" — reset on new pick
  sample: false,
  siteCache: null,
  // WebFetch result text, so "Regenerate" skips the re-read
  siteCacheUrl: null
};
var SAMPLE = {
  url: SAMPLE_URL,
  brand: {
    name: "Allbirds",
    product: "Merino wool and tree-fiber sneakers with the carbon footprint printed on them",
    tone: "warm, low-key, planet-first confidence",
    colors: ["#212A2F", "#9BC0B2", "#F4F1EA"]
  },
  concepts: [
    {
      name: "The Barefoot Commute",
      angle: "UGC hook",
      hook: "I forgot I was wearing shoes on my 6am flight.",
      primaryText: "I forgot I was wearing shoes on my 6am flight.\n\nNot an exaggeration. I put my Wool Runners on at 4am, hit two airports and a full day of meetings, and never once thought about my feet.\n\nThey're merino wool, so they breathe when it's hot and hold heat when it's cold. No socks needed. And when they finally look like they've been through a war? Straight into the washing machine.\n\nComfiest shoes I've ever owned \u2014 and the carbon footprint is printed right on the sole.",
      headline: "The World's Most Comfortable Shoe",
      description: "Machine washable. 30-day trial",
      cta: "Shop Now",
      imagePrompt: "Candid smartphone photo of light grey merino wool sneakers propped on an airport window ledge at sunrise, boarding pass tucked into one shoe, warm golden light, slightly imperfect framing, authentic UGC feel",
      recommended: true
    },
    {
      name: "The Hot Feet Fix",
      angle: "Problem \u2192 agitate \u2192 solve",
      hook: "Your feet aren't tired. They're overheating.",
      primaryText: "Your feet aren't tired. They're overheating.\n\nSynthetic sneakers trap heat and sweat all day, and by 3pm you can feel it \u2014 that swampy, restless, get-me-out-of-these-shoes feeling.\n\nWool Runners are knit from superfine merino. It wicks moisture, breathes with every step, and regulates temperature the way plastic never will.\n\nCool when it's warm. Warm when it's cool. Comfortable always.\n\nYour afternoon feet will notice before you do.",
      headline: "Wool That Breathes All Day",
      description: "Cool in heat. Warm in cold.",
      cta: "Learn More",
      imagePrompt: "Clean studio photograph of a single light wool sneaker floating above a cool sage-green surface with soft wisps of vapor rising around it, diffuse minimalist product lighting",
      recommended: false
    },
    {
      name: "Carbon Math",
      angle: "Offer-led urgency",
      hook: "Most brands hide their footprint. Ours is printed on the shoe.",
      primaryText: "Most brands hide their footprint. Ours is printed on the shoe.\n\nEvery pair of Allbirds carries a carbon number the way food carries calories. We measure it, we cut it, and we offset the rest to zero.\n\nThe shoes also happen to be ridiculously comfortable \u2014 soft merino wool, machine washable, no-sock friendly.\n\nFree shipping on orders over $75 and free returns for 30 days, no questions. If they're not the comfiest shoes you own, send them back.",
      headline: "Sneakers That Show Their Math",
      description: "Free shipping over $75.",
      cta: "Get Offer",
      imagePrompt: "Overhead flat-lay of natural white wool sneakers on raw kraft paper beside hand-drawn carbon footprint sketches and a single green leaf, warm natural window light, sustainable-brand editorial style",
      recommended: false
    }
  ]
};
function save() {
  state.savedAt = Date.now();
  const payload = JSON.stringify({
    url: state.url,
    steer: state.steer,
    source: state.source,
    brand: state.brand,
    concepts: state.concepts,
    picked: state.picked,
    aspect: state.aspect,
    images: state.images,
    sample: state.sample,
    savedAt: state.savedAt,
    siteCache: state.siteCache ? state.siteCache.slice(0, 12e3) : null,
    siteCacheUrl: state.siteCacheUrl
  });
  try {
    localStorage.setItem(STORE_KEY, payload);
  } catch {
  }
  if (relay && relay.storage && typeof relay.storage.set === "function") {
    try {
      void relay.storage.set(STORE_KEY, payload).catch(() => {
      });
    } catch {
    }
  }
}
function coerceState() {
  if (typeof state.url !== "string" || !state.url) state.url = SAMPLE_URL;
  if (typeof state.steer !== "string") state.steer = "";
  if (state.source !== "brand") state.source = "url";
  if (!Array.isArray(state.concepts)) state.concepts = [];
  if (!state.images || typeof state.images !== "object") state.images = {};
  if (state.aspect !== "4:5") state.aspect = "1:1";
  if (typeof state.savedAt !== "number") state.savedAt = 0;
  if (!(Number.isInteger(state.picked) && state.picked >= 0 && state.picked < state.concepts.length)) state.picked = -1;
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && typeof s === "object") Object.assign(state, s);
  } catch {
  }
  coerceState();
}
load();
async function syncFromRelayStorage() {
  if (!relay || !relay.storage || typeof relay.storage.get !== "function") return;
  let raw = null, parsed = null;
  try {
    raw = await relay.storage.get(STORE_KEY);
    parsed = JSON.parse(raw);
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== "object") return;
  if ((parsed.savedAt || 0) <= (state.savedAt || 0)) return;
  Object.assign(state, parsed);
  coerceState();
  try {
    localStorage.setItem(STORE_KEY, raw);
  } catch {
  }
  resetExpanded();
  $("f-url").value = state.url;
  $("steer").value = state.steer;
  renderEntry();
  if (state.concepts.length) {
    renderConcepts();
    $("concepts-sec").hidden = false;
  } else {
    $("cards").textContent = "";
    $("concepts-sec").hidden = true;
  }
  renderStudio();
}
var el2 = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
var str = (v, fb) => typeof v === "string" && v.trim() ? v.trim() : fb;
var cur = () => state.picked >= 0 ? state.concepts[state.picked] : null;
var resultText = (d) => (d.result?.content ?? []).map((c) => c.text ?? "").join("");
var extractUrl = (t) => {
  const m = (t || "").match(URL_RE);
  return m ? m[1] || m[2] || m[0] : null;
};
function domainOf(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return (u || "").replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "").toUpperCase() || "EXAMPLE.COM";
  }
}
function normHex(v) {
  let x = String(v || "").trim();
  if (x && x[0] !== "#") x = "#" + x;
  const m = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(x);
  if (!m) return null;
  let h = m[1];
  if (h.length <= 4) h = h.split("").map((ch) => ch + ch).join("");
  return "#" + h.slice(0, 6).toLowerCase();
}
function lum(hex) {
  const h = normHex(hex);
  if (!h) return 0;
  const n = parseInt(h.slice(1), 16);
  return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
}
var escXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
function normalizeBrand(ctx) {
  const d = ctx && ctx.data || {};
  const arr = (v) => Array.isArray(v) ? v.filter(Boolean).map(String) : [];
  const rich = Array.isArray(d.paletteRich) ? d.paletteRich.map((p) => p && (p.hex || p.color || p.value)).filter(Boolean).map(String) : [];
  const flat = arr(d.palette).length ? arr(d.palette) : rich;
  return {
    name: str(ctx && ctx.name, str(d.name, "Brand")),
    voice: String(d.voice || d.vibe || "").trim(),
    positioning: String(d.positioning || "").trim(),
    audience: String(d.audience || "").trim(),
    palette: flat.map(normHex).filter(Boolean).slice(0, 6),
    products: arr(d.products).length ? arr(d.products) : arr(d.range)
  };
}
function clearBrandConcepts() {
  state.brand = null;
  state.concepts = [];
  state.picked = -1;
  state.images = {};
  save();
  $("concepts-sec").hidden = true;
  $("studio-sec").hidden = true;
}
function wipeSample() {
  if (!state.sample) return;
  state.brand = null;
  state.concepts = [];
  state.picked = -1;
  state.images = {};
  state.sample = false;
  save();
  $("concepts-sec").hidden = true;
  $("studio-sec").hidden = true;
}
async function loadBrandCtx() {
  if (!relay || !relay.context || typeof relay.context.active !== "function") {
    lent = null;
    return;
  }
  try {
    const ctx = await relay.context.active();
    lent = ctx ? normalizeBrand(ctx) : null;
  } catch {
    lent = null;
  }
  libraryMetas = await listContexts(relay);
  if (!lent && libraryMetas.length && typeof relay.context.use === "function") {
    const brands = libraryMetas.filter((m) => (m.kind || "").toLowerCase() === "brand");
    if (brands.length) {
      const ctx = await useContext(relay, brands[0].id);
      lent = ctx ? normalizeBrand(ctx) : null;
    }
  }
  if (lent && state.sample) wipeSample();
}
function maybeAutoForge() {
  if (!relay || !lent || forging || casting || state.sample) return;
  if (autoForgeKey === lent.name) return;
  autoForgeKey = lent.name;
  if (state.source === "brand" && state.brand && state.brand.name === lent.name && state.concepts.length > 0) {
    return;
  }
  void forgeRun({ mode: "brand", note: "forging from your lent brand automatically \u2014 steer + Regenerate to redirect" });
}
async function pickBrand(btn) {
  if (!relay || !relay.context || typeof relay.context.pick !== "function") {
    showError("This Switchboard build has no context picker \u2014 update the extension.", null);
    return;
  }
  const was = btn.textContent;
  btn.textContent = "choosing in Switchboard\u2026";
  btn.disabled = true;
  try {
    const ctx = await relay.context.pick();
    if (ctx) {
      const next = normalizeBrand(ctx);
      if (state.source === "brand" && (!lent || next.name !== lent.name)) clearBrandConcepts();
      lent = next;
      urlRevealed = false;
      autoForgeKey = null;
      if (state.sample) wipeSample();
    }
  } catch (err) {
    showError("Brand pick failed: " + (err?.message || err), null);
  } finally {
    btn.textContent = was;
    btn.disabled = false;
    renderEntry();
    reflect();
    maybeAutoForge();
  }
}
function logLine(text, cls) {
  $("forgelog").hidden = false;
  const d = el2("div", "logline" + (cls ? " " + cls : ""), text);
  $("log").append(d);
  $("log").scrollTop = $("log").scrollHeight;
  return d;
}
function clearLog() {
  $("log").textContent = "";
}
function showError(msg, retryFn) {
  lastAction = retryFn || null;
  $("errbox").hidden = false;
  $("err-msg").textContent = msg;
  $("err-retry").hidden = !retryFn;
}
function hideError() {
  $("errbox").hidden = true;
}
$("err-retry").addEventListener("click", () => {
  hideError();
  if (lastAction) lastAction();
});
mountConnect($("chip-dock"), {
  scope: {
    reason: "forge Meta ads from your lent brand or a site you name \u2014 and offer to bank what it reads off that site as a brand in your library",
    tools: ["WebFetch", "mcp__claude_ai_Higgsfield__*"],
    models: ["sonnet"],
    // Lets loadBrandCtx auto-select a brand via list()+use() when nothing is lent. NOT relied
    // on for returning users: reused grants are exact-match and ignore newly requested kinds,
    // so every list()/use() caller tolerates an empty result or a throw.
    contextKinds: ["brand"]
  },
  installUrl: INSTALL_URL,
  onConnect: async (r) => {
    relay = r;
    wipeSample();
    await loadBrandCtx();
    await syncFromRelayStorage();
    renderEntry();
    reflect();
    maybeAutoForge();
  },
  onDisconnect: () => {
    relay = null;
    lent = null;
    autoForgeKey = null;
    renderEntry();
    reflect();
  },
  // The chip's own "Switch" menu runs context.pick() itself — without this hook the chip would
  // show the new brand while the entry card, forge button, and concepts still carried the old
  // one. Re-read the lent brand and apply the same stale-concept clearing pickBrand does
  // (persona.js idiom: onProjectChange re-runs the brand load).
  onProjectChange: async () => {
    const prev = lent;
    await loadBrandCtx();
    const changed = (prev && prev.name) !== (lent && lent.name);
    if (changed) autoForgeKey = null;
    if (state.source === "brand" && changed) clearBrandConcepts();
    renderEntry();
    reflect();
    maybeAutoForge();
  }
});
(async () => {
  const r = await whenRelayReady(2e3, { installUrl: INSTALL_URL });
  if (r && "connect" in r) {
    const grant = await r.permissions().catch(() => null);
    if (grant) {
      relay = r;
      wipeSample();
      await loadBrandCtx();
      await syncFromRelayStorage();
    }
  } else {
    notInstalled = true;
  }
  renderEntry();
  reflect();
  maybeAutoForge();
})();
function renderEntry() {
  const hasBrand = !!(relay && lent);
  $("brand-entry").hidden = !hasBrand;
  $("url-entry").hidden = hasBrand && !urlRevealed;
  $("use-brand").hidden = hasBrand;
  $("sample").hidden = !!relay;
  $("url-toggle").textContent = urlRevealed ? "hide the URL path" : "or forge from a site URL instead";
  $("url-sample-note").hidden = $("f-url").value.trim() !== SAMPLE_URL;
  if (hasBrand) {
    $("b-name").textContent = lent.name;
    const line = $("b-line");
    line.textContent = "";
    const bits = [lent.positioning || lent.voice, lent.audience ? "for " + lent.audience : ""].filter(Boolean).join(" \xB7 ");
    if (bits) line.append(document.createTextNode(bits + " "));
    for (const c of lent.palette.slice(0, 4)) {
      const sw = el2("span", "sw");
      sw.style.background = c;
      sw.title = c;
      line.append(sw);
    }
  }
}
function reflect() {
  const busy = forging || casting;
  const on = !!relay;
  $("cards").classList.toggle("busy", busy);
  $("forge").disabled = !on || busy;
  $("forge").textContent = forging ? "Forging\u2026" : "Forge concepts";
  $("forge-brand").disabled = !on || busy;
  $("forge-brand").textContent = forging ? "Forging\u2026" : `Forge ads for ${lent ? lent.name : "your brand"}`;
  $("use-brand").disabled = !on || busy;
  $("switch-brand").disabled = busy;
  $("regen-concepts").disabled = !on || busy;
  $("regen-copy").disabled = !on || busy || state.picked < 0;
  $("cast").disabled = !on || busy || state.picked < 0;
  $("recast").disabled = !on || busy || state.picked < 0;
  $("asp-11").disabled = busy;
  $("asp-45").disabled = busy;
  $("cast").hidden = !!state.images[state.aspect];
  const hint = $("conn-hint");
  hint.textContent = "";
  if (on) {
    hint.textContent = "runs on your Claude \u2014 the site read and every render are yours";
  } else if (notInstalled) {
    hint.append("Switchboard isn't installed \u2014 ");
    const a = el2("a", null, "get it here");
    a.href = INSTALL_URL;
    a.target = "_blank";
    a.rel = "noreferrer";
    hint.append(a, " to fire the forge.");
  } else {
    hint.textContent = "connect Switchboard (top right) to forge \u2014 the sample works now";
  }
}
$("f-url").value = state.url;
$("f-url").addEventListener("input", () => {
  state.url = $("f-url").value.trim();
  save();
  $("url-sample-note").hidden = state.url !== SAMPLE_URL;
});
$("f-url").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("forge").click();
});
$("steer").value = state.steer;
$("steer").addEventListener("input", () => {
  state.steer = $("steer").value;
  save();
});
$("url-toggle").addEventListener("click", () => {
  urlRevealed = !urlRevealed;
  renderEntry();
});
$("switch-brand").addEventListener("click", () => pickBrand($("switch-brand")));
$("use-brand").addEventListener("click", () => pickBrand($("use-brand")));
var CONCEPT_SHAPE = '{"concepts":[exactly 3 items, each {"name":string (2-4 word concept name),"angle":string,"hook":string (the scroll-stopping first line),"primaryText":string (Meta primary text, at most 125 words, short paragraphs separated by \\n\\n, the hook as its first line),"headline":string (max 40 characters),"description":string (max 30 characters),"cta":"Shop Now"|"Learn More"|"Get Offer"|"Sign Up","imagePrompt":string (vivid art-direction prompt for the ad hero image \u2014 no text, no logos in the image),"recommended":boolean}]}';
function steerLine() {
  const steer = state.steer.trim();
  return steer ? `Steer all three concepts with this direction: "${steer}". Set each concept's "angle" to a 2-4 word label for the angle it takes.` : `Take 3 distinct angles (e.g. ${ANGLE_IDEAS.join("; ")}) \u2014 a different one per concept \u2014 and set each concept's "angle" accordingly.`;
}
function freshLine(priorNames) {
  return priorNames && priorNames.length ? `These concept names were already used \u2014 produce three NEW concepts with different hooks and names: ${priorNames.join(", ")}.` : "";
}
function buildBrandForgePrompt(b, priorNames) {
  return [
    "You are AdForge, a direct-response creative director who writes Meta (Facebook/Instagram) feed ads that stop thumbs.",
    "The brand is already known \u2014 do NOT call WebFetch or any other tool. Work only from this brand context:",
    `Brand: ${b.name}`,
    b.positioning ? `Positioning: ${b.positioning}` : "",
    b.voice ? `Voice \u2014 write ALL copy in this voice: ${b.voice}` : "",
    b.audience ? `Audience \u2014 speak straight to them: ${b.audience}` : "",
    b.products.length ? `Products: ${b.products.join("; ")}` : "",
    b.palette.length ? `Brand palette \u2014 fold these into each imagePrompt's art direction: ${b.palette.join(", ")}` : "",
    "Respond with ONLY a JSON object \u2014 no prose before or after, no markdown fences \u2014 in exactly this shape:",
    CONCEPT_SHAPE,
    steerLine(),
    'Exactly ONE concept must have "recommended": true \u2014 the one you would run first.',
    freshLine(priorNames)
  ].filter(Boolean).join("\n");
}
function buildUrlForgePrompt(url, cachedText, priorNames) {
  const read = cachedText ? `Here is the page content, already fetched \u2014 do NOT call WebFetch:
"""
${cachedText}
"""` : `First use WebFetch to read ${url} \u2014 one fetch of that page is enough.`;
  return [
    "You are AdForge, a direct-response creative director who writes Meta (Facebook/Instagram) feed ads that stop thumbs.",
    `Target website: ${url}`,
    read,
    "Then respond with ONLY a JSON object \u2014 no prose before or after, no markdown fences \u2014 in exactly this shape:",
    '{"brand":{"name":string,"product":string (one line, what they sell),"tone":string,"colors":[2-4 hex color strings pulled from the site]},' + CONCEPT_SHAPE.slice(1),
    steerLine(),
    'Exactly ONE concept must have "recommended": true \u2014 the one you would run first.',
    freshLine(priorNames)
  ].filter(Boolean).join("\n");
}
function parseForge(raw, brandKnown) {
  try {
    const cleaned = String(raw).replace(/```(?:json)?/gi, "");
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const data = JSON.parse(m[0]);
    let list = Array.isArray(data.concepts) ? data.concepts : [];
    if (list.length < 3) return null;
    list = list.slice(0, 3).map((c) => ({
      name: str(c.name, "Untitled concept"),
      angle: str(c.angle, "Direct response"),
      hook: str(c.hook, str(c.headline, "\u2014")),
      primaryText: str(c.primaryText, str(c.hook, "")),
      headline: str(c.headline, "").slice(0, 60),
      description: str(c.description, "").slice(0, 40),
      cta: CTAS.includes(c.cta) ? c.cta : "Learn More",
      imagePrompt: str(c.imagePrompt, ""),
      recommended: !!c.recommended
    }));
    const recAt = list.findIndex((c) => c.recommended);
    list.forEach((c, i) => {
      c.recommended = i === (recAt === -1 ? 0 : recAt);
    });
    if (brandKnown) return { brand: null, concepts: list };
    const b = data.brand || {};
    return {
      brand: {
        name: str(b.name, "The brand"),
        product: str(b.product, ""),
        tone: str(b.tone, ""),
        audience: "",
        colors: (Array.isArray(b.colors) ? b.colors : []).map(normHex).filter(Boolean).slice(0, 4)
      },
      concepts: list
    };
  } catch {
    return null;
  }
}
async function offerBorrow(url) {
  const dock = $("borrow");
  if (!dock || !relay || !url || borrowSkipped === url) return false;
  if (lent && !urlRevealed) return false;
  const meta = await findBankedForUrl(relay, url, "brand");
  if (!meta) return false;
  mountBorrowOffer(dock, {
    name: meta.name,
    detail: `banked brand \xB7 ${hostOf(url) || "your library"} \u2014 read once, reusable everywhere`,
    swatches: meta.swatches || [],
    onUse: async () => {
      const ctx = await useContext(relay, meta.id);
      if (!ctx) {
        borrowSkipped = url;
        void forgeRun({ mode: "url" });
        return;
      }
      lent = normalizeBrand(ctx);
      urlRevealed = false;
      autoForgeKey = lent.name;
      if (state.sample) wipeSample();
      renderEntry();
      reflect();
      void forgeRun({ mode: "brand", note: `working from your banked \u201C${lent.name}\u201D \u2014 the site stays unread` });
    },
    // Dismissal always re-runs the fetch path — the offer is never a dead end.
    onDismiss: () => {
      borrowSkipped = url;
      void forgeRun({ mode: "url" });
    }
  });
  return true;
}
async function forgeRun(opts = {}) {
  if (!relay || forging || casting) return;
  const mode = opts.mode === "brand" || opts.mode === "url" ? opts.mode : state.source === "brand" && lent ? "brand" : "url";
  if (mode === "brand" && !lent) {
    showError("No brand is lent \u2014 pick one with \u201Cuse a brand\u201D.", null);
    return;
  }
  if (mode === "url") {
    const url = $("f-url").value.trim();
    if (!url) {
      showError("Give the forge a site URL first.", null);
      return;
    }
    state.url = url;
  }
  const cached = mode === "url" && !!(opts.useCache && state.siteCache && state.siteCacheUrl === state.url);
  if (mode === "url" && !cached && await offerBorrow(state.url)) return;
  const priorNames = opts.avoidRepeats ? state.concepts.map((c) => c.name) : null;
  forging = true;
  reflect();
  hideError();
  clearBorrowOffer($("borrow"));
  clearLog();
  if (opts.note) logLine(opts.note);
  let prompt;
  if (mode === "brand") {
    logLine(`working from your lent brand \u201C${lent.name}\u201D \u2014 no site fetch needed\u2026`);
    prompt = buildBrandForgePrompt(lent, priorNames);
  } else {
    logLine(cached ? "using the banked site read \u2014 no re-fetch needed\u2026" : "reading the site on your Claude\u2026");
    prompt = buildUrlForgePrompt(state.url, cached ? state.siteCache : null, priorNames);
  }
  const liveLine = logLine("drafting concepts\u2026 0.0 kb", "live");
  let acc = "";
  try {
    for await (const d of relay.stream({ prompt, agentic: true })) {
      if (d.type === "tool_proposed") {
        if (d.call.name === "WebFetch") logLine("reading the site\u2026");
        else logLine("tool \u2192 " + d.call.name);
      } else if (d.type === "tool_result") {
        if (d.call.name === "WebFetch" && d.result?.ok) {
          const t = resultText(d);
          if (t) {
            state.siteCache = t.slice(0, 12e3);
            state.siteCacheUrl = state.url;
            logLine("site read banked for reworks (" + Math.max(1, Math.round(t.length / 1024)) + " kb)");
          }
        } else if (d.result && !d.result.ok) {
          logLine("blocked: " + (d.result.error?.message || d.call.name), "bad");
        }
      } else if (d.type === "text") {
        acc += d.text;
        liveLine.textContent = "drafting concepts\u2026 " + (acc.length / 1024).toFixed(1) + " kb";
      } else if (d.type === "error") {
        throw new Error(d.error?.message || "stream error");
      }
    }
    const parsed = parseForge(acc, mode === "brand");
    if (!parsed) throw new Error("The forge returned malformed concepts \u2014 hit Retry; it usually lands clean on the second pass.");
    state.brand = mode === "brand" ? {
      name: lent.name,
      product: lent.products[0] || "",
      tone: lent.voice || lent.positioning || "",
      audience: lent.audience || "",
      colors: lent.palette.slice(0, 4)
    } : parsed.brand;
    state.source = mode;
    state.concepts = parsed.concepts;
    state.picked = -1;
    state.images = {};
    state.sample = false;
    resetExpanded();
    save();
    liveLine.textContent = "drafting concepts\u2026 done";
    logLine("three concepts out of the fire \u2014 pick one below.", "good");
    renderConcepts();
    $("concepts-sec").hidden = false;
    $("studio-sec").hidden = true;
    $("concepts-sec").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    const msg = String(err?.message || err);
    logLine("forge failed: " + msg, "bad");
    showError(msg, () => forgeRun(opts));
  } finally {
    forging = false;
    reflect();
  }
}
$("forge-brand").addEventListener("click", () => forgeRun({ mode: "brand" }));
$("forge").addEventListener("click", () => forgeRun({ mode: "url" }));
function regenConcepts() {
  if (state.source === "brand" && lent) forgeRun({ mode: "brand", avoidRepeats: true });
  else forgeRun({ mode: "url", useCache: true, avoidRepeats: true });
}
$("regen-concepts").addEventListener("click", regenConcepts);
var COPY_SHAPE = '{"concept":{"name":string (2-4 word concept name),"hook":string (the scroll-stopping first line),"primaryText":string (Meta primary text, at most 125 words, short paragraphs separated by \\n\\n, the hook as its first line),"headline":string (max 40 characters),"description":string (max 30 characters),"cta":"Shop Now"|"Learn More"|"Get Offer"|"Sign Up"}}';
function buildCopyRegenPrompt(c, b) {
  const steer = state.steer.trim();
  return [
    "You are AdForge, a direct-response creative director who writes Meta (Facebook/Instagram) feed ads that stop thumbs.",
    "Rewrite the copy for ONE existing ad concept \u2014 same brand, same angle, fresh words. Do NOT call WebFetch or any other tool. Work only from this brand context:",
    `Brand: ${b.name || "The brand"}`,
    b.product ? `Product: ${b.product}` : "",
    b.tone ? `Tone \u2014 write ALL copy in this voice: ${b.tone}` : "",
    b.audience ? `Audience \u2014 speak straight to them: ${b.audience}` : "",
    `The concept to rework \u2014 keep its angle ("${c.angle}") and the spirit of its hook, but write a NEW hook, primary text, headline and description:`,
    `Concept name: ${c.name}`,
    `Current hook: ${c.hook}`,
    `Current primary text:
"""
${c.primaryText}
"""`,
    steer ? `Steer the rewrite with this direction: "${steer}".` : "",
    "Respond with ONLY a JSON object \u2014 no prose before or after, no markdown fences \u2014 in exactly this shape:",
    COPY_SHAPE
  ].filter(Boolean).join("\n");
}
function parseCopyRegen(raw, old) {
  try {
    const cleaned = String(raw).replace(/```(?:json)?/gi, "");
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const data = JSON.parse(m[0]);
    const c = data.concept || (Array.isArray(data.concepts) ? data.concepts[0] : null);
    if (!c || typeof c !== "object") return null;
    return {
      name: str(c.name, old.name),
      angle: old.angle,
      // the angle is fixed for a copy rework
      hook: str(c.hook, old.hook),
      primaryText: str(c.primaryText, str(c.hook, old.primaryText)),
      headline: str(c.headline, old.headline).slice(0, 60),
      description: str(c.description, old.description).slice(0, 40),
      cta: CTAS.includes(c.cta) ? c.cta : old.cta,
      imagePrompt: old.imagePrompt,
      // copy only — the creative brief stays put
      recommended: old.recommended
      // exactly-one-recommended isn't up for grabs here
    };
  } catch {
    return null;
  }
}
async function copyRegenRun() {
  if (!relay || forging || casting || state.picked < 0) return;
  const idx = state.picked;
  const c = cur();
  if (!c) return;
  const b = state.brand || {};
  forging = true;
  reflect();
  hideError();
  clearLog();
  logLine(`reworking the copy on \u201C${c.name}\u201D \u2014 your pick and creative stay put\u2026`);
  const liveLine = logLine("redrafting copy\u2026 0.0 kb", "live");
  let acc = "";
  try {
    for await (const d of relay.stream({ prompt: buildCopyRegenPrompt(c, b), agentic: true })) {
      if (d.type === "text") {
        acc += d.text;
        liveLine.textContent = "redrafting copy\u2026 " + (acc.length / 1024).toFixed(1) + " kb";
      } else if (d.type === "tool_proposed") {
        logLine("tool \u2192 " + d.call.name);
      } else if (d.type === "tool_result") {
        if (d.result && !d.result.ok) logLine("blocked: " + (d.result.error?.message || d.call.name), "bad");
      } else if (d.type === "error") {
        throw new Error(d.error?.message || "stream error");
      }
    }
    const next = parseCopyRegen(acc, c);
    if (!next) throw new Error("The forge returned malformed copy \u2014 hit Retry; it usually lands clean on the second pass.");
    if (state.concepts[idx]) state.concepts[idx] = next;
    save();
    liveLine.textContent = "redrafting copy\u2026 done";
    logLine("fresh copy on the bench \u2014 same concept, same creative.", "good");
    renderConcepts();
    renderStudio();
  } catch (err) {
    const msg = String(err?.message || err);
    logLine("copy rework failed: " + msg, "bad");
    showError(msg, copyRegenRun);
  } finally {
    forging = false;
    reflect();
  }
}
$("regen-copy").addEventListener("click", copyRegenRun);
$("sample").addEventListener("click", () => {
  const s = JSON.parse(JSON.stringify(SAMPLE));
  state.url = s.url;
  $("f-url").value = s.url;
  state.brand = s.brand;
  state.concepts = s.concepts;
  state.picked = -1;
  state.images = {};
  state.sample = true;
  state.source = "url";
  resetExpanded();
  save();
  hideError();
  clearLog();
  logLine("sample loaded from the archive \u2014 no tokens burned.", "good");
  logLine("pick a concept below; connect Switchboard to forge for real.");
  renderEntry();
  renderConcepts();
  $("concepts-sec").hidden = false;
  $("studio-sec").hidden = true;
  $("concepts-sec").scrollIntoView({ behavior: "smooth", block: "start" });
});
function renderBrandline() {
  const b = state.brand;
  const mount = $("brandline");
  mount.textContent = "";
  if (!b) return;
  mount.append(el2("b", null, b.name));
  const meta = [b.product, b.tone].filter(Boolean).join(" \xB7 ");
  if (meta) mount.append(document.createTextNode(" \xB7 " + meta + " "));
  (b.colors || []).forEach((c) => {
    const sw = el2("span", "sw");
    sw.style.background = c;
    sw.title = c;
    mount.append(sw);
  });
  if (state.sample) mount.append(el2("span", "srcchip sample", "sample"));
  else if (state.source === "brand") mount.append(el2("span", "srcchip", "your lent brand"));
  mountBankOffer(mount);
}
function bankDraft() {
  const b = state.brand;
  if (!relay || state.sample || state.source !== "url" || !b || !b.name) return null;
  if (b.name === "The brand") return null;
  const domain = hostOf(state.url);
  return {
    id: slugId(domain || b.name),
    name: b.name,
    data: {
      positioning: b.product || "",
      voice: b.tone || "",
      palette: Array.isArray(b.colors) ? b.colors : [],
      products: [],
      ...domain ? { domain } : {},
      source: { kind: "site", url: state.url }
    }
  };
}
function mountBankOffer(mount) {
  const draft = bankDraft();
  if (!draft) return;
  mountBankIt(mount, {
    relay,
    kind: "brand",
    draft,
    contexts: libraryMetas,
    onPublished: (meta) => {
      libraryMetas = libraryMetas.filter((m) => m.id !== meta.id).concat(meta);
      logLine(`\u201C${meta.name}\u201D banked \u2014 every wrapp can borrow it now instead of re-reading the site.`, "good");
    }
  });
}
var expanded = /* @__PURE__ */ new Set();
function resetExpanded() {
  expanded.clear();
}
function toggleCard(i) {
  if (expanded.has(i)) expanded.delete(i);
  else expanded.add(i);
  renderConcepts();
}
function renderConcepts() {
  renderBrandline();
  const mount = $("cards");
  mount.textContent = "";
  state.concepts.forEach((c, i) => {
    const open = expanded.has(i);
    const isPicked = i === state.picked;
    const card = el2("div", "card" + (isPicked ? " picked" : "") + (open ? " open" : ""));
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", open ? "true" : "false");
    card.tabIndex = 0;
    const top = el2("div", "cardtop");
    top.append(el2("span", "anglechip", c.angle));
    if (c.recommended) top.append(el2("span", "recflag", "RECOMMENDED"));
    const prev = el2("div", "copyprev" + (open ? " full" : ""));
    if (open) {
      prev.textContent = c.primaryText;
    } else {
      const flat = c.primaryText.replace(/\s+/g, " ").trim();
      prev.textContent = flat.slice(0, 150) + (flat.length > 150 ? "\u2026" : "");
    }
    const foot = el2("div", "cardfoot");
    foot.append(el2("span", "fh", c.headline), el2("span", "fc", c.cta + " \u2192"));
    card.append(top, el2("div", "hook", c.hook), prev, foot);
    if (open) {
      if (c.description) card.append(el2("div", "carddesc", c.description));
      if (!isPicked) {
        const act = el2("button", "castbtn", "Cast this creative");
        act.type = "button";
        act.addEventListener("click", (e) => {
          e.stopPropagation();
          pick(i);
        });
        card.append(act);
        card.append(el2("div", "castnote", state.picked >= 0 ? "renders on your Claude \u2014 replaces the creative in the studio below" : "renders on your Claude \u2014 the only step here that spends anything"));
      }
    }
    card.append(el2("div", "picktag", isPicked ? "SELECTED" : open ? "CLICK TO COLLAPSE" : "CLICK TO READ IN FULL"));
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".castbtn")) toggleCard(i);
    });
    card.addEventListener("keydown", (e) => {
      if (e.target !== card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCard(i);
      }
    });
    mount.append(card);
  });
}
function pick(i) {
  if (forging || casting) return;
  state.picked = i;
  state.images = {};
  expanded.add(i);
  save();
  renderConcepts();
  renderStudio();
  $("studio-sec").scrollIntoView({ behavior: "smooth", block: "start" });
  if (relay && !state.sample && !casting) void castRun(state.aspect);
}
function sampleCreative(aspect) {
  const b = state.brand || {};
  const cols = Array.isArray(b.colors) && b.colors.length >= 2 ? b.colors : ["#212A2F", "#9BC0B2"];
  const w = 800, h = aspect === "4:5" ? 1e3 : 800;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${cols[0]}'/><stop offset='1' stop-color='${cols[1]}'/></linearGradient></defs><rect width='${w}' height='${h}' fill='url(#g)'/><text x='${w / 2}' y='${h / 2 - 14}' text-anchor='middle' font-family='sans-serif' font-size='54' font-weight='700' fill='rgba(255,255,255,.95)'>${escXml(b.name || "Sample")}</text><text x='${w / 2}' y='${h / 2 + 36}' text-anchor='middle' font-family='monospace' font-size='22' letter-spacing='6' fill='rgba(255,255,255,.75)'>SAMPLE CREATIVE</text><text x='${w / 2}' y='${h - 46}' text-anchor='middle' font-family='monospace' font-size='18' fill='rgba(255,255,255,.6)'>connect Switchboard to render the real one</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
function adDomain() {
  if (state.source === "brand") {
    const slug = (state.brand?.name || "brand").toLowerCase().replace(/[^a-z0-9]/g, "") || "brand";
    return (slug + ".com").toUpperCase();
  }
  return domainOf(state.url);
}
function renderStudio() {
  const c = cur();
  $("studio-sec").hidden = !c;
  if (!c) {
    reflect();
    return;
  }
  const b = state.brand || {};
  $("picked-name").textContent = c.name + " \xB7 " + c.angle + (c.recommended ? " \xB7 recommended" : "");
  $("m-name").textContent = b.name || "Brand";
  const av = $("m-avatar");
  av.textContent = ((b.name || "B").trim()[0] || "B").toUpperCase();
  const c0 = b.colors && b.colors[0] || "#212A2F";
  av.style.background = c0;
  av.style.color = lum(c0) > 0.6 ? "#111" : "#fff";
  $("m-primary").textContent = c.primaryText;
  $("m-domain").textContent = adDomain();
  $("m-headline").textContent = c.headline;
  $("m-desc").textContent = c.description;
  $("m-cta").textContent = c.cta;
  $("asp-11").classList.toggle("on", state.aspect === "1:1");
  $("asp-45").classList.toggle("on", state.aspect === "4:5");
  $("m-imgbox").style.aspectRatio = state.aspect === "4:5" ? "4 / 5" : "1 / 1";
  const img = $("m-img"), hint = $("m-imghint");
  const real = state.images[state.aspect];
  if (real) {
    img.src = real;
    img.hidden = false;
    hint.hidden = true;
  } else if (state.sample) {
    img.src = sampleCreative(state.aspect);
    img.hidden = false;
    hint.hidden = true;
  } else {
    img.hidden = true;
    img.removeAttribute("src");
    hint.hidden = false;
    hint.textContent = relay ? "no creative yet \u2014 hit Cast the creative" : "connect Switchboard to cast the creative";
  }
  $("bench-note").textContent = state.sample && !real ? "Sample mode: the tile is a stand-in. Connect and cast to render the real creative on your Claude." : "Creatives render per aspect \u2014 flip the toggle and AdForge re-fires at the new ratio.";
  reflect();
}
function setCastLine(t) {
  $("cast-line").textContent = t;
}
function castLineFor(name) {
  if (name === "WebFetch") return "reading the site\u2026";
  if (name.endsWith("generate_image")) return "rendering the creative (approve if asked)\u2026";
  if (name.includes("media_")) return "handling media\u2026";
  return "tool \u2192 " + name;
}
async function castRun(aspect) {
  if (!relay || casting || forging || state.picked < 0) return;
  const c = cur();
  if (!c) return;
  const b = state.brand || {};
  casting = true;
  reflect();
  hideError();
  $("cast-status").hidden = false;
  setCastLine("warming up\u2026");
  logLine('rendering "' + c.name + '" at ' + aspect + "\u2026");
  try {
    const palette = (b.colors || []).join(", ");
    const brandBits = [
      `Brand palette: ${palette || "natural, muted"}.`,
      `Brand tone: ${b.tone || "clean and confident"}.`,
      b.audience ? `Shot to stop the scroll of: ${b.audience}.` : ""
    ].filter(Boolean).join(" ");
    const instruction = `Use the Higgsfield generate_image tool with model "nano_banana_pro" to generate ONE advertising image.
Prompt: "${c.imagePrompt}. ${brandBits} Premium Meta feed ad photography \u2014 no text, no lettering, no logos, no watermarks."
aspect_ratio "${aspect}". Poll until the generation is complete, then reply with ONLY the final image URL on its own line.`;
    let url = null, acc = "";
    for await (const d of relay.stream({ prompt: instruction, agentic: true })) {
      if (d.type === "tool_proposed") {
        setCastLine(castLineFor(d.call.name));
        logLine(castLineFor(d.call.name));
      } else if (d.type === "tool_result") {
        if (d.result?.ok) {
          const u = extractUrl(resultText(d));
          if (u) url = u;
        } else logLine("blocked: " + (d.result?.error?.message || d.call.name), "bad");
      } else if (d.type === "text") {
        acc += d.text;
      } else if (d.type === "error") {
        throw new Error(d.error?.message || "stream error");
      }
    }
    url = url || extractUrl(acc);
    if (!url) throw new Error("No image came back \u2014 hit Retry or Recast; the second pass usually lands.");
    state.images[aspect] = url;
    save();
    logLine("creative rendered at " + aspect + ".", "good");
  } catch (err) {
    const msg = String(err?.message || err);
    logLine("cast failed: " + msg, "bad");
    showError(msg, () => castRun(aspect));
  } finally {
    casting = false;
    $("cast-status").hidden = true;
    renderStudio();
  }
}
$("cast").addEventListener("click", () => castRun(state.aspect));
$("recast").addEventListener("click", () => {
  delete state.images[state.aspect];
  save();
  renderStudio();
  castRun(state.aspect);
});
function setAspect(a) {
  if (state.aspect === a) return;
  state.aspect = a;
  save();
  renderStudio();
  if (!state.images[a] && !state.sample && relay && state.picked >= 0) castRun(a);
}
$("asp-11").addEventListener("click", () => setAspect("1:1"));
$("asp-45").addEventListener("click", () => setAspect("4:5"));
$("m-img").addEventListener("error", () => {
  if ($("m-img").hidden || !$("m-img").getAttribute("src")) return;
  $("m-img").hidden = true;
  $("m-imghint").hidden = false;
  $("m-imghint").textContent = "the creative failed to load \u2014 hit Recast image";
});
async function copyText(btn, text) {
  const ok = () => {
    const was = btn.textContent;
    btn.textContent = "copied";
    btn.classList.add("did");
    setTimeout(() => {
      btn.textContent = was;
      btn.classList.remove("did");
    }, 1200);
  };
  try {
    await navigator.clipboard.writeText(text);
    ok();
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      ok();
    } catch {
      showError("Clipboard is blocked here \u2014 select the text in the preview and copy manually.", null);
    }
  }
}
$("copy-primary").addEventListener("click", () => {
  const c = cur();
  if (c) copyText($("copy-primary"), c.primaryText);
});
$("copy-headline").addEventListener("click", () => {
  const c = cur();
  if (c) copyText($("copy-headline"), c.headline);
});
$("copy-desc").addEventListener("click", () => {
  const c = cur();
  if (c) copyText($("copy-desc"), c.description);
});
if (state.concepts.length) {
  renderConcepts();
  $("concepts-sec").hidden = false;
  renderStudio();
}
renderEntry();
reflect();
//# sourceMappingURL=adforge.js.map
