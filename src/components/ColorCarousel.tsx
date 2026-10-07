import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Box } from "./primitives/Box";
import { Stack } from "./primitives/Stack";
import { Icon } from "./Icon";
import type { Colorway } from "../data/colorways";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Paper draws five tiles. One extra slot on each side keeps both edges filled
 * while a drag sits between two colourways.
 */
const SLOTS = [-3, -2, -1, 0, 1, 2, 3];

const FRAME_CENTER = 220;
const SMALL_WIDTH = 82;
const SMALL_HEIGHT = 90;
const LARGE_WIDTH = 134;
const LARGE_HEIGHT = 139;
const TILE_GAP = 10;

const DRAG_PITCH = 110;
const SNAP_MS = 520;
/** Steps per millisecond above which a release carries on to the next bag. */
const FLICK_THRESHOLD = 0.004;
const VELOCITY_SMOOTHING = 0.4;
const TAP_SLOP = 8;

/** The colour name trails the strip, so it reads as moving behind the bags. */
const NAME_PITCH = 200;
const NAME_LAG_TAU = 65;
const NAME_FALLOFF = 1.25;
const NAME_BLUR = 4;

const easeOutQuint = (progress: number) => 1 - Math.pow(1 - progress, 5);
const modulo = (value: number, size: number) => ((value % size) + size) % size;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type DragState = {
  pointerId: number;
  startX: number;
  startPosition: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: number;
};

type ColorCarouselProps = {
  colorways: Colorway[];
  initialIndex: number;
  /** Bumped when the prototype returns to the splash, to rewind the strip. */
  resetToken: number;
  onSettle: (index: number) => void;
};

