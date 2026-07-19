import * as React from "react";
import { Toaster as Sonner } from "sonner";

export interface ToasterProps
  extends React.ComponentProps<typeof Sonner> {}

const defaultToastOptions: NonNullable<ToasterProps["toastOptions"]> = {
  classNames: {
    toast:
      "group toast border-border bg-background text-foreground shadow-lg",

    description:
      "text-muted-foreground",

    actionButton:
      "bg-primary text-primary-foreground",

    cancelButton:
      "bg-muted text-muted-foreground",
  },
};

export function Toaster({
  toastOptions,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      richColors
      closeButton
      toastOptions={{
        ...defaultToastOptions,
        ...toastOptions,

        classNames: {
          ...defaultToastOptions.classNames,
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}
