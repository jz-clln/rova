import Image from "next/image";
import Link from "next/link";
import { navigation } from "@/config/navigation";

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-[#dce6df] bg-white p-4 lg:block">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 py-2">
        <Image src="/brand/rova-icon.png" alt="Rova" width={38} height={38} />
        <Image src="/brand/rova-wordmark.png" alt="Rova" width={92} height={30} className="h-7 w-auto object-contain" />
      </Link>
      <nav className="space-y-1">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#50655e] transition hover:bg-[#edf4f0] hover:text-[#1f5a4d]">
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
