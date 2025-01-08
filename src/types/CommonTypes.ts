export enum MarketType {
    SPOT = 'spot',
    FUTURES = 'futures',
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