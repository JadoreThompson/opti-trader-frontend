import type { Order } from '../types/api-types/order'

export interface TableProps {
    onScrollEnd: () => void
}

export interface OrderTableProps extends TableProps {
    orders: Order[]
}
