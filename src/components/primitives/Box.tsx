import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

type BoxOwnProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
};

export type BoxProps<T extends ElementType> = BoxOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof BoxOwnProps<T>>;

/** Thin layout primitive. Semantics come from `as`, styling from theme tokens. */
export function Box<T extends ElementType = "div">({ as, children, ...rest }: BoxProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return <Component {...rest}>{children}</Component>;
}
