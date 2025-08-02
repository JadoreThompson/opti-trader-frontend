import type { WsEventType } from './eventType'

export interface Event {
    event_type: WsEventType
    user_id: string
    order_id: string
    balance: number | null
    data: { [key: string]: any }
}
