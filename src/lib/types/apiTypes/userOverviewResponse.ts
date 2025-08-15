import type { PaginationMeta } from './paginatedResponse'

export interface UserOverviewResponse extends PaginationMeta {
    cash_balance: number
    data: { [k: number]: number }
}
