/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  generateBuildId: async () => {
    // Return a constant build ID to prevent mismatches between
    // multiple instances or during rolling updates if not using shared storage
    // ideally this should come from a git commit hash or env var
    return process.env.BUILD_ID || 'production-build-id';
  },
  output: 'standalone',
};

export default nextConfig;
