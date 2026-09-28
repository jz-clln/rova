// src/components/ui/textarea.tsx
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-[#dce6df] bg-white px-3 py-2 text-sm text-[#20312c] shadow-sm transition-colors",
        "placeholder:text-[#66766f]",
        "focus-visible:outline-none focus-visible:border-[#1f5a4d] focus-visible:ring-2 focus-visible:ring-[#7faeaa]/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };