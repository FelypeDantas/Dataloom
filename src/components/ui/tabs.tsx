import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {}

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {}

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

const tabsListClassName = [
  "inline-flex h-9 items-center justify-center gap-1",
  "rounded-lg",
  "bg-muted",
  "p-1",
  "text-muted-foreground",
].join(" ");

const tabsTriggerClassName = [
  "inline-flex items-center justify-center",
  "whitespace-nowrap",
  "rounded-md",
  "px-3 py-1",
  "text-sm font-medium",
  "cursor-pointer",
  "transition-all",

  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",

  "disabled:pointer-events-none",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",

  "data-[state=active]:bg-background",
  "data-[state=active]:text-foreground",
  "data-[state=active]:shadow-sm",
].join(" ");

const tabsContentClassName = [
  "mt-2",

  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",
].join(" ");

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListClassName, className)}
    {...props}
  />
));

TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerClassName, className)}
    {...props}
  />
));

TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentClassName, className)}
    {...props}
  />
));

TabsContent.displayName = "TabsContent";
