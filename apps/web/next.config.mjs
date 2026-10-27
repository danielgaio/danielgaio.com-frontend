import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  },
  images: {
    domains: ["cdn2.thecatapi.com", "images.dog.ceo"],
  },
};

export default nextConfig;
