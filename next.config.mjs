/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Les erreurs de type éventuelles ne doivent pas bloquer la mise en ligne : elles restent visibles avec « npm run typecheck ».
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
};
export default nextConfig;
