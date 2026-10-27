"use client";

import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    document.title = "About Daniel";
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12">
      <h1>About me</h1>
    </main>
  );
}
