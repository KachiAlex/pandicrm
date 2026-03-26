/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pandi/core-domain", "@pandi/data-access", "@pandi/crm-domain", "@pandi/crm-data-access"],
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
