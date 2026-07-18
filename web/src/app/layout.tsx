import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "设计案例学习库",
  description: "个人设计案例学习库，收集全球优秀设计师作品集",
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
