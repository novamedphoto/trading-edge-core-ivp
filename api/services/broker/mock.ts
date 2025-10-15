import { log } from "../../utils/logger.js";
export async function placeOrder({ symbol, side, qty, type, limit, stop }:
  { symbol: string, side: "buy"|"sell", qty: number, type?: string, limit?: number, stop?: number }) {
  const orderId = Math.floor(Math.random() * 1e9).toString();
  log("MOCK placeOrder", { symbol, side, qty, type, limit, stop, orderId });
  return { orderId, status: "accepted" };
}
export async function getAccount() {
  return { buyingPower: 100000, currency: "USD" };
}
