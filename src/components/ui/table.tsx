import * as React from "react";

import { cn } from "@/lib/utils";

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {}

export interface TableSectionProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {}

const tableClassName =
  "w-full caption-bottom text-sm";

const tableHeaderClassName =
  "[&_tr]:border-b";

const tableBodyClassName =
  "[&_tr:last-child]:border-0";

const tableFooterClassName =
  "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0";

const tableRowClassName =
  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted";

const tableHeadClassName =
  "h-10 px-2 text-left align-middle font-medium text-muted-foreground " +
  "[&:has([role=checkbox])]:pr-0 " +
  "[&>[role=checkbox]]:translate-y-[2px]";

const tableCellClassName =
  "p-2 align-middle " +
  "[&:has([role=checkbox])]:pr-0 " +
  "[&>[role=checkbox]]:translate-y-[2px]";

const tableCaptionClassName =
  "mt-4 text-sm text-muted-foreground";

export const Table = React.forwardRef<
  HTMLTableElement,
  TableProps
>(({ className, ...props }, ref) => (
  <div
    className="relative w-full overflow-x-auto"
    role="region"
    aria-label="Tabela"
  >
    <table
      ref={ref}
      className={cn(tableClassName, className)}
      {...props}
    />
  </div>
));

Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(tableHeaderClassName, className)}
    {...props}
  />
));

TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(tableBodyClassName, className)}
    {...props}
  />
));

TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(tableFooterClassName, className)}
    {...props}
  />
));

TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  TableRowProps
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(tableRowClassName, className)}
    {...props}
  />
));

TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  TableHeadProps
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(tableHeadClassName, className)}
    {...props}
  />
));

TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  TableCellProps
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(tableCellClassName, className)}
    {...props}
  />
));

TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(tableCaptionClassName, className)}
    {...props}
  />
));

TableCaption.displayName = "TableCaption";
