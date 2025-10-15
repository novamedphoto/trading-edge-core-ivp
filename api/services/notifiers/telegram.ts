import { log } from "../../utils/logger.js";
import { request } from "undici";
export async function notifyTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    log("TELEGRAM not configured. Skipping:", message);
    return { skipped: true };
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = { chat_id: chatId, text: message, parse_mode: "HTML" };
  try {
    const res = await request(url, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
    log("TELEGRAM sent", await res.body.text());
    return { ok: true };
  } catch (e) {
    log("TELEGRAM error", (e as Error).message);
    return { ok: false, error: (e as Error).message };
  }
}
