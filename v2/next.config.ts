import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // v2 lives inside the v1 repo; pin the root so Turbopack doesn't pick up v1's lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
