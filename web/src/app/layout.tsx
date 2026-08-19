import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Refcases",
  description: "A curated library of designer portfolios with visual and interaction analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
