"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import * as React from "react";
import DrawerAppBar from "./nav";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GoogleAnalytics />
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          {/* Fixed position header */}
          <header className="fixed top-0 w-full z-50">
            <DrawerAppBar />
          </header>

          {/* Main content with padding to avoid overlap */}
          <main className="flex-grow pt-[64px]">{children}</main>

          <footer className="mt-auto p-4 text-center">
            <p>&copy; {new Date().getFullYear()} Daniel Gaio</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
