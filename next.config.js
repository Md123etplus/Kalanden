/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // Directory for service worker and manifest files
  register: true,  // Enable service worker registration
  skipWaiting: true, // Take control immediately
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cloud.appwrite.io'],
  },
};

module.exports = withPWA(nextConfig);
