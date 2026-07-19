import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

const switchRootClassName = [
  "peer",
  "inline-flex h-5 w-9 shrink-0 items-center",
  "rounded-full border-2 border-transparent",

  "cursor-pointer",
  "shadow-sm transition-colors",

  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",

  "disabled:pointer-events-none",
  "disabled:opacity-50",

  "data-[state=checked]:bg-primary",
  "data-[state=unchecked]:bg-input",
].join(" ");

const switchThumbClassName = [
  "pointer-events-none",
  "block h-4 w-4",
  "rounded-full",

  "bg-background",
  "shadow",

  "transition-transform",

  "data-[state=checked]:translate-x-4",
  "data-[state=unchecked]:translate-x-0",
].join(" ");

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(switchRootClassName, className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className={switchThumbClassName} />
  </SwitchPrimitive.Root>
));

Switch.displayName = "Switch";
