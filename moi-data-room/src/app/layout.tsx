import type { Metadata } from "next";
import { DM_Sans, Instrument_Sans } from "next/font/google";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOI Investor Data Room",
  description: "MOI Protocol investor data room — contextual compute network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${instrumentSans.variable} font-sans antialiased bg-bg text-text`}
      >
        {children}
      </body>
    </html>
  );
}
