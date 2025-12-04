import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 301 Redirects for SEO - Preserve old WordPress URLs
  async redirects() {
    return [
      // State pages - /state/alabama/ → /translators/alabama
      {
        source: "/state/:state/",
        destination: "/translators/:state",
        permanent: true, // 301
      },
      // State with language and type
      {
        source: "/state/:state/:language/translators",
        destination: "/translators/:state?language=:language&type=translation",
        permanent: true,
      },
      {
        source: "/state/:state/:language/interpreters",
        destination: "/translators/:state?language=:language&type=interpretation",
        permanent: true,
      },
      // Legacy query string format
      {
        source: "/state/:state/",
        destination: "/translators/:state",
        permanent: true,
      },
    ];
  },

  // Headers for SEO
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
