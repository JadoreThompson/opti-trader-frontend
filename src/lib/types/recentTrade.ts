import type { Side } from "./side";

export interface RecentTrade {
  price: number;
  quantity: number;
  side: Side;
  time: string;
}
