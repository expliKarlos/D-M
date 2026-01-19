import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Auth Profiles
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase Storage
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com', // Google Drive
      },
      // Supabase project specific domain
      {
        protocol: 'https',
        hostname: 'slgdlqhwupvymmalyoff.supabase.co',
      },
    ],
  },
};

export default nextConfig;
