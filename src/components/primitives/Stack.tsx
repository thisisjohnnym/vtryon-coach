import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";
import clsx from "clsx";

type Gap = "none" | "hair" | "nudge" | "tight" | "snug" | "cozy" | "base" | "loose";
type Align = "start" | "center" | "end" | "stretch";
type Justify = "start" | "center" | "end" | "between";

const gapClass: Record<Gap, string> = {
  none: "gap-0",
  hair: "gap-2",
  nudge: "gap-4",
  tight: "gap-5",
  snug: "gap-6",
  cozy: "gap-7",
  base: "gap-10",
  loose: "gap-14",
};

const alignClass: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClass: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

type StackOwnProps<T extends ElementType> = {
  as?: T;
  direction?: "row" | "column";
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  className?: string;
  children?: ReactNode;
};

export type StackProps<T extends ElementType> = StackOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof StackOwnProps<T>>;

/** Flex primitive with a closed set of token-backed gaps and alignments. */
export function Stack<T extends ElementType = "div">({
  as,
  direction = "column",
  gap = "none",
  align = "stretch",
  justify = "start",
  className,
  children,
  ...rest
}: StackProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      className={clsx(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapClass[gap],
        alignClass[align],
        justifyClass[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
