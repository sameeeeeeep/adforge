// ../../packages/protocol/dist/version.js
var PROVIDER_GLOBAL = "claude";

// ../../packages/sdk/dist/connect-chip.js
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
  let sessionDisconnected = false;
  const onDocClick = (e) => {
    if (menuOpen && !host.contains(e.target)) {
      menuOpen = false;
      render();
    }
  };
  document.addEventListener("click", onDocClick);
  function el2(tag, cls, text) {
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
      state2 = { kind: "not-installed", installUrl };
      return render();
    }
    relay2 = r;
    subscribe(r);
    const grant = sessionDisconnected ? null : await r.permissions().catch(() => null);
    if (destroyed || my !== seq)
      return;
    if (!grant) {
      state2 = { kind: "disconnected", relay: r };
      emitTransition(false);
      return render();
    }
    const [user, project] = await Promise.all([r.identity(), r.context.active().catch(() => null)]);
    if (destroyed || my !== seq)
      return;
    state2 = { kind: "connected", relay: r, user, project };
    emitTransition(true);
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
  }
  async function doConnect() {
    if (!relay2)
      return;
    try {
      sessionDisconnected = false;
      await relay2.connect(opts.scope);
      await refresh();
    } catch {
    }
  }
  async function doPick() {
    if (!relay2)
      return;
    menuOpen = false;
    render();
    const project = await relay2.context.pick().catch(() => null);
    opts.onProjectChange?.(project);
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
      const b = el2("button", "btn get");
      b.append(el2("span", "glyph"), el2("span", void 0, "Get Switchboard"), el2("span", "arr", "\u2197"));
      b.onclick = () => window.open(state2.kind === "not-installed" ? state2.installUrl : installUrl, "_blank", "noopener");
      mount.append(b);
      return;
    }
    if (state2.kind === "disconnected") {
      const b = el2("button", "btn connect");
      b.append(el2("span", "glyph"), el2("span", void 0, "Connect Switchboard"));
      b.onclick = doConnect;
      mount.append(b);
      return;
    }
    const { user, project } = state2;
    const rawName = user?.name?.trim();
    const collides = !!rawName && !!project?.name && rawName.toLowerCase() === project.name.toLowerCase();
    const name = !rawName || collides ? "there" : rawName;
    const wrap = el2("div", "wrap");
    const chip = el2("button", "chip");
    const av = el2("div", "av");
    if (user?.avatar) {
      const img = el2("img");
      img.src = user.avatar;
      img.alt = name;
      av.append(img);
    } else
      av.textContent = name.charAt(0).toUpperCase();
    const who = el2("div", "who");
    who.append(el2("div", "hi", `Hi ${name}`));
    who.append(el2("div", "proj", project ? project.name : "No context lent"));
    chip.append(av, who, el2("span", "caret", "\u25BE"));
    chip.onclick = (e) => {
      e.stopPropagation();
      menuOpen = !menuOpen;
      render();
    };
    wrap.append(chip);
    if (menuOpen) {
      const menu = el2("div", "menu");
      menu.append(el2("div", "lbl", "Working on"));
      const row = el2("button", "proj-row");
      row.append(el2("span", void 0, project ? project.name : "Choose a context"));
      row.append(el2("span", "go", project ? "Switch \u25B8" : "Choose \u25B8"));
      row.onclick = doPick;
      menu.append(row, el2("div", "sep"));
      const dc = el2("button", "item", "Disconnect this app");
      dc.onclick = doDisconnect;
      menu.append(dc);
      menu.append(el2("div", "foot", "Connectors, budgets & activity live in the Switchboard toolbar panel."));
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
      host.remove();
    }
  };
}

