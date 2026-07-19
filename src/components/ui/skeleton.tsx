import * as React from "react";

import { cn } from "@/lib/utils";

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const skeletonClassName = [
  "animate-pulse",
  "rounded-md",
  "bg-primary/10",
].join(" ");

export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonClassName, className)}
      {...props}
    />
  );
}
