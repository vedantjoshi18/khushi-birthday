/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
      },
      {
        protocol: "https",
        hostname: "pub-4ac1b7f0da8c43e8983d7821a18a8c0d.r2.dev",
      },
    ],
  },
};

export default nextConfig;
