/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // Temporarily ignore build errors while we resolve recharts type issues
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
