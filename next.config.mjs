/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev indicators are now controlled by devIndicators: false
  devIndicators: false,  // Completely disable the build indicator (bottom-left logo)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Use webpack build worker for faster compilation
    webpackBuildWorker: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore modules that are not needed in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    };
    
    // Ignore warnings for these modules
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
    ];

    return config;
  },
}

export default nextConfig
