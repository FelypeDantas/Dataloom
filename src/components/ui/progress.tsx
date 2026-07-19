"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {}

const progressRootClassName = [
  "relative",
  "h-2 w-full",
  "overflow-hidden",
  "rounded-full",
  "bg-primary/20",
].join(" ");

const progressIndicatorClassName = [
  "h-full",
  "flex-1",
  "bg-primary",
  "transition-transform",
].join(" ");

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, ...props }, ref) => {
  const progress = clamp(value);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressRootClassName, className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={progressIndicatorClassName}
        style={{
          transform: `translateX(-${100 - progress}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = "Progress";
