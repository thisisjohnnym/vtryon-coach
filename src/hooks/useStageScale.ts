import { useEffect, useState } from "react";

export const STAGE_WIDTH = 440;
export const STAGE_HEIGHT = 956;

function measure() {
  return Math.min(
    1,
    window.innerWidth / STAGE_WIDTH,
    window.innerHeight / STAGE_HEIGHT,
  );
}

/** Keeps the 440x956 Paper geometry intact and fits it inside the viewport. */
export function useStageScale() {
  const [scale, setScale] = useState(measure);

  useEffect(() => {
    const onResize = () => setScale(measure());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return scale;
}
