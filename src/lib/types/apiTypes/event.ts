import type { EventType } from "./eventType"

export interface Event {
    event_type: EventType
    user_id: string
    order_id: string
    data: { [key: string]: any }
}
