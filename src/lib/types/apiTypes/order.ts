import type { OrderStatus } from '../orderStatus'
import type { OrderType } from '../orderType'

export interface Order {
    order_id: string
    closed_at: string | null
    instrument: string
    side: string
    market_type: string
    order_type: OrderType
    price: number | null
    limit_price: number | null
    filled_price: number | null
    closed_price: number | null
    realised_pnl: number
    unrealised_pnl: number | null
    status: OrderStatus
    quantity: number
    standing_quantity: number
    open_quantity: number
    stop_loss: number | null
    take_profit: number | null
    created_at: string
}
