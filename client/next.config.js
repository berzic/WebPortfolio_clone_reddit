/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      "ec2-13-59-176-174.us-east-2.compute.amazonaws.com"
    ]

  },
}

module.exports = nextConfig
