import { useEffect, useState } from "react";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { Box } from "./primitives/Box";
import { Stack } from "./primitives/Stack";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { ColorCarousel } from "./ColorCarousel";
import { PRODUCT_PRICE, PRODUCT_TITLE, colorways } from "../data/colorways";

type TryOnPhotoProps = {
  heroIndex: number;
  visible: boolean;
};

/**
 * Crossfades between colourway photos using a front and a back slot. The
 * outgoing photo is held fully opaque underneath the incoming one, because two
 * layers fading independently would expose the backdrop at the midpoint and
 * read as a dark dip.
 */
function TryOnPhoto({ heroIndex, visible }: TryOnPhotoProps) {
  const [front, setFront] = useState(heroIndex);
  const [back, setBack] = useState(heroIndex);
  const [frontArrived, setFrontArrived] = useState(true);

  useEffect(() => {
    if (heroIndex === front) return;
    setBack(front);
    setFront(heroIndex);
    setFrontArrived(false);
  }, [front, heroIndex]);

  useEffect(() => {
    if (frontArrived) return;
    const frame = requestAnimationFrame(() => setFrontArrived(true));
    return () => cancelAnimationFrame(frame);
  }, [frontArrived]);

  return (
    <Box
      className={clsx(
        "absolute inset-0 transition-enter motion-reduce:transition-none",
        visible ? "opacity-100 blur-clear" : "opacity-0 blur-veil",
      )}
    >
      {colorways.map((colorway, index) => {
        const isFront = index === front;
        const isBack = index === back && !isFront;
        return (
          <Box
            key={colorway.id}
            className={clsx(
              "absolute -top-48 left-1/2 h-956 w-440 -translate-x-1/2 bg-artwork bg-cover bg-center transition-swap motion-reduce:transition-none",
              isFront && "z-2",
              isBack && "z-1",
              isFront && !frontArrived && "opacity-0 blur-veil",
              isFront && frontArrived && "opacity-100 blur-clear",
              isBack && "opacity-100 blur-clear",
              !isFront && !isBack && "opacity-0",
            )}
            style={{ "--artwork": `url(${colorway.hero})` } as CSSProperties}
          />
        );
      })}
      <Box className="absolute inset-0 z-3 bg-photo-wash opacity-10" />
    </Box>
  );
}

type TryOnScreenProps = {
  screenVisible: boolean;
  contentVisible: boolean;
  heroIndex: number;
  initialColorwayIndex: number;
  resetToken: number;
  onSettle: (index: number) => void;
  onClose: () => void;
  onUnavailable: () => void;
};

export function TryOnScreen({
  screenVisible,
  contentVisible,
  heroIndex,
  initialColorwayIndex,
  resetToken,
  onSettle,
  onClose,
  onUnavailable,
}: TryOnScreenProps) {
  return (
    // Deliberately no background here: the screen fades over the stage's white
    // ground, so the hand-off to and from the splash never darkens.
    <Box className="absolute inset-0 overflow-hidden">
      <TryOnPhoto heroIndex={heroIndex} visible={screenVisible} />

      <Reveal
        show={screenVisible}
        step="first"
        className="absolute bottom-341 left-0 w-440 p-10"
      >
        <Stack direction="row" gap="base" align="start">
          <Box
            as="button"
            type="button"
            onClick={onUnavailable}
            className="flex h-44 items-center gap-6 rounded-chip bg-surface px-12 backdrop-blur-glass"
          >
            <Box className="pt-2 text-body tracking-label text-ink-strong">Change photo</Box>
          </Box>
          <Box
            as="button"
            type="button"
            aria-label="Take a photo"
            onClick={onUnavailable}
            className="flex h-44 items-center justify-center gap-6 rounded-chip bg-surface px-12 backdrop-blur-glass"
          >
            <Icon name="camera" size="action" />
          </Box>
        </Stack>
      </Reveal>

      <Stack
        gap="loose"
        align="center"
        className={clsx(
          "absolute bottom-0 left-0 h-341 w-440 overflow-hidden rounded-t-drawer bg-surface transition-drawer motion-reduce:transition-none",
          screenVisible ? "opacity-100" : "opacity-0",
        )}
      >
        <Reveal show={contentVisible} step="first" className="self-stretch px-18 pt-18">
          <Stack direction="row" align="center" justify="between">
            <Icon name="close" className="shrink-0 opacity-0" />
            <Stack gap="hair" align="center">
              <Box className="text-label tracking-label text-ink-strong">Virtual Try-On</Box>
              <Box className="text-title text-ink">{PRODUCT_TITLE}</Box>
            </Stack>
            <Box
              as="button"
              type="button"
              aria-label="Close try-on"
              onClick={onClose}
              className="shrink-0 text-ink"
            >
              <Icon name="close" />
            </Box>
          </Stack>
        </Reveal>

        <Reveal show={contentVisible} step="second" className="self-stretch">
          <ColorCarousel
            colorways={colorways}
            initialIndex={initialColorwayIndex}
            resetToken={resetToken}
            onSettle={onSettle}
          />
        </Reveal>

        <Stack gap="base" align="center" className="self-stretch pb-10">
          <Reveal show={contentVisible} step="third" className="self-stretch px-5 pb-5">
            <Stack direction="row" gap="tight" align="start" justify="start">
              <Box
                as="button"
                type="button"
                className="flex h-59 flex-1 items-center justify-center bg-ink text-label text-ink-inverse"
              >
                Add to Cart — {PRODUCT_PRICE}
              </Box>
              <Box
                as="button"
                type="button"
                aria-label="Buy with Apple Pay"
                className="flex h-59 flex-1 items-center justify-center bg-surface outline-1 -outline-offset-1 outline-hairline/20"
              >
                <Box className="h-19 w-42 bg-apple-pay bg-contain bg-center bg-no-repeat" />
              </Box>
            </Stack>
          </Reveal>

          <Reveal show={contentVisible} step="fourth" className="w-410">
            <Stack direction="row" gap="nudge" align="center" justify="center">
              <Box className="text-label tracking-label text-ink-strong">
                4 interest-free payments of $14.63 with Afterpay.
              </Box>
              <Box
                as="button"
                type="button"
                className="text-label tracking-label text-ink-strong underline decoration-1"
              >
                Learn more
              </Box>
            </Stack>
          </Reveal>
        </Stack>
      </Stack>
    </Box>
  );
}
