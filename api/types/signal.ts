import { z } from "zod";
export const SignalSchema = z.object({
  secret: z.string(),
  symbol: z.string().min(1),
  side: z.enum(["buy", "sell", "close"]),
  price: z.coerce.number().positive(),
  time: z.union([z.string(), z.number()]).optional(),
  strategy: z.string().default("default"),
  risk_tag: z.string().optional(),
  notes: z.string().optional()
});
export type Signal = z.infer<typeof SignalSchema>;
