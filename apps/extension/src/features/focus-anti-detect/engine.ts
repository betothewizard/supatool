import { FOCUS_SPOOF_STORAGE_KEY } from './storage';

export function initFocusAntiDetectEngine() {
  try {
    if (!window.sessionStorage.getItem(FOCUS_SPOOF_STORAGE_KEY)) {
      return;
    }
  } catch {
    return;
  }

  // 1. Spoof Visibility API & focus methods
  try {
    Object.defineProperty(document, 'hidden', {
      get: () => false,
      configurable: true,
    });

    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true,
    });

    document.hasFocus = () => true;
  } catch (e) {
    console.warn('[Supatool Keep-Alive] Error configuring document visibility', e);
  }

  // 2. Prevent assignment of inline event handlers
  const eventsToBlockProps = ['onfocus', 'onblur', 'onvisibilitychange', 'onmouseleave', 'onpagehide', 'onresize'];
  eventsToBlockProps.forEach((prop) => {
    try {
      if (prop in window) {
        Object.defineProperty(window, prop, {
          get: () => null,
          set: () => {},
          configurable: false,
        });
      }
      if (prop in document) {
        Object.defineProperty(document, prop, {
          get: () => null,
          set: () => {},
          configurable: false,
        });
      }
    } catch {}
  });

  // 3. Intercept addEventListener & block focus/blur/visibility events in capture phase
  const alwaysBlockEvents = [
    'visibilitychange',
    'webkitvisibilitychange',
    'mozvisibilitychange',
    'msvisibilitychange',
    'blur',
    'focusout',
    'mouseleave',
    'pagehide',
  ];

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type: string, listener: any, options?: any) {
    if (alwaysBlockEvents.includes(type)) {
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  alwaysBlockEvents.forEach((type) => {
    const handler = (e: Event) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
    };
    try {
      window.addEventListener(type, handler, true);
      document.addEventListener(type, handler, true);
    } catch {}
  });

  // 4. Timing & background throttle bypass (AudioContext + rAF + rVFC)
  (function initTimingProtection() {
    const getNow = () => (window.performance && performance.now ? performance.now() : Date.now());

    // Inaudible AudioContext to prevent tab background throttling
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain).connect(ctx.destination);
        osc.start();

        const resume = () => {
          try {
            if (ctx.state === 'suspended') {
              ctx.resume().catch(() => {});
            }
          } catch {}
        };
        ['pointerdown', 'keydown', 'touchstart'].forEach((t) =>
          window.addEventListener(t, resume, { once: true, capture: true })
        );
      }
    } catch {}

    // requestVideoFrameCallback shim for video elements
    function installVideoFrameShim() {
      const VP = window.HTMLVideoElement && HTMLVideoElement.prototype;
      if (!VP || !(VP as any).requestVideoFrameCallback) return () => {};

      const nativeRVFC = (VP as any).requestVideoFrameCallback;
      const states = new WeakMap<HTMLVideoElement, any>();
      const tracked = new Set<WeakRef<HTMLVideoElement>>();
      let seq = 0;

      const stateOf = (video: HTMLVideoElement) => {
        let s = states.get(video);
        if (!s) {
          s = { pending: [], lastNative: getNow(), presented: 0, driving: false };
          states.set(video, s);
          try {
            tracked.add(new WeakRef(video));
          } catch {}
        }
        return s;
      };

      const deliver = (s: any, ts: number, meta: any) => {
        if (!s.pending.length) return;
        const batch = s.pending;
        s.pending = [];
        for (const item of batch) {
          try {
            item.cb(ts, meta);
          } catch {}
        }
      };

      const driveNative = (video: HTMLVideoElement, s: any) => {
        try {
          nativeRVFC.call(video, (ts: number, meta: any) => {
            s.lastNative = getNow();
            s.presented = meta.presentedFrames;
            deliver(s, ts, meta);
            driveNative(video, s);
          });
        } catch {
          s.driving = false;
        }
      };

      (VP as any).requestVideoFrameCallback = function (cb: any) {
        const s = stateOf(this);
        const id = ++seq;
        s.pending.push({ id, cb });
        if (!s.driving) {
          s.driving = true;
          driveNative(this, s);
        }
        return id;
      };

      (VP as any).cancelVideoFrameCallback = function (id: number) {
        for (const ref of tracked) {
          const v = ref.deref();
          if (!v) continue;
          const s = states.get(v);
          if (!s) continue;
          const i = s.pending.findIndex((e: any) => e.id === id);
          if (i >= 0) {
            s.pending.splice(i, 1);
            return;
          }
        }
      };

      try {
        (VP as any).requestVideoFrameCallback.toString = () =>
          'function requestVideoFrameCallback() { [native code] }';
      } catch {}

      return function rvfcTick() {
        const t = getNow();
        for (const ref of tracked) {
          const video = ref.deref();
          if (!video) {
            tracked.delete(ref);
            continue;
          }
          const s = states.get(video);
          if (!s || !s.pending.length) continue;
          if (t - s.lastNative <= 100) continue;
          if (video.paused || video.ended || video.readyState < 2) continue;

          deliver(s, t, {
            presentationTime: t,
            expectedDisplayTime: t,
            width: video.videoWidth || 0,
            height: video.videoHeight || 0,
            mediaTime: video.currentTime || 0,
            presentedFrames: ++s.presented,
            processingDuration: 0,
          });
        }
      };
    }

    // requestAnimationFrame shim
    const nativeRAF = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : null;
    if (nativeRAF) {
      const pending = new Map<number, FrameRequestCallback>();
      let seq = 0;
      let lastNativeFire = getNow();

      const flush = () => {
        if (!pending.size) return;
        const ts = getNow();
        const cbs = Array.from(pending.values());
        pending.clear();
        for (const cb of cbs) {
          try {
            cb(ts);
          } catch {}
        }
      };

      (function probe() {
        nativeRAF(() => {
          lastNativeFire = getNow();
          flush();
          probe();
        });
      })();

      const watchdog = () => {
        if (getNow() - lastNativeFire > 250) {
          flush();
        }
      };

      const rvfcTick = installVideoFrameShim();
      const onTick = () => {
        watchdog();
        rvfcTick();
      };

      try {
        const src =
          'let i=null;onmessage=e=>{if(e.data&&!i)i=setInterval(()=>postMessage(0),16);else if(!e.data&&i){clearInterval(i);i=null;}};';
        const w = new Worker(URL.createObjectURL(new Blob([src], { type: 'application/javascript' })));
        w.onmessage = onTick;
        w.postMessage(true);
      } catch {}

      setInterval(onTick, 100);

      const shimRAF = (cb: FrameRequestCallback): number => {
        const id = ++seq;
        pending.set(id, cb);
        return id;
      };

      const shimCancel = (id: number): void => {
        pending.delete(id);
      };

      try {
        shimRAF.toString = () => 'function requestAnimationFrame() { [native code] }';
        shimCancel.toString = () => 'function cancelAnimationFrame() { [native code] }';
        window.requestAnimationFrame = shimRAF;
        window.cancelAnimationFrame = shimCancel;
        (window as any).webkitRequestAnimationFrame = shimRAF;
        (window as any).webkitCancelAnimationFrame = shimCancel;
      } catch {}
    }
  })();
}
