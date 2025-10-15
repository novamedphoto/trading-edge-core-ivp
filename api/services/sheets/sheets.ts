import { log } from "../../utils/logger.js";
export async function appendRow(row: Record<string, any>) {
  log("SHEETS append", row);
  return { ok: true };
}
