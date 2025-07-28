import type { FC } from "react";

const OrderBook: FC = () => {
  const bids = Array(10).fill({ price: 1234.1, size: 0.12 });
  const asks = Array(10).fill({ price: 1234.5, size: 0.09 });

  return (
    <div className="p-4 text-xs border-r border-gray-800 w-[240px]">
      <h3 className="mb-2 font-semibold">Order Book</h3>
      <div>
        {asks.map((ask, idx) => (
          <div key={`ask-${idx}`} className="flex justify-between text-red-500">
            <span>{ask.price.toFixed(2)}</span>
            <span>{ask.size}</span>
          </div>
        ))}
        <div className="my-1 h-[1px] bg-gray-600" />
        {bids.map((bid, idx) => (
          <div
            key={`bid-${idx}`}
            className="flex justify-between text-green-500"
          >
            <span>{bid.price.toFixed(2)}</span>
            <span>{bid.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
