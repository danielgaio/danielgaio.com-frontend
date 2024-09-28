"use client";

import { useEffect } from "react";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact Daniel";
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12">
      <h1>Contact me</h1>
    </main>
  );
}
