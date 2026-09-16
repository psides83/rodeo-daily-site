/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/rodeo-results",
        destination: "/results",
        permanent: true
      },
      {
        source: "/pro-rodeo-results",
        destination: "/results",
        permanent: true
      },
      {
        source: "/pro-rodeo-results/barrel-racing",
        destination: "/wpra-results/barrel-racing",
        permanent: true
      },
      {
        source: "/pro-rodeo-results/breakaway-roping",
        destination: "/wpra-results/breakaway-roping",
        permanent: true
      },
      {
        source: "/pro-rodeo-results/:event",
        destination: "/prca-results/:event",
        permanent: true
      },
      {
        source: "/prca-results/barrel-racing",
        destination: "/wpra-results/barrel-racing",
        permanent: true
      },
      {
        source: "/prca-results/breakaway-roping",
        destination: "/wpra-results/breakaway-roping",
        permanent: true
      },
      {
        source: "/rodeo-standings",
        destination: "/standings",
        permanent: true
      },
      {
        source: "/pro-rodeo-standings",
        destination: "/standings",
        permanent: true
      },
      {
        source: "/prca-standings/:year/barrel-racing",
        destination: "/wpra-standings/:year/barrel-racing",
        permanent: true
      },
      {
        source: "/prca-standings/:year/breakaway-roping",
        destination: "/wpra-standings/:year/breakaway-roping",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.*\\.vercel\\.app)" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  },
  images: {
    unoptimized: true,
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
