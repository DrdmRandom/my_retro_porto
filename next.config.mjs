/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "strapi.cihuy-familly.my.id"
      }
    ]
  }
};

export default nextConfig;
