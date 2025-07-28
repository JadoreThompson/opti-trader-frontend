import type { RecentTrade } from "@/lib/types/recentTrade";
import { Side } from "@/lib/types/side";
import type { FC } from "react";

const RecentTrades: FC<{ trades: RecentTrade[] }> = ({
  trades = Array(10).fill({
    price: 1234.2,
    size: 0.01,
    side: Side.BID,
    time: "19:50",
  }),
}) => {
  return (
    <div className="p-4 text-xs w-full">
      <h3 className="mb-2 font-semibold">Recent Trades</h3>
      <div className="space-y-1">
        {trades.map((t, idx) => (
          <div key={idx} className="flex justify-between">
            <span
              className={
                t.side === Side.BID ? "text-green-500" : "text-red-500"
              }
            >
              {t.price.toFixed(2)}
            </span>
            <span>{t.size}</span>
            <span className="text-gray-500">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTrades;
