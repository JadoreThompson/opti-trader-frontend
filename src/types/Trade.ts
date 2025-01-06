export enum OrderType {
    MARKET_ORDER = 'market_order',
    LIMIT_ORDER = 'limit_order',
    CLOSE_ORDER = 'close_order',
}

export enum MarketType {
    SPOT = 'spot',
    FUTURES = 'futures',
}

export enum SocketMessageCategory {
    SUCCESS = 'success',
    ORDER_UPDATE = 'order_update',
    PRICE = 'price',
    ERROR = 'error',
    DOM = 'dom',
}

export enum IntervalEnum {
    M1 = '1m',
    M15 = '15m',
    H4 = '4h'
}

export class IntervalType {
    private static intervals = {
        [IntervalEnum.M1]: 60,
        [IntervalEnum.M15]: 900,
        [IntervalEnum.H4]: 14400
    } as const;

    public static toSeconds(interval: IntervalEnum): number {
        const seconds = IntervalType.intervals[interval];
        
        if (!seconds) {
            throw new Error(`Invalid Interval ${interval}`);
        }

        return seconds;
    }
}