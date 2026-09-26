// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#dce6df] bg-white px-3 py-2 text-sm text-[#20312c] shadow-sm transition-colors",
          "placeholder:text-[#66766f]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#20312c]",
          "focus-visible:outline-none focus-visible:border-[#1f5a4d] focus-visible:ring-2 focus-visible:ring-[#7faeaa]/40",
          "aria-invalid:border-red-300 aria-invalid:ring-2 aria-invalid:ring-red-100",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };