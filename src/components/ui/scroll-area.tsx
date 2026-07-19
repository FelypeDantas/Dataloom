import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {}

export interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.ScrollAreaScrollbar
  > {}

const scrollAreaClassName = "relative overflow-hidden";

const viewportClassName =
  "h-full w-full rounded-[inherit]";

const scrollbarBaseClassName =
  "flex touch-none select-none transition-colors";

const scrollbarOrientationClassName = {
  vertical:
    "h-full w-2.5 border-l border-l-transparent p-px",

  horizontal:
    "h-2.5 flex-col border-t border-t-transparent p-px",
} as const;

const thumbClassName =
  "relative flex-1 rounded-full bg-border";

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(scrollAreaClassName, className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className={viewportClassName}>
      {children}
    </ScrollAreaPrimitive.Viewport>

    <ScrollBar />

    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));

ScrollArea.displayName = "ScrollArea";

export const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      scrollbarBaseClassName,
      scrollbarOrientationClassName[orientation],
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={thumbClassName}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));

ScrollBar.displayName = "ScrollBar";
