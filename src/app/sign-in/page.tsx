import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f4] p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#dce6df] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/brand/rova-icon.png" alt="Rova" width={40} height={40} />
          <Image src="/brand/rova-wordmark.png" alt="Rova" width={100} height={32} className="h-8 w-auto object-contain" />
        </div>
        <h1 className="mt-8 text-2xl font-bold">Sign in to Rova</h1>
        <p className="mt-2 text-sm leading-6 text-[#66766f]">Authentication wiring is intentionally left as a clear foundation point. Connect this form to Supabase Auth when you create your project.</p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Email<input type="email" className="mt-2 w-full rounded-xl border border-[#dce6df] px-3 py-3 outline-none focus:border-[#7faeaa]" placeholder="you@example.com" /></label>
          <label className="block text-sm font-medium">Password<input type="password" className="mt-2 w-full rounded-xl border border-[#dce6df] px-3 py-3 outline-none focus:border-[#7faeaa]" placeholder="••••••••" /></label>
          <button type="button" className="w-full rounded-xl bg-[#1f5a4d] px-4 py-3 font-semibold text-white">Continue</button>
        </form>
        <Link href="/" className="mt-5 block text-center text-sm text-[#5d9278]">Back to Rova</Link>
      </div>
    </main>
  );
}
