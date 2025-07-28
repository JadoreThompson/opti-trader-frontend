import type { Side } from "./side";

export interface RecentTrade {
  price: number;
  size: number;
  side: Side;
  time: string;
}
