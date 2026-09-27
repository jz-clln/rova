// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Raleway } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
const raleway = Raleway({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-raleway", display: "swap" });

const title = "Rova - Shared agricultural freight";
const description =
  "Rova brings buyer demand, farm supply, and shared transport together for coordinated agricultural deliveries.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Rova",
  icons: {
    icon: { url: "/brand/rova-icon.png", type: "image/png" },
    apple: { url: "/brand/rova-icon.png", type: "image/png" },
  },
  openGraph: {
    title,
    description,
    siteName: "Rova",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${raleway.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
