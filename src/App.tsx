import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import clsx from "clsx";
import { Box } from "./components/primitives/Box";
import { SplashScreen } from "./components/SplashScreen";
import { TryOnScreen } from "./components/TryOnScreen";
import { ComingSoonOverlay } from "./components/ComingSoonOverlay";
import { INITIAL_COLORWAY_INDEX } from "./data/colorways";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useStageScale } from "./hooks/useStageScale";

/** Beats of the hand-off between the splash and the try-on, in milliseconds. */
const SCREEN_IN_AT = 160;
const CONTENT_IN_AT = 380;
const SPLASH_BACK_AT = 220;
/** Late enough that rewinding the try-on happens behind a fully opaque splash. */
const REWIND_AT = 1100;
const COMING_SOON_HOLD = 1000;

export function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const scale = useStageScale();

  const [splashVisible, setSplashVisible] = useState(false);
  const [onSplash, setOnSplash] = useState(true);
  const [screenVisible, setScreenVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [heroIndex, setHeroIndex] = useState(INITIAL_COLORWAY_INDEX);
  const [resetToken, setResetToken] = useState(0);
  const [comingSoon, setComingSoon] = useState(false);

  const timers = useRef<number[]>([]);
  const comingSoonTimer = useRef<number | null>(null);

  const schedule = useCallback(
    (callback: () => void, delay: number) => {
      timers.current.push(window.setTimeout(callback, prefersReducedMotion ? 0 : delay));
    },
    [prefersReducedMotion],
  );

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setSplashVisible(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const onAgree = useCallback(() => {
    clearTimers();
    setSplashVisible(false);
    setOnSplash(false);
    schedule(() => setScreenVisible(true), SCREEN_IN_AT);
    schedule(() => setContentVisible(true), CONTENT_IN_AT);
  }, [clearTimers, schedule]);

  const onClose = useCallback(() => {
    clearTimers();
    setContentVisible(false);
    setScreenVisible(false);
    schedule(() => {
      setOnSplash(true);
      setSplashVisible(true);
    }, SPLASH_BACK_AT);
    schedule(() => {
      setHeroIndex(INITIAL_COLORWAY_INDEX);
      setResetToken((value) => value + 1);
    }, REWIND_AT);
  }, [clearTimers, schedule]);

  const onUnavailable = useCallback(() => {
    if (comingSoonTimer.current !== null) window.clearTimeout(comingSoonTimer.current);
    setComingSoon(true);
    comingSoonTimer.current = window.setTimeout(() => setComingSoon(false), COMING_SOON_HOLD);
  }, []);

  const onSettle = useCallback((index: number) => setHeroIndex(index), []);

  return (
    <Box className="flex h-full w-full items-center justify-center overflow-hidden bg-ink">
      <Box
        className="relative h-956 w-440 shrink-0 overflow-hidden bg-page"
        // Scale is viewport-derived, so it has to be a live value rather than a class.
        style={{ transform: `scale(${scale})` } as CSSProperties}
      >
        <TryOnScreen
          screenVisible={screenVisible}
          contentVisible={contentVisible}
          heroIndex={heroIndex}
          initialColorwayIndex={INITIAL_COLORWAY_INDEX}
          resetToken={resetToken}
          onSettle={onSettle}
          onClose={onClose}
          onUnavailable={onUnavailable}
        />

        <Box
          inert={onSplash ? undefined : true}
          className={clsx("absolute inset-0", onSplash ? undefined : "pointer-events-none")}
        >
          <SplashScreen show={splashVisible} onAgree={onAgree} />
        </Box>

        <ComingSoonOverlay show={comingSoon} />
      </Box>
    </Box>
  );
}
