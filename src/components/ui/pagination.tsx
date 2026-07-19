import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps
  extends React.ComponentProps<"nav"> {}

export interface PaginationContentProps
  extends React.ComponentProps<"ul"> {}

export interface PaginationItemProps
  extends React.ComponentProps<"li"> {}

export interface PaginationLinkProps
  extends React.ComponentProps<"a">,
    Pick<ButtonProps, "size"> {
  isActive?: boolean;
}

export interface PaginationEllipsisProps
  extends React.ComponentProps<"span"> {}

const paginationClassName =
  "mx-auto flex w-full justify-center";

const paginationContentClassName =
  "flex items-center gap-1";

const paginationPreviousClassName =
  "gap-1 pl-2.5";

const paginationNextClassName =
  "gap-1 pr-2.5";

const paginationEllipsisClassName =
  "flex size-9 items-center justify-center";

export function Pagination({
  className,
  ...props
}: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(paginationClassName, className)}
      {...props}
    />
  );
}

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  PaginationContentProps
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(paginationContentClassName, className)}
    {...props}
  />
));

PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  PaginationItemProps
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={className}
    {...props}
  />
));

PaginationItem.displayName = "PaginationItem";

export function PaginationLink({
  className,
  isActive = false,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

PaginationLink.displayName = "PaginationLink";

export function PaginationPrevious({
  className,
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Previous page"
      size="default"
      className={cn(paginationPreviousClassName, className)}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>Previous</span>
    </PaginationLink>
  );
}

PaginationPrevious.displayName = "PaginationPrevious";

export function PaginationNext({
  className,
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Next page"
      size="default"
      className={cn(paginationNextClassName, className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="size-4" />
    </PaginationLink>
  );
}

PaginationNext.displayName = "PaginationNext";

export function PaginationEllipsis({
  className,
  ...props
}: PaginationEllipsisProps) {
  return (
    <span
      aria-hidden
      className={cn(paginationEllipsisClassName, className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

PaginationEllipsis.displayName = "PaginationEllipsis";
