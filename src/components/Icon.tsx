import clsx from "clsx";

export type IconName = "close" | "camera" | "favorite";

type IconSize = "nav" | "action" | "chip";

const sizeClass: Record<IconSize, string> = {
  nav: "text-icon",
  action: "text-icon-action",
  chip: "text-icon-chip",
};

type IconProps = {
  name: IconName;
  size?: IconSize;
  className?: string;
};

/** Material Symbols renders by ligature, so the glyph name is the text node. */
export function Icon({ name, size = "nav", className }: IconProps) {
  return (
    <span aria-hidden="true" className={clsx("font-icon select-none", sizeClass[size], className)}>
      {name}
    </span>
  );
}
