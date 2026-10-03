/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  experimental: {
    serverActions: { bodySizeLimit: '4mb' }
  },
  outputFileTracingIncludes: {
    '/api/demo/pdf': [
      './node_modules/pdfkit/js/standard-fonts/**/*'
    ],
    '/api/report/[id]/pdf': [
      './node_modules/pdfkit/js/standard-fonts/**/*'
    ]
  }
};

export default nextConfig;
