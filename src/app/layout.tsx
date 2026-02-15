import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "KODEX200 HTS",
  description: "KODEX 200 ETF 및 구성 종목 실시간 모니터링 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-slate-950 text-slate-50"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
