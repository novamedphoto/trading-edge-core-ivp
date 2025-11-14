import { log } from "../utils/logger.js";

export default async function handler(req: Request) {
  log("trade handler hit");

  // 1) Solo aceptamos POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Method not allowed. Use POST.",
      }),
      {
        status: 405,
        headers: { "content-type": "application/json" },
      }
    );
  }

  // 2) Leer el body del request
  let payload: any = {};
  try {
    payload = await req.json();
  } catch (e) {
    payload = {};
  }

  // 3) Validar header con WEBHOOK_SECRET
  const secret = req.headers.get("x-webhook-secret");
  const expected = process.env.WEBHOOK_SECRET;

  if (!expected) {
    log("WARNING: WEBHOOK_SECRET no está definido en variables de entorno");
  }

  if (expected && secret !== expected) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Invalid webhook secret",
      }),
      {
        status: 401,
        headers: { "content-type": "application/json" },
      }
    );
  }

  // 4) Normalizar la señal del trade desde el payload
  const symbol =
    payload.symbol ||
    payload.ticker ||
    payload.asset ||
    null;

  const rawSide =
    (payload.side || payload.action || payload.direction || "").toString().toUpperCase();

  const side =
    rawSide === "SELL" || rawSide === "SHORT"
      ? "SELL"
      : rawSide === "BUY" || rawSide === "LONG"
      ? "BUY"
      : null;

  const entryPrice = Number(
    payload.entry ??
      payload.entryPrice ??
      payload.price ??
      payload.close ??
      NaN
  );

  const stopPrice = Number(
    payload.stop ??
      payload.stopPrice ??
      NaN
  );

  const takeProfit = payload.takeProfit
    ? Number(payload.takeProfit)
    : undefined;

  // 5) Validaciones mínimas
  const errors: string[] = [];

  if (!symbol) errors.push("symbol/ticker requerido");
  if (!side) errors.push("side (BUY/SELL) requerido");
  if (!Number.isFinite(entryPrice)) errors.push("entryPrice inválido");
  if (!Number.isFinite(stopPrice)) errors.push("stopPrice inválido");

  if (errors.length > 0) {
    log("trade validation errors: " + errors.join("; "));

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Payload inválido",
        details: errors,
        received: payload,
      }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const normalizedTrade = {
    symbol,
    side,
    entryPrice,
    stopPrice,
    takeProfit,
    rawPayload: payload,
  };

  log("normalized trade", normalizedTrade);

  // 6) Por ahora solo devolvemos la señal normalizada
  return new Response(
    JSON.stringify({
      ok: true,
      message: "webhook validado y trade normalizado",
      trade: normalizedTrade,
      time: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
