import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

const sliderRootClassName = [
  "relative",
  "flex w-full items-center",
  "touch-none select-none",
].join(" ");

const sliderTrackClassName = [
  "relative",
  "h-1.5 w-full grow",
  "overflow-hidden rounded-full",
  "bg-primary/20",
].join(" ");

const sliderRangeClassName = [
  "absolute",
  "h-full",
  "bg-primary",
].join(" ");

const sliderThumbClassName = [
  "block h-4 w-4",
  "rounded-full",
  "border border-primary/50",
  "bg-background",
  "shadow-sm",
  "transition-colors",

  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",

  "disabled:pointer-events-none",
  "disabled:opacity-50",
].join(" ");

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(sliderRootClassName, className)}
    {...props}
  >
    <SliderPrimitive.Track className={sliderTrackClassName}>
      <SliderPrimitive.Range className={sliderRangeClassName} />
    </SliderPrimitive.Track>

    <SliderPrimitive.Thumb className={sliderThumbClassName} />
  </SliderPrimitive.Root>
));

Slider.displayName = "Slider";
