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

  // 4) Respuesta básica confirmando recepción de payload
  return new Response(
    JSON.stringify({
      ok: true,
      message: "webhook validado correctamente",
      received: payload,
      time: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
