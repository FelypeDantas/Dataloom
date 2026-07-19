import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.ComponentPropsWithoutRef<"textarea"> {}

const textareaClassName = [
  "flex w-full min-h-[80px]",
  "rounded-md border border-input",
  "bg-transparent",
  "px-3 py-2",
  "text-sm",
  "shadow-sm",

  "placeholder:text-muted-foreground",

  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",

  "disabled:cursor-not-allowed",
  "disabled:opacity-50",

  "resize-y",
].join(" ");

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(textareaClassName, className)}
    {...props}
  />
));

Textarea.displayName = "Textarea";
