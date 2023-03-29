/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      "ec2-3-142-252-150.us-east-2.compute.amazonaws.com"
    ]

  },
}

module.exports = nextConfig
