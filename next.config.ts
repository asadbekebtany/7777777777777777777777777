import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev resources (/_next, HMR) are blocked for any host other than the
  // server hostname. The preview opens this app on 127.0.0.1 and on the
  // cloud agent host, so without this list the HTML renders but React
  // never hydrates: charts stay blank and clicks do nothing.
  allowedDevOrigins: ["127.0.0.1", "*.agent.cvm.dev"],
};

export default nextConfig;
