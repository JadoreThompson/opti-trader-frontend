import { Static, Type } from "@sinclair/typebox";
import { MarketType, OrderType, Side } from "./types";

export const OrderRequest = Type.Object({
  amount: Type.Number(),
  instrument: Type.String(),
  order_type: Type.Union(
    Object.values(OrderType).map((ot) => Type.Literal(ot))
  ),
  market_type: Type.Union(
    Object.values(MarketType).map((mt) => Type.Literal(mt))
  ),
  limit_price: Type.Optional(Type.Number()),
  take_profit: Type.Optional(Type.Number()),
  stop_loss: Type.Optional(Type.Number()),
  side: Type.Union(Object.values(Side).map((s) => Type.Literal(s))),
});

export type OrderRequest = Static<typeof OrderRequest>;

export const ModifyOrderRequest = Type.Object({
  order_id: Type.String(),
  limit_price: Type.Optional(Type.Number()),
  take_profit: Type.Optional(Type.Number()),
  stop_loss: Type.Optional(Type.Number()),
});

export type ModifyOrderRequest = Static<typeof ModifyOrderRequest>;
