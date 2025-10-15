import { SignalSchema } from "../types/signal.js";
import { verifySecret } from "../utils/signature.js";
import { log } from "../utils/logger.js";
import { positionSize } from "../services/risk.js";
import { brokerFactory } from "../services/broker/index.js";
import { appendRow } from "../services/sheets/sheets.js";
import { notifyTelegram } from "../services/notifiers/telegram.js";
export const config = { runtime: "edge" };
export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  let json: any;
  try { json = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }
  const parsed = SignalSchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten() }), { status: 400 });
  }
  const signal = parsed.data;
  const ok = verifySecret(signal.secret, process.env.WEBHOOK_SECRET);
  if (!ok) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const env = process.env.ENV || "staging";
  const capital = Number(process.env.DEMO_CAPITAL_USD || 5000);
  const riskPct = Number(process.env.RISK_PCT_PER_TRADE || 1);
  const brokerKind = process.env.BROKER || "mock";
  const entry = Number(signal.price);
  const stop = entry * 0.99; // 1% por defecto
  const { qty, riskUsd, stopDistance } = positionSize({ entry, stop, capitalUsd: capital, riskPct });
  const broker = brokerFactory(brokerKind);
  const side = signal.side === "close" ? "sell" : signal.side;
  const order = await broker.placeOrder({ symbol: signal.symbol, side: side as "buy"|"sell", qty, type: "market" });
  const row = {
    timestamp: new Date().toISOString(), env, symbol: signal.symbol, side: signal.side,
    entry_price: entry, stop_price: stop, take_profit: null, qty, risk_usd: riskUsd,
    stop_distance: stopDistance, status: "sent", order_id: order.orderId, broker: brokerKind,
    notes: signal.notes || ""
  };
  await appendRow(row);
  await notifyTelegram(`📡 <b>SIGNAL</b> ${signal.symbol} ${signal.side} @ ${entry}
qty=${qty} risk=${riskUsd.toFixed(2)} stopΔ=${stopDistance.toFixed(4)}
env=${env} broker=${brokerKind}`);
  log("signal handled", row);
  return new Response(JSON.stringify({ ok: true, row }), { status: 200, headers: { "content-type": "application/json" } });
}
