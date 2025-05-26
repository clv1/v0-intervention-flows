/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // Set to true for a 308 Permanent Redirect
      },
      {
        source: '/player-behaviour/:id(\\d+)',
        destination: '/player-behaviour/:id/Recovery%20Profile',
        permanent: false, // Using temporary redirect (307) for dynamic routes
      },
      {
        source: '/player-behaviour',
        destination: '/player-behaviour/1/Recovery%20Profile',
        permanent: false, // Using temporary redirect (307)
      },
    ];
  },
};

export default nextConfig;
