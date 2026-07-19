import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const DEFAULT_SIDE_OFFSET = 6;

const tooltipContentClassName =
  "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-lg " +
  "animate-in fade-in-0 zoom-in-95 " +
  "data-[state=closed]:animate-out " +
  "data-[state=closed]:fade-out-0 " +
  "data-[state=closed]:zoom-out-95 " +
  "data-[side=top]:slide-in-from-bottom-2 " +
  "data-[side=bottom]:slide-in-from-top-2 " +
  "data-[side=left]:slide-in-from-right-2 " +
  "data-[side=right]:slide-in-from-left-2 " +
  "origin-(--radix-tooltip-content-transform-origin)";

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = TooltipPrimitive.Root;

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = DEFAULT_SIDE_OFFSET, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipContentClassName, className)}
      {...props}
    >
      {children}

      <TooltipPrimitive.Arrow
        className="fill-primary"
        width={10}
        height={5}
      />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));

TooltipContent.displayName = "TooltipContent";
