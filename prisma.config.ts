// This file is configured for Spec-Driven Development using pnpm.
// Run 'pnpm add -D prisma dotenv' to manage dependencies.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
