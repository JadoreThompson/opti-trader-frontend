import { WsEventType } from '@/lib/types/apiTypes/eventType'
import type { EventType } from '@/lib/types/eventType'
import { formatUnderscore } from '@/lib/utils'
import type { FC } from 'react'

export type Log = { event_type: WsEventType | EventType; message: string }

const EventLog: FC<{
    data: Log[]
}> = ({ data }) => {
    const getColor = (eventType: WsEventType | EventType) => {
        switch (eventType) {
            case WsEventType.ORDER_CANCELLED:
                return 'red'
            case WsEventType.ORDER_CLOSED:
                return 'green'
            case WsEventType.ORDER_MODIFIED:
                return 'blue'
            case WsEventType.ORDER_NEW:
                return 'green'
            case WsEventType.ORDER_CANCEL_REJECTED:
                return 'yellow'
            case WsEventType.ORDER_FILLED:
                return 'green'
            case WsEventType.ORDER_MODIFY_REJECTED:
                return 'red'
            case WsEventType.ORDER_NEW_REJECTED:
                return 'red'
            case WsEventType.ORDER_PARTIALLY_CANCELLED:
                return 'blue'
            case WsEventType.ORDER_PARTIALLY_CLOSED:
                return 'green'
            case WsEventType.ORDER_PARTIALLY_FILLED:
                return 'green'
            case WsEventType.ORDER_REJECTED:
                return 'red'
            default:
                return 'gray'
        }
    }

    return (
        <div className="w-full min-h-120 max-h-120 flex flex-col gap-3 overflow-y-scroll p-3">
            <h3 className="font-bold mb-2">Activity Log</h3>
            {data.map((val, i) => (
                <div
                    key={i}
                    className="w-full h-10 flex items-center border-l-2 pl-2"
                    style={{ borderLeftColor: getColor(val.event_type) }}
                >
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">
                            {formatUnderscore(val.event_type)}
                        </span>
                        <span className="text-xs text-neutral-500 whitespace-nowrap">
                            {val.message}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default EventLog
