import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import clsx from "clsx";

/** Stagger steps for drawer and splash content, top of the screen downwards. */
export type RevealStep = "first" | "second" | "third" | "fourth" | "fifth";

const delayClass: Record<RevealStep, string> = {
  first: "delay-0",
  second: "delay-70",
  third: "delay-140",
  fourth: "delay-210",
  fifth: "delay-280",
};

type RevealOwnProps<T extends ElementType> = {
  as?: T;
  show: boolean;
  step?: RevealStep;
  className?: string;
  children?: ReactNode;
};

export type RevealProps<T extends ElementType> = RevealOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T>>;

/**
 * Stays mounted in both states and crossfades through blur, so nothing in the
 * prototype appears or disappears instantly.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  show,
  step = "first",
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      inert={show ? undefined : true}
      className={clsx(
        "transition-enter motion-reduce:transition-none",
        show ? ["opacity-100", "blur-clear", delayClass[step]] : ["opacity-0", "blur-veil"],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
