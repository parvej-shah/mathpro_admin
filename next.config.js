import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 2025: Enable typed routes for type-safe navigation
  typescript: {
    // Enable typed routes (Next.js 16 feature)
  },

  // FORCE WEBPACK - Required for AWS SDK compatibility
  // We MUST use webpack (not Turbopack) because:
  // - AWS SDK v2 requires Node.js polyfills (Buffer, fs, net, tls)
  // - Custom webpack plugins and configurations
  // The --webpack flag in package.json scripts explicitly forces webpack usage
  experimental: {
    webpackBuildWorker: true, // Enable webpack build worker for faster builds
  },

  // Webpack configuration for AWS SDK compatibility
  // Required for: Buffer polyfill, Node.js module fallbacks (fs, net, tls)
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle buffer polyfill
    config.resolve.alias = {
      ...config.resolve.alias,
      buffer: "buffer",
    };

    // Provide Buffer globally using Next.js's webpack instance
    // This ensures we use the same webpack version that Next.js uses internally
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      })
    );

    // Fix webpack cache serialization for ProvidedDependency
    // Configure cache to handle serialization issues gracefully
    if (config.cache && typeof config.cache === "object") {
      // Ensure cache is properly configured
      config.cache = {
        ...config.cache,
        // Use filesystem cache but allow non-serializable items to be skipped
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // Suppress harmless ProvidedDependency serialization warnings
    // These occur because ProvidePlugin creates dependencies that can't be cached
    // but this doesn't affect functionality - webpack just skips caching those items
    config.infrastructureLogging = {
      level: "error", // Only show errors, suppress cache serialization warnings
    };

    return config;
  },

  // Image optimization
  images: {
    // Allow images from S3 bucket
    remotePatterns: [
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
