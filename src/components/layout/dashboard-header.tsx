// src/components/layout/dashboard-header.tsx
import Link from "next/link";
import { Search } from "lucide-react";
import type { Profile } from "@/types";

function greetingFor(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Manila" }).format(date)
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({
  profile,
  subtitle,
  searchPlaceholder,
}: {
  profile: Profile;
  subtitle: string;
  searchPlaceholder: string;
}) {
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila",
  }).format(today);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-[#dce6df] bg-white px-5 py-5 md:px-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#20312c]">
          {greetingFor(today)}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#66766f]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative hidden sm:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a988f]" aria-hidden="true" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="h-10 w-64 rounded-lg border border-[#dce6df] bg-[#f9fbf6] pl-9 pr-3 text-sm text-[#20312c] placeholder:text-[#8a988f] focus-visible:outline-none focus-visible:border-[#1f5a4d] focus-visible:ring-2 focus-visible:ring-[#7faeaa]/40"
          />
        </label>
        <span className="hidden rounded-lg border border-[#dce6df] px-3 py-2 text-sm font-medium text-[#20312c] md:inline-block">
          {dateLabel}
        </span>
        <Link
          href="/profile"
          aria-label="Account settings"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#dce6df] bg-[#eaf0e4] text-sm font-semibold text-[#3f6b52] focus-visible:outline-2 focus-visible:outline-[#1f5a4d]"
        >
          {firstName.slice(0, 1).toUpperCase()}
        </Link>
      </div>
    </header>
  );
}