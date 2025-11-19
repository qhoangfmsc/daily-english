import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import clsx from "clsx";

import { Providers } from "./providers";

import { Sidebar } from "@/components/sidebar";
import { PageTransition } from "@/components/PageTransition";

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
    <html className="light" lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>
          <div className="flex flex-row h-screen bg-gradient-to-br from-blue-50 to-violet-100">
            <Sidebar />
            <main className="w-full p-8 overflow-y-auto bg-gradient-to-tl from-gray-100 to-white rounded-l-4xl border-l border-divider shadow-xl">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
