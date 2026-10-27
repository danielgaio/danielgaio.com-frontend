"use client";

import { useEffect } from "react";

export default function Blog() {
  useEffect(() => {
    document.title = "Daniel's Blog";
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12">
      <h1>My blog</h1>
    </main>
  );
}
