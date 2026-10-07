import clsx from "clsx";
import { Box } from "./primitives/Box";
import { Stack } from "./primitives/Stack";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

const CONSENT_COPY =
  "By tapping Agree and Upload a Photo, you consent to Coach and its service providers processing your personal information, including your face measurements, which may be considered biometric data in some jurisdictions, to show you how apparel or makeup styes look on you, for content moderation, and to enhance your images. Any face measurements are deleted within 24 hours of creating each style. You may withdraw your consent at any time. Learn more";

type StepProps = {
  index: string;
  title: string;
  hint?: string;
};

function Step({ index, title, hint }: StepProps) {
  return (
    <Stack direction="row" gap="base" align="center">
      <Stack
        align="center"
        justify="center"
        className="size-30 shrink-0 rounded-pill bg-step-badge"
      >
        <Box className="text-body text-ink">{index}</Box>
      </Stack>
      <Stack gap="hair" align="start" className="pt-3">
        <Box className="text-body text-ink">{title}</Box>
        {hint ? (
          <Box className="text-caption tracking-label text-ink-strong opacity-60">{hint}</Box>
        ) : null}
      </Stack>
    </Stack>
  );
}

type SplashScreenProps = {
  show: boolean;
  onAgree: () => void;
};

export function SplashScreen({ show, onAgree }: SplashScreenProps) {
  return (
    <Box className="absolute inset-0 overflow-hidden">
      {/* The white ground fades with the content so the try-on photo can read through. */}
      <Box
        className={clsx(
          "absolute inset-0 bg-page transition-enter motion-reduce:transition-none",
          show ? "opacity-100" : "opacity-0",
        )}
      />

      <Reveal show={show} step="first" className="absolute right-16 top-16 text-ink">
        <Icon name="close" />
      </Reveal>

      <Reveal
        show={show}
        step="first"
        className="absolute left-1/2 top-36 w-max -translate-x-1/2"
      >
        <Stack align="center">
          <Box className="text-label tracking-label text-ink-strong">Virtual Try-On</Box>
          <Box className="text-display text-ink">See how it fits you</Box>
        </Stack>
      </Reveal>

      <Reveal
        show={show}
        step="second"
        className="absolute left-1/2 top-72 h-568 w-346 -translate-x-1/2 bg-splash-phone bg-cover bg-center"
      />

      <Reveal show={show} step="third" className="absolute left-0 top-656 w-440 px-10">
        <Stack gap="base" align="start">
          <Step index="1" title="Upload a selfie" hint="Or take a photo using your camera" />
          <Step index="2" title="See how anything looks on you" />
        </Stack>
      </Reveal>

      <Reveal show={show} step="fourth" className="absolute bottom-0 left-0 w-440 px-5 pb-5">
        <Stack gap="tight" align="center">
          <Box className="h-1 self-stretch bg-hairline opacity-10" />
          <Stack gap="tight" align="start" className="self-stretch pt-8">
            <Box className="self-stretch text-caption tracking-label text-ink-muted">
              {CONSENT_COPY}
            </Box>
            <Stack gap="base" align="center" className="self-stretch pb-16">
              <Box
                as="button"
                type="button"
                onClick={onAgree}
                className="h-55 self-stretch bg-ink text-label text-ink-inverse transition-enter motion-reduce:transition-none active:opacity-80"
              >
                Agree and Upload a Photo
              </Box>
              <Box
                as="button"
                type="button"
                className="text-label tracking-label text-ink-strong underline decoration-1"
              >
                Go back
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Reveal>
    </Box>
  );
}
