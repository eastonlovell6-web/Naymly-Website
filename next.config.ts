import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  // An unrelated package-lock.json in an ancestor directory otherwise makes
  // Next infer the wrong workspace root.
  outputFileTracingRoot: path.resolve(__dirname),
}

export default nextConfig
