"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import * as React from "react";
import DrawerAppBar from "./nav";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta name="description" content="Daniel Gaio's personal website" />
        <title>Daniel Gaio</title>
      </Head>

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
