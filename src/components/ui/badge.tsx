// src/components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-[#eaf0e4] text-[#4c6644]",
        success: "bg-[#e7f1e9] text-[#3f7350]",
        warning: "bg-[#fbf1e2] text-[#8a6420]",
        danger: "bg-red-50 text-red-700",
        info: "bg-[#e9f0ef] text-[#3d6b66]",
        outline: "border border-[#dce6df] text-[#66766f]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };