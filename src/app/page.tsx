import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f8f4] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/rova-icon.png" alt="Rova icon" width={42} height={42} />
            <Image src="/brand/rova-wordmark.png" alt="Rova" width={110} height={36} className="h-8 w-auto object-contain" />
          </div>
          <Link href="/sign-in" className="rounded-xl bg-[#1f5a4d] px-4 py-2.5 text-sm font-semibold text-white">Sign in</Link>
        </nav>

        <section className="grid gap-12 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#5d9278]">Agricultural freight coordination</p>
            <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.04em] text-[#20312c] md:text-6xl">Turn fragmented farm supply into one coordinated delivery.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#66766f]">Buyer demand in. Compatible farm supply matched. One shared route built. One buyer receives the consolidated load.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-xl bg-[#1f5a4d] px-5 py-3 font-semibold text-white">Open foundation</Link>
              <a href="#flow" className="rounded-xl border border-[#dce6df] bg-white px-5 py-3 font-semibold text-[#1f5a4d]">View MVP flow</a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#dce6df] bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-[#edf4f0] p-5">
              <p className="text-sm font-semibold text-[#1f5a4d]">Friday requirement</p>
              <p className="mt-2 text-3xl font-bold">1,000 kg cabbage</p>
              <p className="mt-1 text-sm text-[#66766f]">Deliver before 5:00 AM</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              {[["Farm A", "300 kg"], ["Farm B", "250 kg"], ["Farm C", "450 kg"]].map(([farm, qty]) => (
                <div key={farm} className="rounded-xl border border-[#dce6df] p-4"><p className="font-semibold">{farm}</p><p className="mt-1 text-[#66766f]">{qty}</p></div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-[#1f5a4d] p-4 text-white"><p className="text-sm opacity-80">Matched load</p><p className="mt-1 text-xl font-bold">1,000 / 1,000 kg</p></div>
          </div>
        </section>

        <section id="flow" className="grid gap-4 pb-16 md:grid-cols-4">
          {["Buyer creates requirement", "Farmers confirm supply", "Rova builds shared route", "Buyer confirms receipt"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-[#dce6df] bg-white p-5"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f2c66d] text-sm font-bold text-[#20312c]">{index + 1}</span><p className="mt-4 font-semibold">{item}</p></div>
          ))}
        </section>
      </div>
    </main>
  );
}
