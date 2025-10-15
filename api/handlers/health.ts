import { log } from "../utils/logger.js";
export default async function handler(req: Request) {
  log("health ping");
  return new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}
