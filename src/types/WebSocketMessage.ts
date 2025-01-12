export enum MessageCategory {
  PRICE = "price",
  DOM = "dom",
  SUCCESS = "success",
}

export enum UpdateScope {
  NEW = "new",
  EXISTING = "existing",
}

export interface Message {
  category: MessageCategory;
  message: string;
  on: UpdateScope;
  details: null | Record<string, string | Number | Record<number, number>>;
}
