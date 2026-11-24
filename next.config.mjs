// Photos uploaded to or copied into the CMS are resized by Next.js per screen size.
const cms = new URL(process.env.CMS_PUBLIC_URL ?? process.env.CMS_API_URL ?? "http://localhost:4000");
const cmsIsLocal = ["localhost", "127.0.0.1"].includes(cms.hostname);
// Live, the CMS keeps its images in Supabase Storage (IMAGES_URL = its public bucket address); allow that host too.
const store = process.env.IMAGES_URL ? new URL(process.env.IMAGES_URL) : null;

const nextConfig = {
  // A test build can go to another folder (NEXT_DIST_DIR=.next-check) while the live site keeps running from .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // About 6,000 car, tab and variant pages are prerendered; give slow machines more than the default 60 s per page.
  staticPageGenerationTimeout: 180,
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 160, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: cms.protocol.replace(":", ""), hostname: cms.hostname, port: cms.port, pathname: "/uploads/**" },
      ...(store ? [{ protocol: store.protocol.replace(":", ""), hostname: store.hostname, pathname: "/storage/v1/object/public/**" }] : []),
    ],
    // Only for local development, where the CMS runs on this machine. A live CMS has a public address.
    dangerouslyAllowLocalIP: cmsIsLocal,
  },
  async redirects() {
    return [
      // Offers were removed (no offer data from the source): old addresses go to the closest page.
      { source: "/car-offers", destination: "/new-cars", statusCode: 301 },
      { source: "/cars/:brand/:model/offers", destination: "/cars/:brand/:model", statusCode: 301 },
      // Dealer and station finders were removed: old addresses go to the closest page.
      { source: "/car-dealers/:path*", destination: "/new-cars", statusCode: 301 },
      { source: "/ev-charging-stations/:path*", destination: "/electric-cars", statusCode: 301 },
      { source: "/fuel-stations/:path*", destination: "/fuel-prices", statusCode: 301 },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
