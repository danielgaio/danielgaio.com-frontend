/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn2.thecatapi.com", "images.dog.ceo"], // Add the external domain here
  },
};

export default nextConfig;
