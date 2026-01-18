/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactCompiler: true,

  // Khuyến nghị cho production
  poweredByHeader: false,
  compress: true,

  // Nếu có gọi API backend khác domain
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://10.110.20.107:3001/api/:path*',
  //     },
  //   ]
  // },
}

export default nextConfig
