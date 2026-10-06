import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No longer need to bundle SQLite dev.db since we're using Prisma Postgres (PostgreSQL)
};

export default nextConfig;
