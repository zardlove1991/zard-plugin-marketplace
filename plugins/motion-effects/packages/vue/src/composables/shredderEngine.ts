// @ts-nocheck
const FOLLOW = 30;
const SETTLE = 16;
const TUG = 2.4;
const TUG_DECAY = 0.14;
const SLIT = 6;
const OVER = 40;
const SLIVER = 2;
const STACK_K = 320;
const STACK_C = 22;
const STAGGER = 0.035;
const ENTER = 22;
const HYSTERESIS = 8;
const DEG = Math.PI / 180;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease = (from, to, dt, tau) => from + (to - from) * (1 - Math.exp(-dt / tau));
const smooth = (t) => {
  const u = clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
};
const pick = (lo, hi) => lo + Math.random() * (hi - lo);
const side = () => Math.random() < 0.5 ? -1 : 1;
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const spring = (p, v, target, dt, omega) => {
  const offset = p - target;
  const term = v + omega * offset;
  const decay = Math.exp(-omega * dt);
  return [target + (offset + term * dt) * decay, (v - omega * term * dt) * decay];
};
const urls = /* @__PURE__ */ new Map();
const dataUrl = (src) => {
  if (!src || src.startsWith("data:")) return Promise.resolve(src);
  const hit = urls.get(src);
  if (hit) return hit;
  const job = fetch(src, { mode: "cors" }).then((res) => res.blob()).then(
    (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })
  );
  urls.set(src, job);
  job.catch(() => urls.delete(src));
  return job;
};
const snapshot = (node, W, H) => {
  const clone = node.cloneNode(true);
  const src = [node, ...node.querySelectorAll("*")];
  const dst = [clone, ...clone.querySelectorAll("*")];
  const images = [];
  for (let i = 0; i < src.length; i += 1) {
    const cs = getComputedStyle(src[i]);
    const style = dst[i].style;
    for (let j = 0; j < cs.length; j += 1) style.setProperty(cs[j], cs.getPropertyValue(cs[j]));
    const from = src[i];
    const to = dst[i];
    if (to instanceof HTMLImageElement && from instanceof HTMLImageElement)
      images.push([to, from.currentSrc || from.src]);
  }
  Object.assign(clone.style, {
    position: "relative",
    inset: "auto",
    margin: "0",
    transform: "none",
    filter: "none",
    transition: "none",
    width: `${W}px`,
    height: `${H}px`
  });
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  const scale = Math.min(3, window.devicePixelRatio || 1);
  return Promise.all(
    images.map(async ([img, from]) => {
      img.removeAttribute("srcset");
      img.removeAttribute("loading");
      try {
        img.setAttribute("src", await dataUrl(from));
      } catch {
        img.removeAttribute("src");
        img.style.background = "rgba(127, 127, 127, 0.25)";
      }
    })
  ).then(
    () => new Promise((resolve, reject) => {
      const markup = new XMLSerializer().serializeToString(clone);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="${W}" height="${H}">${markup}</foreignObject></svg>`;
      const img = new Image();
      img.onload = () => {
        const tex = document.createElement("canvas");
        tex.width = Math.ceil(W * scale);
        tex.height = Math.ceil(H * scale);
        const ctx = tex.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, tex.width, tex.height);
        resolve({ tex, scale });
      };
      img.onerror = () => reject(new Error("snapshot"));
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    })
  );
};
const flat = (W, H, fill) => {
  const tex = document.createElement("canvas");
  tex.width = W;
  tex.height = H;
  const ctx = tex.getContext("2d");
  if (ctx) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, W, H);
  }
  return { tex, scale: 1 };
};
const shape = (st, len, time, tear) => {
  const pts = st.pts;
  pts.length = 0;
  let x = st.ax;
  let y = st.ay;
  const steps = Math.ceil(len / SLIVER);
  const swing = (3 + 9 * st.rA) * tear;
  const pace = time * (1.6 + st.rA * 2.2) + st.rA * 6.2832;
  for (let j = 0; j <= steps; j += 1) {
    const d = Math.min(j * SLIVER, len);
    const a = st.th + st.curl * d + st.amp * Math.sin(d * st.freq + st.wave);
    const flutter = swing * Math.sin(d * 0.045 + pace);
    pts.push(x + flutter * Math.cos(a), y - flutter * Math.sin(a), a);
    const h = Math.min(SLIVER, len - d);
    x += Math.sin(a) * h;
    y += Math.cos(a) * h;
  }
};
const middle = (pts) => {
  let y = 0;
  for (let j = 1; j < pts.length; j += 3) y += pts[j];
  return y * 3 / pts.length;
};
const paintStrip = (ctx, st, len, dpr) => {
  const { tex, ts } = st.feed;
  if (!tex) return;
  const pts = st.pts;
  const wc = st.w * st.core;
  const half = wc / 2;
  const sx = (st.x + (st.w - wc) / 2) * ts;
  const v0 = st.H - len;
  ctx.globalAlpha = st.alpha;
  for (let j = 0; j + 3 < pts.length; j += 3) {
    const d = j / 3 * SLIVER;
    const h = Math.min(SLIVER, len - d);
    if (h <= 0) break;
    const ca = Math.cos(pts[j + 2]);
    const sa = Math.sin(pts[j + 2]);
    ctx.setTransform(dpr * ca, -dpr * sa, dpr * sa, dpr * ca, dpr * (pts[j] + OVER), dpr * pts[j + 1]);
    ctx.drawImage(tex, sx, (v0 + d) * ts, wc * ts, h * ts, -half, 0, wc, h + 0.4);
  }
  ctx.globalAlpha = 1;
};
// @ts-nocheck
/* Shredder — Vue 引擎：模拟逻辑从 React 源码逐字提取，hook 用普通对象桩替代。
 * SFC 拥有 DOM（含插槽内容），引擎只操作已有节点的内联样式与模拟状态。 */
export interface ShredderItemLike {
  id: string | number
}

export interface ShredderEngineOptions extends ShredderItemConfig {
  root: HTMLElement
  onOrderChange?: (ids: Array<string | number>) => void
}

export interface ShredderItemConfig {
  items?: ShredderItemLike[]
  height?: number
  inset?: number
  gap?: number
  slitHeight?: number
  fallHeight?: number
  feedSpeed?: number
  bite?: number
  autoFeed?: boolean
  stripWidth?: number
  curl?: number
  loop?: boolean
  loopAfterDelete?: boolean
  dragTilt?: number
  lift?: number
  slitColor?: string
  color?: string
  disabled?: boolean
  autoAnimate?: boolean
  onShred?: (item: any) => void
  onReorder?: (items: any[]) => void
  width?: number
  className?: string
}

export interface ShredderEngine {
  /** 原地更新配置（对齐 React 每次 render 重算 cfg.current），不销毁模拟状态与在途动画 */
  sync(next: ShredderItemConfig): void
  destroy(): void
}

export function createShredderEngine(options: ShredderEngineOptions): ShredderEngine {
  const rootEl = options.root;
  const onOrderChange = options.onOrderChange;
  let list = null;
  const {
    items = [],
    onShred,
    onReorder,
    width = 340,
    height = 460,
    inset = 14,
    gap = 10,
    slitHeight = 4,
    fallHeight = 140,
    feedSpeed = 180,
    bite = 18,
    autoFeed = true,
    stripWidth = 10,
    curl = 1,
    autoAnimate = false,
    loop = false,
    loopAfterDelete = false,
    dragTilt = 6,
    lift = 1.02,
    slitColor = "#3f3f46",
    color = "#f5f5f5",
    disabled = false,
    className = ""
  } = options;
  const effects = [];
  const cleanups = [];
  const useRef = (value) => ({ current: value });
  const useEffect = (fn) => { effects.push(fn); };
  const useLayoutEffect = (fn) => { effects.push(fn); };

  // items 可变：sync() 会原地替换它（对齐 React 的 cfg.current.items = sorted）。
  let sourceItems = items;
  let order = sourceItems.map((item) => item.id);
  const buildSorted = () => {
    const rank = new Map(order.map((id, i) => [id, i]));
    const weight = (item) => rank.get(item.id) ?? order.length + sourceItems.indexOf(item);
    return [...sourceItems].sort((a, b) => weight(a) - weight(b));
  };
  let sorted = buildSorted();
  const setOrder = (ids) => {
    order = ids;
    sorted = buildSorted();
    cfg.current.items = sorted;
    if (list) sorted.forEach((item) => {
      const slot = slotEls.current.get(item.id);
      if (slot) list.appendChild(slot);
    });
    onOrderChange?.(ids);
  };
  const rootRef = useRef(null);
  const slitRef = useRef(null);
  const canvasRef = useRef(null);
  const slotEls = useRef(/* @__PURE__ */ new Map());
  const itemEls = useRef(/* @__PURE__ */ new Map());
  const cfg = useRef({});
  // 对齐 React：每次 render 都把最新 props 写回 cfg.current，而不是重建整个引擎。
  const applyConfig = (o) => {
    cfg.current = {
      items: sorted,
      height: o.height ?? 460,
      inset: o.inset ?? 14,
      gap: o.gap ?? 10,
      slitHeight: o.slitHeight ?? 4,
      fallHeight: o.fallHeight ?? 140,
      feedSpeed: o.feedSpeed ?? 180,
      bite: o.bite ?? 18,
      autoFeed: o.autoFeed ?? true,
      stripWidth: o.stripWidth ?? 10,
      curl: o.curl ?? 1,
      loop: o.loop ?? false,
      loopAfterDelete: o.loopAfterDelete ?? false,
      dragTilt: o.dragTilt ?? 6,
      lift: o.lift ?? 1.02,
      onShred: o.onShred,
      onReorder: o.onReorder,
      disabled: o.disabled ?? false
    };
  };
  applyConfig(options);
  const sim = useRef({
    raf: 0,
    last: 0,
    t: 0,
    drag: null,
    feeds: [],
    strips: [],
    shifts: /* @__PURE__ */ new Map(),
    tops: /* @__PURE__ */ new Map(),
    timers: /* @__PURE__ */ new Set(),
    dpr: 1,
    cw: 0,
    ch: 0
  });
  const metrics = () => {
    const c = cfg.current;
    const root = rootRef.current;
    const r = root.getBoundingClientRect();
    const k = r.width / root.offsetWidth || 1;
    const lip = c.height - c.fallHeight - c.slitHeight;
    return { left: r.left, top: r.top, k, rw: root.offsetWidth, lip, exit: lip + c.slitHeight };
  };
  const at = (el, m) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left - m.left) / m.k, y: (r.top - m.top) / m.k };
  };
  const local = (e, m) => ({
    x: (e.clientX - m.left) / m.k,
    y: (e.clientY - m.top) / m.k
  });
  const run = () => {
    const s = sim.current;
    if (s.raf) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame(step);
  };
  const later = (ms, fn) => {
    const s = sim.current;
    const id = setTimeout(() => {
      s.timers.delete(id);
      fn();
    }, ms);
    s.timers.add(id);
  };
  const slotOf = (key) => slotEls.current.get(key);
  const isLive = (key) => {
    const slot = slotOf(key);
    return !!slot && slot.dataset.gone === void 0;
  };
  const liveKeys = () => cfg.current.items.map((item) => item.id).filter(isLive);
  const goneKeys = () => cfg.current.items.map((item) => item.id).filter((key) => {
    const slot = slotOf(key);
    return !!slot && slot.dataset.gone !== void 0;
  });
  const shiftOf = (slot) => {
    const s = sim.current;
    let sh = s.shifts.get(slot);
    if (!sh) {
      sh = { el: slot, y: 0, v: 0, target: 0, delay: 0, item: null };
      s.shifts.set(slot, sh);
    }
    return sh;
  };
  const settle = (origin, entering) => {
    const s = sim.current;
    if (!rootRef.current) return;
    const m = metrics();
    const next = /* @__PURE__ */ new Map();
    const still = reduced();
    const active = s.drag ? s.drag.slot : null;
    const slots = cfg.current.items.map((item) => slotOf(item.id));
    const from = origin ? slots.indexOf(origin) : -1;
    let born = 0;
    cfg.current.items.forEach((item, idx) => {
      const slot = slots[idx];
      if (!slot) return;
      const sh = s.shifts.get(slot);
      const top = at(slot, m).y - (sh ? sh.y : 0);
      const prev = s.tops.get(slot);
      next.set(slot, top);
      if (slot === active || still) return;
      const fresh = entering && entering.has(slot) || prev === void 0 && s.tops.size > 0;
      if (fresh) {
        const rec2 = shiftOf(slot);
        const el = itemEls.current.get(item.id) || null;
        rec2.y = -ENTER;
        rec2.v = 0;
        rec2.target = 0;
        rec2.delay = born * 0.05;
        rec2.item = el;
        born += 1;
        if (el) el.style.opacity = "0";
        slot.style.transform = `translateY(${rec2.y}px)`;
        return;
      }
      if (prev === void 0) return;
      const delta = prev - top;
      if (Math.abs(delta) < 0.5) return;
      const rec = shiftOf(slot);
      rec.y += delta;
      if (from >= 0) rec.delay = Math.max(0, from - 1 - idx) * STAGGER;
      slot.style.transform = `translateY(${rec.y}px)`;
    });
    s.tops = next;
    run();
  };
  const reflow = (mutate, origin, entering) => {
    mutate();
    settle(origin || null, entering || null);
  };
  const arrange = (key, index) => {
    const ids = cfg.current.items.map((item) => item.id).filter((id) => id !== key);
    const live = ids.filter(isLive);
    let anchor = 0;
    if (index < live.length) anchor = ids.indexOf(live[index]);
    else if (live.length) anchor = ids.indexOf(live[live.length - 1]) + 1;
    ids.splice(anchor, 0, key);
    return ids;
  };
  const commit = (ids) => {
    const same = ids.every((id, i) => id === cfg.current.items[i]?.id);
    if (same) return false;
    setOrder(ids);
    return true;
  };
  const revive = (keys, index) => {
    const s = sim.current;
    if (s.drag) {
      later(300, () => revive(keys, index));
      return;
    }
    const entering = /* @__PURE__ */ new Set();
    reflow(
      () => {
        if (index !== void 0 && keys.length === 1) commit(arrange(keys[0], index));
        keys.forEach((key) => {
          const slot = slotOf(key);
          const el = itemEls.current.get(key);
          if (!slot || slot.dataset.gone === void 0) return;
          delete slot.dataset.gone;
          slot.style.height = "";
          slot.style.marginBottom = "";
          if (el) {
            el.style.visibility = "";
            el.style.transform = "";
            delete el.dataset.state;
          }
          entering.add(slot);
        });
      },
      null,
      entering
    );
  };
  const afterShred = (key) => {
    const c = cfg.current;
    if (c.loopAfterDelete) {
      later(700, () => revive([key], Math.floor(Math.random() * (liveKeys().length + 1))));
    } else if (c.loop && liveKeys().length === 0) {
      later(900, () => revive(goneKeys()));
    }
  };
  const collapse = (f, s) => {
    f.consumed = true;
    f.el.style.visibility = "hidden";
    delete f.slot.dataset.active;
    s.shifts.forEach((sh) => {
      sh.target = 0;
    });
    reflow(() => {
      f.slot.dataset.gone = "";
      f.slot.style.height = "0px";
      f.slot.style.marginBottom = "0px";
    }, f.slot);
    cfg.current.onShred?.(f.item);
    afterShred(f.key);
  };
  const consumeNow = (key, item, el, slot) => {
    const s = sim.current;
    const f = {
      key,
      item,
      el,
      slot,
      W: 0,
      H: 0,
      rx: 0,
      ry: 0,
      tx: 0,
      tilt: 0,
      lift: 1,
      v: 0,
      age: 0,
      tex: null,
      ts: 1,
      consumed: false,
      strips: 0
    };
    collapse(f, s);
    run();
  };
  const grab = (d, m) => {
    const s = sim.current;
    const c = cfg.current;
    s.drag = null;
    s.shifts.forEach((sh) => {
      sh.target = 0;
    });
    if (reduced()) {
      consumeNow(d.key, d.item, d.el, d.slot);
      return;
    }
    const over = d.ry + d.H - m.lip;
    const ry = over > c.bite * 1.5 ? m.lip + c.bite * 1.5 - d.H : d.ry;
    const lo = c.inset - SLIT;
    const hi = m.rw - c.inset + SLIT - d.W;
    const n = Math.max(1, Math.round(d.W / Math.max(4, c.stripWidth)));
    const sw = Math.floor(d.W / n);
    const f = {
      key: d.key,
      item: d.item,
      el: d.el,
      slot: d.slot,
      W: d.W,
      H: d.H,
      rx: d.rx,
      ry,
      tx: clamp(d.rx, Math.min(lo, hi), Math.max(lo, hi)),
      tilt: d.tilt,
      lift: d.lift,
      v: c.feedSpeed * TUG,
      age: 0,
      tex: null,
      ts: 1,
      consumed: false,
      strips: n
    };
    let settled = false;
    const use = ({ tex, scale }) => {
      if (settled) return;
      settled = true;
      f.tex = tex;
      f.ts = scale;
      run();
    };
    d.snap.then(use, () => use(flat(d.W, d.H, d.fill)));
    setTimeout(() => use(flat(d.W, d.H, d.fill)), 400);
    d.el.dataset.state = "feed";
    s.feeds.push(f);
    for (let i = 0; i < n; i += 1) {
      s.strips.push({
        feed: f,
        x: i * sw,
        w: i === n - 1 ? d.W - sw * (n - 1) : sw,
        H: d.H,
        phase: "attached",
        curl: side() * pick(0.35, 0.9) * DEG * c.curl,
        amp: pick(1.5, 4) * DEG * c.curl,
        freq: Math.PI * 2 / pick(34, 60),
        wave: pick(0, Math.PI * 2),
        rA: Math.random(),
        rB: Math.random(),
        speed: 0,
        splay: 0,
        core: 1,
        rest: 0,
        alpha: 1,
        th: 0,
        ax: 0,
        ay: 0,
        vx: 0,
        vy: 0,
        hang: 0,
        pts: []
      });
    }
  };
  const place = (d, sp) => {
    d.el.style.transform = `translate(${d.rx - sp.x}px, ${d.ry - sp.y}px) rotate(${d.tilt}deg) scale(${d.lift})`;
  };
  const aim = (d, m) => {
    const s = sim.current;
    const c = cfg.current;
    const rows = [];
    c.items.forEach((item) => {
      if (item.id === d.key) return;
      const slot = slotOf(item.id);
      if (!slot || slot.dataset.gone !== void 0) return;
      const top = s.tops.get(slot);
      if (top === void 0) return;
      rows.push({ slot, mid: top + slot.offsetHeight / 2 });
    });
    let j = -1;
    if (d.moved && d.ry + d.H < m.lip - 8) {
      const cy = d.ry + d.H / 2;
      let n = 0;
      rows.forEach((row) => {
        if (row.mid < cy) n += 1;
      });
      if (d.j >= 0 && n !== d.j) {
        const edge = rows[n > d.j ? n - 1 : n];
        if (edge && Math.abs(edge.mid - cy) < HYSTERESIS) n = d.j;
      }
      j = n;
    }
    if (j === d.j) return;
    d.j = j;
    rows.forEach((row, k) => {
      shiftOf(row.slot).target = j >= 0 && k < j ? -(d.H + c.gap) : 0;
    });
  };
  const drop = (d) => {
    const s = sim.current;
    const c = cfg.current;
    const live = liveKeys().filter((key) => key !== d.key);
    const index = clamp(d.j >= 0 ? d.j : d.from, 0, live.length);
    s.shifts.forEach((sh) => {
      sh.target = 0;
    });
    let changed = false;
    reflow(() => {
      changed = commit(arrange(d.key, index));
      d.slot.style.height = `${d.H}px`;
      d.slot.style.marginBottom = "";
    });
    d.phase = "return";
    if (changed) c.onReorder?.(cfg.current.items);
  };
  const tick = (now) => {
    const s = sim.current;
    const c = cfg.current;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) {
      s.raf = 0;
      return;
    }
    const dt = clamp((now - s.last) / 1e3, 0, 0.05);
    s.last = now;
    s.t += dt;
    const m = metrics();
    const d = s.drag;
    if (d) {
      if (!d.el.isConnected) {
        s.drag = null;
      } else {
        const sp = at(d.slot, m);
        const ceiling = m.lip + c.bite - d.H;
        if (d.phase === "drag") {
          d.tx = d.px - d.gx;
          d.ty = Math.min(d.py - d.gy, ceiling);
          if (!d.moved && Math.hypot(d.px - d.ox, d.py - d.oy) > 6) d.moved = true;
          aim(d, m);
        } else if (d.phase === "carry") {
          d.tx = (m.rw - d.W) / 2;
          d.ty = ceiling;
        } else {
          d.tx = sp.x;
          d.ty = sp.y;
        }
        const omega = d.phase === "drag" ? FOLLOW : SETTLE;
        [d.rx, d.vx] = spring(d.rx, d.vx, d.tx, dt, omega);
        [d.ry, d.vy] = spring(d.ry, d.vy, d.ty, dt, omega);
        const lean = d.phase === "drag" ? clamp(d.vx * 0.012, -c.dragTilt, c.dragTilt) : 0;
        d.tilt = ease(d.tilt, lean, dt, 0.09);
        d.lift = ease(d.lift, d.phase === "return" ? 1 : c.lift, dt, 0.12);
        const over = d.ry + d.H - m.lip;
        const bites = d.phase === "carry" || d.phase === "drag" && c.autoFeed;
        if (bites && over >= c.bite - 0.5) {
          grab(d, m);
        } else {
          place(d, sp);
          const still = Math.abs(d.rx - d.tx) < 0.2 && Math.abs(d.ry - d.ty) < 0.2 && Math.abs(d.vy) < 2 && Math.abs(d.vx) < 2;
          if (d.phase === "return" && still && Math.abs(d.lift - 1) < 2e-3 && Math.abs(d.tilt) < 0.05) {
            d.el.style.transform = "";
            delete d.el.dataset.state;
            delete d.slot.dataset.active;
            d.slot.style.height = "";
            s.drag = null;
          }
        }
      }
    }
    let pulling = false;
    for (let i = s.feeds.length - 1; i >= 0; i -= 1) {
      const f = s.feeds[i];
      if (!f.consumed) {
        if (!f.el.isConnected) {
          s.feeds.splice(i, 1);
          continue;
        }
        pulling = true;
        const sp = at(f.slot, m);
        if (f.tex) {
          f.age += dt;
          f.v = c.feedSpeed * (1 + (TUG - 1) * Math.exp(-f.age / TUG_DECAY));
          f.ry += f.v * dt;
        }
        f.rx = ease(f.rx, f.tx, dt, 0.1);
        f.tilt = ease(f.tilt, 0, dt, 0.08);
        f.lift = ease(f.lift, 1, dt, 0.1);
        if (f.ry >= m.lip) {
          collapse(f, s);
        } else {
          const jitter = Math.sin(s.t * 150) * 0.5;
          f.el.style.transform = `translate(${f.rx - sp.x + jitter}px, ${f.ry - sp.y}px) rotate(${f.tilt}deg) scale(${f.lift})`;
        }
      } else {
        f.ry += f.v * dt;
        if (f.strips === 0) s.feeds.splice(i, 1);
      }
    }
    let moving = false;
    s.shifts.forEach((sh, el) => {
      if (!el.isConnected) {
        s.shifts.delete(el);
        return;
      }
      if (sh.delay > 0) {
        sh.delay -= dt;
        moving = true;
        return;
      }
      if (sh.item) {
        const el2 = sh.item;
        el2.style.transition = "opacity 280ms ease";
        el2.style.opacity = "";
        setTimeout(() => {
          el2.style.transition = "";
        }, 320);
        sh.item = null;
      }
      const n = Math.ceil(dt * 240);
      const h = dt / n;
      for (let k = 0; k < n; k += 1) {
        sh.v += (-STACK_K * (sh.y - sh.target) - STACK_C * sh.v) * h;
        sh.y += sh.v * h;
      }
      if (Math.abs(sh.y - sh.target) < 0.15 && Math.abs(sh.v) < 4) {
        sh.y = sh.target;
        sh.v = 0;
        if (sh.target === 0) {
          el.style.transform = "";
          s.shifts.delete(el);
        } else {
          el.style.transform = `translateY(${sh.y}px)`;
        }
      } else {
        el.style.transform = `translateY(${sh.y}px)`;
        moving = true;
      }
    });
    const ctx = canvas.getContext("2d");
    const dpr = s.dpr;
    if (s.strips.length) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    for (let i = s.strips.length - 1; i >= 0; i -= 1) {
      const st = s.strips[i];
      const f = st.feed;
      let len = st.H;
      if (st.phase === "attached") {
        const top = f.ry - m.exit;
        st.hang = top + st.H;
        if (st.hang <= 0) {
          moving = true;
          continue;
        }
        st.ax = f.rx + st.x + st.w / 2;
        st.th = Math.sin(s.t * 6 + st.wave) * 0.03 * smooth(st.hang / 40);
        if (top >= 0) {
          st.phase = "free";
          st.ay = top;
          st.vy = f.v;
          st.vx = pick(-20, 20);
          st.speed = 150 + st.rA * 230;
          st.splay = (st.rA - 0.5) * 320;
          st.rest = side() * pick(0.15, 0.6);
          f.strips -= 1;
        } else {
          st.ay = 0;
          len = st.hang;
        }
      }
      if (st.phase === "free") {
        const tear = Math.pow(clamp(middle(st.pts) / c.fallHeight, 0, 1), 1.2);
        const breath = 0.85 + 0.15 * Math.sin(s.t * (1 + st.rB * 2) + st.rA * 6.2832);
        st.vy = ease(st.vy, st.speed * breath, dt, 0.25);
        st.vx = ease(st.vx, st.splay * tear + (st.ax - m.rw / 2) * 0.25, dt, 0.4);
        st.ax += st.vx * dt;
        st.ay += st.vy * dt;
        st.th = ease(st.th, st.rest, dt, 0.5);
        st.core = 1 - smooth(tear / 0.85) * (0.8 - st.rA * 0.16);
        shape(st, st.H, s.t, tear);
        st.alpha = 1 - smooth((tear - 0.6) / 0.4);
        if (st.alpha <= 0.01 || st.pts[1] > c.fallHeight) {
          s.strips.splice(i, 1);
          continue;
        }
      } else {
        st.core = 1;
        shape(st, len, s.t, 0);
        st.alpha = 1;
      }
      paintStrip(ctx, st, len, dpr);
      moving = true;
    }
    const slit = slitRef.current;
    if (slit) {
      slit.style.transform = pulling ? `translate(${Math.sin(s.t * 140) * 0.5}px, ${Math.cos(s.t * 97) * 0.35}px)` : "";
    }
    if (s.drag || s.feeds.length || moving) {
      s.raf = requestAnimationFrame(step);
    } else {
      s.raf = 0;
    }
  };
  const step = (now) => {
    const s = sim.current;
    try {
      tick(now);
    } catch (err) {
      s.raf = 0;
      throw err;
    }
  };
  const begin = (item, phase, e) => {
    const s = sim.current;
    const c = cfg.current;
    const key = item.id;
    const el = itemEls.current.get(key);
    const slot = slotOf(key);
    if (c.disabled || s.drag || !el || !slot || slot.dataset.gone !== void 0) return;
    if (s.feeds.some((f) => f.key === key)) return;
    const m = metrics();
    const sp = at(slot, m);
    const W = slot.offsetWidth;
    const H = slot.offsetHeight;
    const p = e ? local(e, m) : { x: sp.x, y: sp.y };
    const face = el.firstElementChild || el;
    const fill = getComputedStyle(face).backgroundColor;
    let snap;
    try {
      snap = snapshot(el, W, H);
    } catch {
      snap = Promise.reject(new Error("snapshot"));
    }
    snap.catch(() => {
    });
    const d = {
      key,
      item,
      el,
      slot,
      W,
      H,
      rx: sp.x,
      ry: sp.y,
      tx: sp.x,
      ty: sp.y,
      vx: 0,
      vy: 0,
      tilt: 0,
      lift: 1,
      gx: p.x - sp.x,
      gy: p.y - sp.y,
      px: p.x,
      py: p.y,
      ox: p.x,
      oy: p.y,
      moved: false,
      from: liveKeys().indexOf(key),
      j: -1,
      phase,
      id: e ? e.pointerId : null,
      snap,
      fill: fill === "rgba(0, 0, 0, 0)" || fill === "transparent" ? "rgba(127, 127, 127, 0.35)" : fill
    };
    s.drag = d;
    s.shifts.delete(slot);
    slot.style.transform = "";
    reflow(() => {
      slot.dataset.active = "";
      el.dataset.state = "drag";
      slot.style.height = "0px";
      slot.style.marginBottom = "0px";
    }, slot);
    place(d, at(slot, m));
    run();
  };
  const onDown = (e, item) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    begin(item, "drag", e);
  };
  const onMove = (e) => {
    const d = sim.current.drag;
    if (!d || d.id !== e.pointerId) return;
    const p = local(e, metrics());
    d.px = p.x;
    d.py = p.y;
  };
  const onUp = (e) => {
    const d = sim.current.drag;
    if (!d || d.id !== e.pointerId) return;
    d.id = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
    }
    const m = metrics();
    if (d.ry + d.H > m.lip + 0.5) {
      grab(d, m);
    } else {
      drop(d);
    }
    run();
  };
  const onKey = (e, item) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    e.preventDefault();
    if (e.repeat) return;
    const key = item.id;
    if (reduced()) {
      const el = itemEls.current.get(key);
      const slot = slotOf(key);
      const s = sim.current;
      if (cfg.current.disabled || !el || !slot || slot.dataset.gone !== void 0 || s.feeds.some((f) => f.key === key))
        return;
      consumeNow(key, item, el, slot);
      return;
    }
    begin(item, "carry", null);
  };
  useLayoutEffect(() => {
    settle(null, null);
  });
  useEffect(() => {
    const s = sim.current;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return void 0;
    const fit = () => {
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const cw = root.offsetWidth + OVER * 2;
      const ch = cfg.current.fallHeight;
      if (cw === s.cw && ch === s.ch && dpr === s.dpr) return;
      if (s.cw) s.tops = /* @__PURE__ */ new Map();
      s.cw = cw;
      s.ch = ch;
      s.dpr = dpr;
      canvas.width = Math.ceil(cw * dpr);
      canvas.height = Math.ceil(ch * dpr);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    fit();
    return () => ro.disconnect();
  }, [fallHeight]);
  useEffect(() => {
    const timer = setTimeout(() => {
      itemEls.current.forEach((el) => {
        el.querySelectorAll("img").forEach((img) => {
          dataUrl(img.currentSrc || img.src).catch(() => {
          });
        });
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [items]);
  useEffect(() => {
    if (!autoAnimate) return void 0;
    const s = sim.current;
    let alive = true;
    let timer;
    const wait = (ms) => new Promise((resolve) => {
      timer = setTimeout(resolve, ms);
    });
    const idle = () => !s.drag && s.feeds.length === 0 && s.strips.length === 0 && s.shifts.size === 0;
    const pickNext = () => {
      const list = cfg.current.items;
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (isLive(list[i].id)) return list[i];
      }
      return null;
    };
    const play = async () => {
      await wait(900);
      while (alive) {
        while (alive && !idle()) await wait(120);
        if (!alive) break;
        const item = pickNext();
        if (!item) {
          await wait(1100);
          if (!alive) break;
          revive(goneKeys());
          await wait(1200);
          continue;
        }
        if (!cfg.current.disabled) begin(item, "carry", null);
        await wait(700);
      }
    };
    play();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [autoAnimate]);
  useEffect(() => {
    const s = sim.current;
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.timers.forEach((id) => clearTimeout(id));
      s.timers.clear();
    };
  }, []);
  /* ---- 读取 Vue 模板渲染的 DOM：SFC 拥有节点，引擎只维护模拟与内联样式 ---- */
  let detachers = [];
  // 把监听器绑到当前 DOM 节点。sync() 在 items 变化后会重新调用：
  // Vue 用 key 复用/重建节点，事件闭包里的 item 必须指向最新对象。
  const bindDom = () => {
    detachers.forEach((fn) => fn());
    detachers = [];
    slotEls.current.clear();
    itemEls.current.clear();
    list = rootEl.querySelector('.sh-list');
    rootEl.querySelectorAll('.sh-slot').forEach((slot, index) => {
      const item = cfg.current.items[index];
      if (!item) return;
      slotEls.current.set(item.id, slot);
      const itemEl = slot.querySelector('.sh-item');
      if (!itemEl) return;
      itemEls.current.set(item.id, itemEl);
      const onPointerDown = (e) => onDown(e, item);
      const onKeyDown = (e) => onKey(e, item);
      const onDragStart = (e) => e.preventDefault();
      itemEl.addEventListener('pointerdown', onPointerDown);
      itemEl.addEventListener('pointermove', onMove);
      itemEl.addEventListener('pointerup', onUp);
      itemEl.addEventListener('pointercancel', onUp);
      itemEl.addEventListener('lostpointercapture', onUp);
      itemEl.addEventListener('keydown', onKeyDown);
      itemEl.addEventListener('dragstart', onDragStart);
      detachers.push(() => {
        itemEl.removeEventListener('pointerdown', onPointerDown);
        itemEl.removeEventListener('pointermove', onMove);
        itemEl.removeEventListener('pointerup', onUp);
        itemEl.removeEventListener('pointercancel', onUp);
        itemEl.removeEventListener('lostpointercapture', onUp);
        itemEl.removeEventListener('keydown', onKeyDown);
        itemEl.removeEventListener('dragstart', onDragStart);
      });
    });
    rootRef.current = rootEl;
    slitRef.current = rootEl.querySelector('.sh-slit');
    canvasRef.current = rootEl.querySelector('.sh-canvas');
  };
  bindDom();

  /* React runs effects after commit; run them now that the DOM exists. */
  effects.forEach((fn) => {
    const cleanup = fn();
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  });

  return {
    sync(next) {
      // 对齐 React 的 `cfg.current = {...}`：只改配置，不碰 sim / raf / 在途动画。
      // 关键：父级回传的 items 可能只是重排序，order 以引擎内部为准（React 的 order state）。
      sourceItems = next.items ?? [];
      sorted = buildSorted();
      applyConfig(next);
      cfg.current.items = sorted;
      bindDom();
      // 重新测量位置；正在拖拽/回位/进给的 slot 由 settle 内部跳过。
      settle(null, null);
    },
    destroy() {
      detachers.forEach((fn) => fn());
      detachers.length = 0;
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    }
  };
}
