/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1kfpvgfupbmyo.cloudfront.net",
        pathname: "/images/**"
      }
    ]
  }
};

export default nextConfig;
