import type { NextConfig } from 'next';

/* Fully static: `next build` writes out/ and any static host serves it.
   No server features, so no GitHub calls ever happen in the browser and no
   token can reach client code — the feed is generated before the build. */
const nextConfig: NextConfig = {
  output: 'export',
  // the same prefix asset() uses, so /_next/* and <Link> resolve under the Pages path
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  // no trailingSlash: the export writes work/<slug>.html and links match it exactly
  images: { unoptimized: true },
  reactStrictMode: true
};

export default nextConfig;
