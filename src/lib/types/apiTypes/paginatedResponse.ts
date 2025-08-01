export interface PaginationMeta {
    page: number;
    has_next: boolean;
    size: number
}

export interface PaginatedResponse<T> {
    data: T[]
}