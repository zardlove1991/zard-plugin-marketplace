// @ts-nocheck
// WebGL2 反射卡引擎：结构性改写成 Vue 生命周期，着色器与渲染器逐段照搬 React 原件。
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { createRenderer, FADE_SECONDS, INTRO_MS, OVERSCAN, parseColor, toPx, VIEW_DISTANCE } from './reflectiveCardEngine'

export interface UseReflectiveCardOptions {
  root: Ref<HTMLElement | null>
  body: Ref<HTMLElement | null>
  canvas: Ref<HTMLCanvasElement | null>
  video: Ref<HTMLVideoElement | null>
  cam: Ref<HTMLVideoElement | null>
  videoSrc: () => string | undefined
  webcam: () => boolean
  onWebcamError: (error: Error) => void
  tint: () => string
  metalness: () => number
  roughness: () => number
  blurStrength: () => number
  grayscale: () => number
  warp: () => number
  warpScale: () => number
  shine: () => number
  bevel: () => number
  glare: () => number
  enableTilt: () => boolean
  tiltStrength: () => number
  intro: () => boolean
  radius: () => number
  theme: () => 'dark' | 'light'
}


export function useReflectiveCard(options: UseReflectiveCardOptions) {
  const {
    root: rootRef, body: bodyRef, canvas: canvasRef, video: videoRef, cam: camRef,
    videoSrc, webcam, onWebcamError, tint, metalness, roughness, blurStrength,
    grayscale, warp, warpScale, shine, bevel, glare, enableTilt, tiltStrength, intro, radius, theme
  } = options

  const generation = ref(0)
  const wakeRef: { current: (() => void) | null } = { current: null }
  let teardown: (() => void) | null = null
  let camStream: MediaStream | null = null
  let camCancelled = false

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const opts = () => ({
    tint: parseColor(tint()).map(channel => Math.pow(channel, 2.2)),
    metalness: clamp(metalness(), 0, 1),
    roughness: clamp(roughness(), 0, 1),
    blurStrength: clamp(blurStrength(), 0, 40),
    grayscale: clamp(grayscale(), 0, 1),
    warp: clamp(warp(), 0, 2),
    warpScale: clamp(warpScale(), 0.2, 4),
    shine: clamp(shine(), 0, 3),
    bevel: clamp(bevel(), 0, 16),
    glare: clamp(glare(), 0, 1),
    enableTilt: enableTilt(),
    tiltStrength: clamp(tiltStrength(), 0, 30),
    radius: Math.max(0, radius()),
    theme: theme() === 'light' ? 1 : 0,
    intro: intro()
  })

  function start() {
    teardown?.()
    teardown = null
    const root = rootRef.value;
    const body = bodyRef.value;
    const canvas = canvasRef.value;
    const videoElement = videoRef.value;
    const camElement = camRef.value;
    if (!root || !body || !canvas || !videoElement || !camElement) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = createRenderer(canvas);
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    const light = { p: 0, target: 0 };
    const pointer = { x: 0, y: 0 };
    const size = { width: body.offsetWidth, height: body.offsetHeight, scale: 1 };
    const makeSource = element => ({
      element,
      src: '',
      time: -1,
      ready: false,
      failed: false,
      width: 0,
      height: 0,
      mix: 0
    });
    const sources = { video: makeSource(videoElement), cam: makeSource(camElement) };
    let presence = 1;
    let presenceStart = 0;
    let slowUntil = 0;
    let touchId = null;
    let raf = 0;
    let last = 0;
    let visible = true;
    let pageVisible = document.visibilityState !== 'hidden';
    let lost = false;
    let envKey = '';
    let envFresh = false;

    const write = () => {
      const { enableTilt: tiltOn, tiltStrength: strength } = opts();
      const angle = tiltOn && !reduced ? strength : 0;
      const style = root.style;
      style.setProperty('--rc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
      style.setProperty('--rc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
      const eased = 1 - Math.pow(1 - presence, 3);
      style.setProperty('--rc-presence', eased.toFixed(4));
      style.setProperty('--rc-lift', `${((1 - eased) * 14).toFixed(2)}px`);
    };

    const refresh = (key, source) => {
      const element = source.element;
      const src = element.srcObject ? 'stream' : element.currentSrc;
      if (src !== source.src) {
        source.src = src;
        source.failed = false;
        source.time = -1;
      }
      if (!src) {
        source.ready = false;
        return false;
      }
      if (element.error) {
        source.failed = true;
        return false;
      }
      if (element.readyState < 2 || !element.videoWidth) return false;
      const time = element.currentTime;
      if (source.ready && time === source.time) return false;
      if (!renderer || !renderer.upload(key, element)) {
        source.failed = true;
        return false;
      }
      source.time = time;
      source.width = element.videoWidth;
      source.height = element.videoHeight;
      source.ready = true;
      return true;
    };

    const fade = (source, dt) => {
      const target = source.ready && !source.failed && source.src ? 1 : 0;
      const before = source.mix;
      source.mix += (target - source.mix) * (1 - Math.exp(-dt / FADE_SECONDS));
      if (Math.abs(target - source.mix) < 0.002) source.mix = target;
      return source.mix !== before;
    };

    let resizePending = false;
    const applyResize = () => {
      size.width = body.offsetWidth;
      size.height = body.offsetHeight;
      size.scale = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(size.width * size.scale));
      const h = Math.max(1, Math.round(size.height * size.scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      envFresh = true;
    };

    const resize = () => {
      resizePending = true;
      wake();
    };

    const frame = now => {
      raf = 0;
      if (resizePending) {
        resizePending = false;
        applyResize();
      }
      if (lost) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const slow = now < slowUntil;
      const stiffness = slow ? 24 : 120;
      const damping = slow ? 9 : 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
      if (presence < 1) presence = clamp((now - presenceStart) / 650, 0, 1);

      const moving =
        Math.abs(x.target - x.p) > 0.0005 ||
        Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 ||
        Math.abs(y.v) > 0.0005 ||
        Math.abs(light.target - light.p) > 0.002 ||
        presence < 1;
      if (!moving) {
        x.p = x.target;
        y.p = y.target;
        x.v = 0;
        y.v = 0;
        light.p = light.target;
      }
      write();

      let playing = false;
      if (renderer) {
        if (sources.cam.mix < 1 && refresh('video', sources.video)) envFresh = true;
        if (refresh('cam', sources.cam)) envFresh = true;
        for (const source of [sources.video, sources.cam]) {
          if (source.src && !source.failed && !source.element.paused) playing = true;
          if (fade(source, dt)) envFresh = true;
          if (source.mix > 0 && source.mix < 1) playing = true;
        }
        const s = opts();
        const key = `${s.blurStrength}|${s.roughness}|${size.width}|${size.height}|${size.scale}`;
        if (key !== envKey) {
          envKey = key;
          envFresh = true;
        }
        if (envFresh && (sources.video.mix > 0 || sources.cam.mix > 0)) {
          renderer.renderEnv({
            width: size.width,
            height: size.height,
            scale: size.scale,
            blur: s.blurStrength,
            roughness: s.roughness,
            video: sources.video,
            cam: sources.cam
          });
        }
        envFresh = false;
        const angle = (s.enableTilt && !reduced ? s.tiltStrength : 0) * (Math.PI / 180);
        renderer.renderPlate({
          width: size.width,
          height: size.height,
          rotateX: y.p * angle,
          rotateY: -x.p * angle,
          capture: 1 - (1 - sources.video.mix) * (1 - sources.cam.mix),
          glare: s.glare * light.p,
          pointerX: pointer.x,
          pointerY: pointer.y,
          settings: s
        });
      }

      if ((moving || playing) && visible && pageVisible) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || lost || !visible || !pageVisible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const aim = (nx, ny, on = true) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      light.target = on ? 1 : 0;
      slowUntil = 0;
      wake();
    };

    const aimAt = event => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.x = nx * size.width * 0.5;
      pointer.y = ny * size.height * 0.5;
      aim(nx, ny);
    };

    const release = () => aim(0, 0, false);

    const onEnter = event => {
      if (event.pointerType === 'mouse') aimAt(event);
    };
    const onMove = event => {
      if (event.pointerType === 'mouse' || event.pointerId === touchId) aimAt(event);
    };
    const onLeave = event => {
      if (event.pointerType === 'mouse') release();
    };
    const onDown = event => {
      if (event.pointerType === 'mouse') return;
      touchId = event.pointerId;
      aimAt(event);
    };
    const onUp = event => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      release();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);

    const onLost = event => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => generation.value += 1;
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      wake();
    });
    resizeObserver.observe(body);
    resize();

    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (!reduced) {
        for (const element of [videoElement, camElement]) {
          if (visible && (element.currentSrc || element.srcObject)) element.play().catch(() => {});
          else if (!visible && element.currentSrc && !element.srcObject) element.pause();
        }
      }
      wake();
    });
    intersection.observe(root);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden';
      wake();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onMedia = () => wake();
    const mediaEvents = ['loadeddata', 'playing', 'seeked', 'emptied', 'error'];
    for (const element of [videoElement, camElement]) {
      for (const type of mediaEvents) element.addEventListener(type, onMedia);
    }

    if (opts().intro && !reduced && generation.value === 0) {
      x.p = 0.62;
      y.p = -0.55;
      light.p = 1;
      pointer.x = 0.62 * size.width * 0.5;
      pointer.y = -0.55 * size.height * 0.5;
      presence = 0;
      presenceStart = performance.now();
      slowUntil = performance.now() + INTRO_MS;
    }
    write();
    wake();

    teardown = () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      for (const element of [videoElement, camElement]) {
        for (const type of mediaEvents) element.removeEventListener(type, onMedia);
      }
      renderer?.dispose();
    };

  }

  const applyVideoSrc = () => {
    const video = videoRef.value
    if (!video) return
    const src = videoSrc()
    if (!src) {
      video.removeAttribute('src')
      video.load()
    } else {
      video.src = src
      // play() 在部分环境（jsdom / 自动播放被拒）返回 undefined，需判空再接 catch
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.play()?.catch(() => {})
    }
    wakeRef.current?.()
  }

  onMounted(() => {
    start()
    const host = rootRef.value
    if (host && intro() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.style.setProperty('--rc-presence', '0')
      host.style.setProperty('--rc-lift', '14px')
    }
    // 模板 ref 在 mounted 后才就绪，初始 videoSrc / webcam 必须在这里应用，
    // 不能靠 immediate watch（它在 setup 期以 null ref 触发后不会重跑）。
    applyVideoSrc()
    if (webcam()) startCamera()
  })
  watch(generation, start, { flush: 'post' })
  watch(
    () => [tint(), metalness(), roughness(), blurStrength(), grayscale(), warp(), warpScale(),
      shine(), bevel(), glare(), enableTilt(), tiltStrength(), intro(), radius(), theme()],
    () => wakeRef.current?.(),
    { flush: 'post' }
  )

  watch(videoSrc, applyVideoSrc, { flush: 'post' })

  const stopCamera = () => {
    camCancelled = true
    camStream?.getTracks().forEach(track => track.stop())
    camStream = null
    if (camRef.value) camRef.value.srcObject = null
    wakeRef.current?.()
  }
  const startCamera = () => {
    stopCamera()
    const cam = camRef.value
    if (!webcam() || !cam) return
    const media = navigator.mediaDevices
    if (!media || !media.getUserMedia) {
      onWebcamError(new Error('Camera access is not available in this browser.'))
      return
    }
    camCancelled = false
    media.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      .then(result => {
        if (camCancelled) {
          result.getTracks().forEach(track => track.stop())
          return
        }
        camStream = result
        cam.srcObject = result
        cam.play().catch(() => {})
        wakeRef.current?.()
      })
      .catch(error => { if (!camCancelled) onWebcamError(error) })
  }
  watch(webcam, active => { if (active) startCamera(); else stopCamera() }, { flush: 'post' })

  onBeforeUnmount(() => {
    stopCamera()
    teardown?.()
  })

  return { generation }
}
