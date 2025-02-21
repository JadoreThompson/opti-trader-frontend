import { Static, Type } from "@sinclair/typebox";

export const OrderRequest = Type.Object({
  amount: Type.Number(),
  order_type: Type.Union([Type.Literal("market"), Type.Literal("limit")]),
  limit_price: Type.Optional(Type.Number()),
  take_profit: Type.Optional(Type.Number()),
  stop_loss: Type.Optional(Type.Number()),
  side: Type.Union([Type.Literal("long"), Type.Literal("short")]),
});

export type OrderRequest = Static<typeof OrderRequest>;
