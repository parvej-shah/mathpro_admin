/** @type {import('next').NextConfig} */
const storagePublicUrlBase = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL_BASE;
let storagePublicHostname = null;

if (storagePublicUrlBase) {
  try {
    storagePublicHostname = new URL(storagePublicUrlBase).hostname;
  } catch {
    storagePublicHostname = null;
  }
}

const nextConfig = {
  reactStrictMode: true,

  // 2025: Enable typed routes for type-safe navigation
  typescript: {
    // Enable typed routes (Next.js 16 feature)
  },

  // Image optimization
  images: {
    // Allow images from storage/CDN hosts
    remotePatterns: [
      ...(storagePublicHostname
        ? [
            {
              protocol: "https",
              hostname: storagePublicHostname,
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.de",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mathpromedia.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
      // Math Pro image CDN
      {
        protocol: "https",
        hostname: "image.mathpro.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/**",
      },
      // Google Drive images (for PDF previews and teacher images)
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  pageExtensions: ["ts", "tsx", "js", "jsx"],
};

export default nextConfig;
