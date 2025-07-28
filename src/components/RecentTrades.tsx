import type { FC } from "react";

const RecentTrades: FC = () => {
  const trades = Array(10).fill({ price: 1234.2, size: 0.01, side: "buy" });

  return (
    <div className="p-4 text-xs w-[200px]">
      <h3 className="mb-2 font-semibold">Recent Trades</h3>
      <div className="space-y-1">
        {trades.map((t, idx) => (
          <div key={idx} className="flex justify-between">
            <span
              className={t.side === "buy" ? "text-green-500" : "text-red-500"}
            >
              {t.price.toFixed(2)}
            </span>
            <span>{t.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTrades;
