export enum MarketType {
    SPOT = 'spot',
    FUTURES = 'futures',
}

export enum OrderType {
    MARKET_ORDER = 'market_order',
    LIMIT_ORDER = 'limit_order',
    CLOSE_ORDER = 'close_order',
}

export enum Side {
    LONG = 'long',
    SHORT = 'short'
}

export const OrderStatus  = {
    FILLED: 'filled',
    PARTIALLY_FILLED: 'partially_filled',
    PARTIALLY_CLOSED_ACTIVE: 'partially_closed_active',
    PARTIALLY_CLOSED_INACTIVE: 'partially_closed_inactive',
    CLOSED: 'closed',
    EXPIRED: 'expired',

    getDisplayValue(status: string): string {
        switch(status) {
            case OrderStatus.FILLED:
                return 'Filled';
            case OrderStatus.PARTIALLY_FILLED:
                return 'Partially Filled';
            case OrderStatus.PARTIALLY_CLOSED_ACTIVE:
                return 'Partially Closed'
            case OrderStatus.CLOSED:
                return 'Closed'
            case OrderStatus.EXPIRED:
                return 'Expired'
            default:
                return 'Unkown'
        }
    },
}

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
