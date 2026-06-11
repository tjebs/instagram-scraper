import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite er en innebygd Node-modul og skal ikke bundles av webpack/turbopack.
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
