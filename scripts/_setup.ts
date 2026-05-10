/**
 * Shared bootstrap for all CLI scripts:
 *   - load .env.local
 *   - install global error handlers
 *   - re-export logging helpers
 */
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "src/lib/logger.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotenv({ path: path.resolve(__dirname, "../.env.local") });
loadDotenv(); // also load CI env

process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err);
  process.exit(1);
});

export function step(label: string) {
  const t = new Date().toISOString().slice(11, 19);
  logger.info(`[${t}] ▸ ${label}`);
}

export function ok(label: string) {
  const t = new Date().toISOString().slice(11, 19);
  logger.info(`[${t}] ✓ ${label}`);
}

export function warn(label: string, err?: unknown) {
  const t = new Date().toISOString().slice(11, 19);
  logger.warn(`[${t}] ⚠ ${label}`, err ?? "");
}
