import type { EventType } from './eventType'

export interface Event {
    event_type: EventType
    available_balance: number
    data: { [key: string]: any }
}
