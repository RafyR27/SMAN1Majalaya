"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "cn";

export interface CheckboxProps
  extends Omit<CheckboxPrimitive.Root.Props, "checked" | "onCheckedChange"> {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  indeterminate: indeterminateProp,
  ...props
}: CheckboxProps) {
  const isIndeterminate =
    checked === "indeterminate" || Boolean(indeterminateProp);
  const isChecked = checked === true;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={isChecked}
      indeterminate={isIndeterminate}
      onCheckedChange={(nextChecked) => {
        onCheckedChange?.(nextChecked);
      }}
      className={cn(
        "peer inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-input bg-background outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:border-input dark:bg-input/30 dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {isIndeterminate ? (
          <Minus className="size-3 stroke-[3]" />
        ) : (
          <Check className="size-3 stroke-[3]" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
