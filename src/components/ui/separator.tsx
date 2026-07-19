import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {}

const separatorBaseClassName = "shrink-0 bg-border";

const separatorOrientationClassName = {
  horizontal: "h-px w-full",
  vertical: "h-full w-px",
} as const;

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      ...props
    },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorBaseClassName,
        separatorOrientationClassName[orientation],
        className,
      )}
      {...props}
    />
  ),
);

Separator.displayName = "Separator";
