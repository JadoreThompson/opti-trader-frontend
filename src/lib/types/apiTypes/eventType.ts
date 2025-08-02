export enum WsEventType {
    ORDER_NEW = 'order_new',
    ORDER_PARTIALLY_CANCELLED = 'order_partially_cancelled',
    ORDER_CANCELLED = 'order_cancelled',
    ORDER_MODIFIED = 'order_modified',
    ORDER_PARTIALLY_FILLED = 'order_partially_filled',
    ORDER_FILLED = 'order_filled',
    ORDER_PARTIALLY_CLOSED = 'order_partially_closed',
    ORDER_CLOSED = 'order_closed',
    ORDER_REJECTED = 'order_rejected',
    ORDER_NEW_REJECTED = 'order_new_rejected',
    ORDER_CANCEL_REJECTED = 'order_cancel_rejected',
    ORDER_MODIFY_REJECTED = 'order_modify_rejected',
    PAYLOAD_UPDATE = 'payload_update',

    // This isn't emmited by the API but is used
    // internally, we're using it just for UX purposes
}
