/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the app deploys cleanly to Firebase Hosting and scales to
  // many concurrent learners. All Firebase access is client-side.
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