export function ColorCarousel({
  colorways,
  initialIndex,
  resetToken,
  onSettle,
}: ColorCarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [base, setBase] = useState(initialIndex);

  const baseRef = useRef(initialIndex);
  const position = useRef(initialIndex);
  const namePosition = useRef(initialIndex);
  const animation = useRef<{ from: number; to: number; start: number } | null>(null);
  const drag = useRef<DragState | null>(null);
  const releaseDrag = useRef<(() => void) | null>(null);
  const draggedPastSlop = useRef(false);
  const settled = useRef(initialIndex);

  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const heartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nameRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyLayout = useCallback(() => {
    const pos = position.current;
    const anchorBase = baseRef.current;

    // Widths grow towards the centre, then tiles are laid out cumulatively so
    // the 10px gap from the design holds at every point of the drag.
    const metrics = SLOTS.map((slot) => {
      const offset = anchorBase + slot - pos;
      const nearness = Math.max(0, 1 - Math.abs(offset));
      return {
        nearness,
        width: SMALL_WIDTH + (LARGE_WIDTH - SMALL_WIDTH) * nearness,
        height: SMALL_HEIGHT + (LARGE_HEIGHT - SMALL_HEIGHT) * nearness,
      };
    });

    const centers: number[] = [];
    metrics.forEach((metric, index) => {
      centers.push(
        index === 0
          ? metric.width / 2
          : centers[index - 1] + metrics[index - 1].width / 2 + TILE_GAP + metric.width / 2,
      );
    });

    const anchor = SLOTS.indexOf(Math.floor(pos) - anchorBase);
    const fraction = pos - Math.floor(pos);
    const target = centers[anchor] + (centers[anchor + 1] - centers[anchor]) * fraction;
    const shift = FRAME_CENTER - target;

    metrics.forEach((metric, index) => {
      const tile = tileRefs.current[index];
      if (tile) {
        const x = centers[index] + shift - metric.width / 2;
        tile.style.width = `${metric.width}px`;
        tile.style.height = `${metric.height}px`;
        tile.style.transform = `translate(${x}px, ${-metric.height / 2}px)`;
      }
      const heart = heartRefs.current[index];
      if (heart) heart.style.opacity = `${metric.nearness}`;
    });

    SLOTS.forEach((slot, index) => {
      const name = nameRefs.current[index];
      if (!name) return;
      const offset = anchorBase + slot - namePosition.current;
      const visibility = clamp01(1 - Math.abs(offset) * NAME_FALLOFF);
      name.style.transform = `translateX(${offset * NAME_PITCH}px)`;
      name.style.opacity = `${visibility}`;
      name.style.filter = `blur(${(1 - visibility) * NAME_BLUR}px)`;
    });
  }, []);

  const animateTo = useCallback(
    (target: number) => {
      // The photo swap is committed as the bag starts moving rather than once it
      // lands, so the two read as one response to the tap or release.
      const resting = modulo(target, colorways.length);
      if (resting !== settled.current) {
        settled.current = resting;
        onSettle(resting);
      }

      if (prefersReducedMotion) {
        position.current = target;
        namePosition.current = target;
        animation.current = null;
        return;
      }
      animation.current = { from: position.current, to: target, start: performance.now() };
    },
    [colorways.length, onSettle, prefersReducedMotion],
  );

  /**
   * Drag is tracked on the window rather than through setPointerCapture, which
   * would retarget the click away from the tile buttons and break tap-to-select.
   */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    animation.current = null;
    draggedPastSlop.current = false;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startPosition: position.current,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: 0,
    };

    const onMove = (moveEvent: PointerEvent) => {
      const active = drag.current;
      if (!active || active.pointerId !== moveEvent.pointerId) return;

      const now = performance.now();
      const elapsed = Math.max(1, now - active.lastTime);

      const sample = (active.lastX - moveEvent.clientX) / DRAG_PITCH / elapsed;
      active.velocity =
        active.velocity + (sample - active.velocity) * VELOCITY_SMOOTHING;
      active.lastX = moveEvent.clientX;
      active.lastTime = now;
      active.moved = Math.max(active.moved, Math.abs(moveEvent.clientX - active.startX));
      if (active.moved >= TAP_SLOP) draggedPastSlop.current = true;

      position.current = active.startPosition - (moveEvent.clientX - active.startX) / DRAG_PITCH;
    };

    const onUp = (upEvent: PointerEvent) => {
      const active = drag.current;
      releaseDrag.current?.();
      if (!active || active.pointerId !== upEvent.pointerId) return;
      drag.current = null;

      if (!draggedPastSlop.current) return;

      if (Math.abs(active.velocity) <= FLICK_THRESHOLD) {
        animateTo(Math.round(position.current));
        return;
      }
      animateTo(
        active.velocity > 0 ? Math.ceil(position.current) : Math.floor(position.current),
      );
    };

    releaseDrag.current?.();
    releaseDrag.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      releaseDrag.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const selectSlot = (slot: number) => {
    if (draggedPastSlop.current) return;
    animateTo(baseRef.current + slot);
  };

  useEffect(() => () => releaseDrag.current?.(), []);

  useEffect(() => {
    animation.current = null;
    drag.current = null;
    position.current = initialIndex;
    namePosition.current = initialIndex;
    baseRef.current = initialIndex;
    settled.current = initialIndex;
    setBase(initialIndex);
  }, [initialIndex, resetToken]);

  useLayoutEffect(applyLayout, [applyLayout, base]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();

    const render = (now: number) => {
      const delta = Math.min(64, now - previous);
      previous = now;

      const running = animation.current;
      if (running) {
        const progress = Math.min(1, (now - running.start) / SNAP_MS);
        position.current = running.from + (running.to - running.from) * easeOutQuint(progress);
        if (progress >= 1) {
          position.current = running.to;
          animation.current = null;
        }
      }

      const pos = position.current;
      const nextBase = Math.round(pos);
      if (nextBase !== baseRef.current) {
        baseRef.current = nextBase;
        setBase(nextBase);
      }

      namePosition.current = prefersReducedMotion
        ? pos
        : namePosition.current +
          (pos - namePosition.current) * (1 - Math.exp(-delta / NAME_LAG_TAU));

      applyLayout();

      if (!drag.current && !animation.current && Math.abs(pos - nextBase) < 0.001) {
        const resting = modulo(nextBase, colorways.length);
        if (resting !== settled.current) {
          settled.current = resting;
          onSettle(resting);
        }
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [applyLayout, colorways.length, onSettle, prefersReducedMotion]);

  return (
    <Stack gap="tight" align="center" className="self-stretch">
      <Box
        className="relative h-139 w-440 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
      >
        {SLOTS.map((slot, index) => {
          const colorway = colorways[modulo(base + slot, colorways.length)];
          return (
            <Box
              as="button"
              key={slot}
              type="button"
              ref={(node: HTMLButtonElement | null) => {
                tileRefs.current[index] = node;
              }}
              aria-label={colorway.name}
              onClick={() => selectSlot(slot)}
              className="absolute left-0 top-1/2"
            >
              <Box
                className="size-full bg-artwork bg-no-repeat"
                style={
                  {
                    // Per-colorway crop values come straight from the Paper rectangles.
                    "--artwork": `url(${colorway.tile})`,
                    backgroundSize: colorway.tileSize,
                    backgroundPosition: colorway.tilePosition,
                  } as CSSProperties
                }
              />
              <Stack
                align="center"
                justify="center"
                ref={(node: HTMLDivElement | null) => {
                  heartRefs.current[index] = node;
                }}
                className="absolute right-8 top-8 size-22 bg-surface backdrop-blur-glass"
              >
                <Icon name="favorite" size="chip" />
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box className="relative h-15 w-440 overflow-hidden">
        {SLOTS.map((slot, index) => (
          <Box
            key={slot}
            ref={(node: HTMLDivElement | null) => {
              nameRefs.current[index] = node;
            }}
            className="absolute inset-x-0 top-0 text-center text-label tracking-label text-ink-strong"
          >
            {colorways[modulo(base + slot, colorways.length)].name}
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
