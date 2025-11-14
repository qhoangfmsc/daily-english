import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import clsx from "clsx";

import { Providers } from "./providers";
import { Sidebar } from "@/components/sidebar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Daily English",
    template: `%s - Daily English`,
  },
  description: "Nền tảng học tiếng Anh hàng ngày hiệu quả và thú vị",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto bg-gradient-to-b from-gray-50 to-100">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
