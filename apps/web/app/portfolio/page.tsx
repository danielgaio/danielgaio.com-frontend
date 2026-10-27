"use client";

import { useEffect } from "react";

export default function Portfolio() {
  useEffect(() => {
    document.title = "Daniel's Portfolio";
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12">
      <h1>My portfolio gallery</h1>
    </main>
  );
}
