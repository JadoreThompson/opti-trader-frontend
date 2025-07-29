import { type Static, Type } from '@sinclair/typebox'
import { OrderType } from '../orderType'
import { Side } from '../side'

export type CloseRequestQuantity = number | 'ALL'

export const BaseOrder = Type.Object(
    {
        quantity: Type.Integer({ minimum: 1 }),
        instrument: Type.String(),
        order_type: Type.Enum(OrderType),
        side: Type.Enum(Side),
    },
    { additionalProperties: true }
)

export type BaseOrderType = Static<typeof BaseOrder>

export const BaseSpotOCOOrder = Type.Intersect(
    [
        BaseOrder,
        Type.Object({
            take_profit: Type.Optional(Type.Number({ minimum: 0 })),
            stop_loss: Type.Optional(Type.Number({ minimum: 0 })),
        }),
    ],
    { additionalProperties: false }
)

export type BaseSpotOCOOrderType = Static<typeof BaseSpotOCOOrder>

export const SpotMarketOrder = Type.Object({}, { additionalProperties: false })
export const SpotMarketOrderFull = Type.Intersect([BaseOrder, SpotMarketOrder])
export type SpotMarketOrderType = Static<typeof SpotMarketOrderFull>

export const SpotMarketOCOOrder = Type.Intersect([
    SpotMarketOrderFull,
    BaseSpotOCOOrder,
])
export type SpotMarketOCOOrderType = Static<typeof SpotMarketOCOOrder>

export const SpotLimitOrder = Type.Intersect(
    [
        BaseOrder,
        Type.Object({
            limit_price: Type.Number({ minimum: 0 }),
        }),
    ],
    { additionalProperties: false }
)

export type SpotLimitOrderType = Static<typeof SpotLimitOrder>

export const SpotLimitOCOOrder = Type.Intersect([
    SpotLimitOrder,
    Type.Object({
        take_profit: Type.Optional(Type.Number({ minimum: 0 })),
        stop_loss: Type.Optional(Type.Number({ minimum: 0 })),
    }),
])

export type SpotLimitOCOOrderType = Static<typeof SpotLimitOCOOrder>

export const BaseFuturesOrder = Type.Intersect(
    [
        BaseOrder,
        Type.Object({
            take_profit: Type.Optional(Type.Number({ minimum: 0 })),
            stop_loss: Type.Optional(Type.Number({ minimum: 0 })),
        }),
    ],
    { additionalProperties: false }
)

export type BaseFuturesOrderType = Static<typeof BaseFuturesOrder>

export const FuturesMarketOrder = BaseFuturesOrder
export type FuturesMarketOrderType = Static<typeof FuturesMarketOrder>

export const FuturesLimitOrder = Type.Intersect([
    BaseFuturesOrder,
    Type.Object({
        limit_price: Type.Number({ minimum: 0 }),
    }),
])

export type FuturesLimitOrderType = Static<typeof FuturesLimitOrder>

export const ModifyOrder = Type.Object(
    {
        limit_price: Type.Optional(Type.Number()),
        take_profit: Type.Optional(Type.Number()),
        stop_loss: Type.Optional(Type.Number()),
    },
    { additionalProperties: false }
)

export type ModifyOrderType = Static<typeof ModifyOrder>

export const CancelOrder = Type.Object(
    {
        quantity: Type.Union([Type.Number(), Type.Literal('ALL')]),
    },
    { additionalProperties: false }
)

export type CancelOrderType = Static<typeof CancelOrder>

export const CloseOrder = CancelOrder
export type CloseOrderType = Static<typeof CloseOrder>
