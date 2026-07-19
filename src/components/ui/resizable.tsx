import * as React from "react";
import { GripVertical } from "lucide-react";
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import { cn } from "@/lib/utils";

export interface ResizablePanelGroupProps
  extends React.ComponentProps<typeof Group> {}

export interface ResizableHandleProps
  extends React.ComponentProps<typeof Separator> {
  withHandle?: boolean;
}

const panelGroupClassName =
  "flex h-full w-full data-[panel-group-direction=vertical]:flex-col";

const handleClassName = [
  "relative flex items-center justify-center",
  "w-px bg-border",

  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",

  "after:absolute",
  "after:inset-y-0",
  "after:left-1/2",
  "after:w-1",
  "after:-translate-x-1/2",

  "data-[panel-group-direction=vertical]:h-px",
  "data-[panel-group-direction=vertical]:w-full",

  "data-[panel-group-direction=vertical]:after:left-0",
  "data-[panel-group-direction=vertical]:after:h-1",
  "data-[panel-group-direction=vertical]:after:w-full",
  "data-[panel-group-direction=vertical]:after:-translate-y-1/2",
  "data-[panel-group-direction=vertical]:after:translate-x-0",

  "[&[data-panel-group-direction=vertical]>div]:rotate-90",
].join(" ");

const handleGripClassName = [
  "z-10",
  "flex h-4 w-3 items-center justify-center",
  "rounded-sm",
  "border",
  "bg-background",
  "shadow-sm",
].join(" ");

export function ResizablePanelGroup({
  className,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <Group
      className={cn(panelGroupClassName, className)}
      {...props}
    />
  );
}

export const ResizablePanel = Panel;

export function ResizableHandle({
  withHandle = false,
  className,
  ...props
}: ResizableHandleProps) {
  return (
    <Separator
      className={cn(handleClassName, className)}
      {...props}
    >
      {withHandle && (
        <div className={handleGripClassName}>
          <GripVertical className="size-2.5" />
        </div>
      )}
    </Separator>
  );
}
