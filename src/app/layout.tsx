import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FC THE FIRST",
  description: "FC THE FIRST TEAM MANAGER",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