// ../../packages/sdk/dist/index.js
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
    return {
      get: (key) => req({ op: "get", key }).then((r) => r.value ?? null),
      set: (key, value) => req({ op: "set", key, value }).then(() => void 0),
      delete: (key) => req({ op: "delete", key }).then((r) => r.ok),
      list: () => req({ op: "list" }).then((r) => r.keys ?? []),
      info: () => req({ op: "info" }).then((r) => r.info),
      /** Point this app's store at a real folder (triggers a path-consent click). */
      bind: (path) => req({ op: "bind", path }).then((r) => r.info)
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
      pick: () => req({ op: "pick" }).then((r) => r.context ?? null)
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

// src/adforge.js
var $ = (id) => document.getElementById(id);
var INSTALL_URL = "https://thelastprompt.ai/switchboard/";
var STORE_KEY = "adforge:state";
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
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      url: state.url,
      steer: state.steer,
      source: state.source,
      brand: state.brand,
      concepts: state.concepts,
      picked: state.picked,
      aspect: state.aspect,
      images: state.images,
      sample: state.sample,
      siteCache: state.siteCache ? state.siteCache.slice(0, 12e3) : null,
      siteCacheUrl: state.siteCacheUrl
    }));
  } catch {
  }
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && typeof s === "object") Object.assign(state, s);
  } catch {
  }
  if (typeof state.url !== "string" || !state.url) state.url = SAMPLE_URL;
  if (typeof state.steer !== "string") state.steer = "";
  if (state.source !== "brand") state.source = "url";
  if (!Array.isArray(state.concepts)) state.concepts = [];
  if (!state.images || typeof state.images !== "object") state.images = {};
  if (state.aspect !== "4:5") state.aspect = "1:1";
  if (!(Number.isInteger(state.picked) && state.picked >= 0 && state.picked < state.concepts.length)) state.picked = -1;
}
load();
var el = (tag, cls, text) => {
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
  if (lent && state.sample) wipeSample();
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
      if (state.sample) wipeSample();
    }
  } catch (err) {
    showError("Brand pick failed: " + (err?.message || err), null);
  } finally {
    btn.textContent = was;
    btn.disabled = false;
    renderEntry();
    reflect();
  }
}
function logLine(text, cls) {
  $("forgelog").hidden = false;
  const d = el("div", "logline" + (cls ? " " + cls : ""), text);
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
    reason: "forge Meta ads from your lent brand or a site you name",
    tools: ["WebFetch", "mcp__claude_ai_Higgsfield__*"],
    models: ["sonnet"]
  },
  installUrl: INSTALL_URL,
  onConnect: async (r) => {
    relay = r;
    wipeSample();
    await loadBrandCtx();
    renderEntry();
    reflect();
  },
  onDisconnect: () => {
    relay = null;
    lent = null;
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
    if (state.source === "brand" && (prev && prev.name) !== (lent && lent.name)) clearBrandConcepts();
    renderEntry();
    reflect();
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
    }
  } else {
    notInstalled = true;
  }
  renderEntry();
  reflect();
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
      const sw = el("span", "sw");
      sw.style.background = c;
      sw.title = c;
      line.append(sw);
    }
  }
}
function reflect() {
  const busy = forging || casting;
  const on = !!relay;
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
    const a = el("a", null, "get it here");
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
  const priorNames = opts.avoidRepeats ? state.concepts.map((c) => c.name) : null;
  forging = true;
  reflect();
  hideError();
  clearLog();
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
  const c = cur();
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
    state.concepts[state.picked] = next;
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
  mount.append(el("b", null, b.name));
  const meta = [b.product, b.tone].filter(Boolean).join(" \xB7 ");
  if (meta) mount.append(document.createTextNode(" \xB7 " + meta + " "));
  (b.colors || []).forEach((c) => {
    const sw = el("span", "sw");
    sw.style.background = c;
    sw.title = c;
    mount.append(sw);
  });
  if (state.sample) mount.append(el("span", "srcchip sample", "sample"));
  else if (state.source === "brand") mount.append(el("span", "srcchip", "your lent brand"));
}
function renderConcepts() {
  renderBrandline();
  const mount = $("cards");
  mount.textContent = "";
  state.concepts.forEach((c, i) => {
    const card = el("button", "card" + (i === state.picked ? " picked" : ""));
    card.type = "button";
    const top = el("div", "cardtop");
    top.append(el("span", "anglechip", c.angle));
    if (c.recommended) top.append(el("span", "recflag", "RECOMMENDED"));
    const prev = el("div", "copyprev");
    const flat = c.primaryText.replace(/\s+/g, " ").trim();
    prev.textContent = flat.slice(0, 150) + (flat.length > 150 ? "\u2026" : "");
    const foot = el("div", "cardfoot");
    foot.append(el("span", "fh", c.headline), el("span", "fc", c.cta + " \u2192"));
    card.append(
      top,
      el("div", "hook", c.hook),
      prev,
      foot,
      el("div", "picktag", i === state.picked ? "SELECTED" : "PICK THIS CONCEPT")
    );
    card.addEventListener("click", () => pick(i));
    mount.append(card);
  });
}
function pick(i) {
  state.picked = i;
  state.images = {};
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
