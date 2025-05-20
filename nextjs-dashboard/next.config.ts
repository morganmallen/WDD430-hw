import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Output logs during build to help debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Optimize for serverless deployment
  output: "standalone",
};

// Log environment variables during build (will show in Vercel build logs)
console.log("Building with config:", {
  nextauthSecretExists: !!process.env.NEXTAUTH_SECRET,
  authSecretExists: !!process.env.AUTH_SECRET,
  nextauthUrlExists: !!process.env.NEXTAUTH_URL,
});

export default nextConfig;
