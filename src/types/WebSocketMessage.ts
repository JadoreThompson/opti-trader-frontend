export enum WebSocketMessageCategory {
  CONNECTION = 'connection',
  PRICE = "price",
  DOM = "dom",
  SUCCESS = "success",
  ORDER_UPDATE = 'order_update',
  ERROR = 'error',
  NOTIFICATION = 'notification'
}

export enum WebSocketConnectionStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

export enum UpdateScope {
  NEW = "new",
  EXISTING = "existing",
}

export interface Message {
  category: WebSocketMessageCategory;
  message: string;
  details: Record<string, string | Number | Record<number, number>> | null;
  status: WebSocketConnectionStatus | null;
  on: UpdateScope | null;
}
