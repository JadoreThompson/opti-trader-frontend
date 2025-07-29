import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Order } from './types/api-types/order'
import { OrderStatus } from './types/orderStatus'
import { OrderType } from './types/orderType'
import { Side } from './types/side'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Returns a titled version of the passed string.
 * @param value
 * @returns {string}
 */
export function formatUnderscore(value: string): string {
    const parts = value.toLowerCase().split('_')
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

export const mockOrders: Order[] = Array.from({ length: 20 }, (_, i) => {
    const isClosed = i % 4 === 0
    const price = 100 + i
    const quantity = 1 + (i % 5)
    const realised_pnl = isClosed ? +(Math.random() * 50 - 25).toFixed(2) : null
    const unrealised_pnl = !isClosed
        ? +(Math.random() * 50 - 25).toFixed(2)
        : null

    return {
        order_id: `order_${i + 1}`,
        instrument: `SYM${(i % 5) + 1}`,
        side: i % 2 === 0 ? Side.BID : Side.ASK,
        market_type: 'futures',
        order_type: i % 3 === 0 ? OrderType.MARKET : OrderType.LIMIT,
        price,
        limit_price:
            i % 3 === 0 ? null : +(price + Math.random() * 10).toFixed(2),
        filled_price: +(price + Math.random() * 2 - 1).toFixed(2),
        closed_price: isClosed
            ? +(price + Math.random() * 5 - 2.5).toFixed(2)
            : null,
        realised_pnl,
        unrealised_pnl,
        status: isClosed
            ? OrderStatus.CLOSED
            : i % 3 === 0
              ? OrderStatus.FILLED
              : OrderStatus.PARTIALLY_FILLED,
        quantity,
        standing_quantity: 0,
        open_quantity: isClosed ? 0 : quantity - 1,
        stop_loss: Math.random() > 0.5 ? +(price - 5).toFixed(2) : null,
        take_profit: Math.random() > 0.5 ? +(price + 5).toFixed(2) : null,
        created_at: new Date(Date.now() - i * 3600_000).toISOString(),
        closed_at: isClosed
            ? new Date(Date.now() - (i - 1) * 3600_000).toISOString()
            : null,
    }
})
