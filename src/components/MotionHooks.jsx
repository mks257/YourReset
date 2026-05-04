import { useState, useEffect, useRef } from "react";

/** Count up a number from 0 to target with optional delay */
export function useCountUp(target, { duration = 700, delay = 0, enabled = true } = {}) {
  const [val, setVal] = useState(enabled ? 0 : target);
  const raf = useRef(null);

  useEffect(() => {
    if (!enabled) { setVal(target); return; }
    const start = performance.now() + delay;
    const tick = (now) => {
      const elapsed = Math.max(0, now - start);
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [target, duration, delay, enabled]);

  return val;
}

/** Simple tweaks state with localStorage persistence */
export function useTweaks(defaults) {
  const [tweaks, setTweaksState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("yr_tweaks") || "{}");
      return { ...defaults, ...saved };
    } catch { return defaults; }
  });

  const setTweak = (key, value) => {
    setTweaksState(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("yr_tweaks", JSON.stringify(next));
      return next;
    });
  };

  return [tweaks, setTweak];
}
