// src/components/ui/native-select.tsx
import { cn } from "@/lib/utils";

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "flex h-10 w-full rounded-lg border border-[#dce6df] bg-white px-3 text-sm text-[#20312c] shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:border-[#1f5a4d] focus-visible:ring-2 focus-visible:ring-[#7faeaa]/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { NativeSelect };