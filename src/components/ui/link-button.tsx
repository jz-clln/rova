// src/components/ui/link-button.tsx
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const styles = {
  primary: "bg-[#1f5a4d] text-white hover:bg-[#174739]",
  secondary: "border border-[#cad9ce] bg-white text-[#1f5a4d] hover:bg-[#e7eee5]",
} as const;

// A link that looks like a Button, for navigation that shouldn't be a <button>.
function LinkButton({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof styles }) {
  return (
    <Link
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5a4d]",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

export { LinkButton };