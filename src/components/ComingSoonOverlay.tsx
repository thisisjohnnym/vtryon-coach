import clsx from "clsx";
import { Box } from "./primitives/Box";
import { Stack } from "./primitives/Stack";

type ComingSoonOverlayProps = {
  show: boolean;
};

export function ComingSoonOverlay({ show }: ComingSoonOverlayProps) {
  return (
    <Stack
      align="center"
      justify="center"
      inert
      className={clsx(
        "absolute inset-0 motion-reduce:transition-none",
        show ? "transition-overlay opacity-100 blur-clear" : "transition-exit opacity-0 blur-veil",
      )}
    >
      <Box className="absolute inset-0 bg-scrim opacity-50" />
      <Box className="relative text-overlay text-ink-inverse">Coming soon</Box>
    </Stack>
  );
}
