import { Static, Type } from "@sinclair/typebox";

export const OrderRequest = Type.Object({
  amount: Type.Number(),
  instrument: Type.String(),
  order_type: Type.Union([Type.Literal("market"), Type.Literal("limit")]),
  market_type: Type.Union([Type.Literal('futures'), Type.Literal('spot')]),
  limit_price: Type.Optional(Type.Number()),
  take_profit: Type.Optional(Type.Number()),
  stop_loss: Type.Optional(Type.Number()),
  side: Type.Union([Type.Literal("buy"), Type.Literal("sell")]),
});

export type OrderRequest = Static<typeof OrderRequest>;
