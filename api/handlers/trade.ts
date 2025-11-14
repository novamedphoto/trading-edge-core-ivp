import { log } from "../utils/logger.js";

export default async function handler(req: Request) {
  log("trade handler hit");

  // Solo aceptamos POST por ahora
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

  // Respuesta básica para comprobar que el endpoint vive
  return new Response(
    JSON.stringify({
      ok: true,
      message: "trade endpoint activo (v1 básica)",
      time: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
