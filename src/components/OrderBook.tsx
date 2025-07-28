import { useRef, useState, type FC } from "react";

type PriceLevel = { price: number; size: number };
interface OrderBookProps {
  asks: PriceLevel[];
  bids: PriceLevel[];
}

const OrderBook: FC<OrderBookProps> = ({
  asks = Array(10).fill({ price: 1234.5, size: 0.09 }),
  bids = Array(10).fill({ price: 1234.1, size: 0.12 }),
}) => {
  const [maxAskSize] = useState<number>(
    Math.max(...asks.map((ask) => ask.size)),
  );
  const [maxBidSize] = useState<number>(
    Math.max(...bids.map((bid) => bid.size)),
  );
  const stylesRef = useRef<CSSStyleDeclaration>(
    getComputedStyle(document.documentElement),
  );

  return (
    <div className="w-full h-full p-4 text-xs">
      <h2 className="mb-2 font-semibold text-lg">Order Book</h2>
      <div className="w-full flex flex-row">
        <div className="w-full h-full flex flex-col">
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-500">SIZE</span>
            <span className="mr-1 text-sm font-bold text-gray-500">
              BID PRICE
            </span>
          </div>
          <div className="w-full">
            {bids.map((bid, idx) => (
              <div
                key={`bid-${idx}`}
                className={`w-full h-[20px] relative flex flex-row-reverse text-[${stylesRef.current.getPropertyValue("--green")}]`}
              >
                <div className="w-full h-full z-999 absolute top-0 left-0 flex justify-between p-1">
                  <span>{bid.size}</span>
                  <span>{bid.price.toFixed(2)}</span>
                </div>
                <div
                  className="h-full flex bg-green-500/20"
                  style={{
                    width: `${Math.round(100 * (bid.size / maxBidSize))}%`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-full flex flex-col">
          <div className="flex justify-between">
            <span className="ml-1 text-sm font-bold text-gray-500">
              ASK PRICE
            </span>
            <span className="text-sm font-bold text-gray-500">SIZE</span>
          </div>
          <div className="w-full">
            {asks.map((ask, idx) => (
              <div
                key={`ask-${idx}`}
                className="w-full h-[20px] relative flex"
                style={{ color: stylesRef.current.getPropertyValue("--red") }}
              >
                <div className="w-full h-full absolute top-0 left-0 flex justify-between p-1">
                  <span>{ask.price.toFixed(2)}</span>
                  <span>{ask.size}</span>
                </div>
                <div
                  className="h-full flex"
                  style={{
                    backgroundColor: "#c3201f",
                    opacity: 0.1,
                    width: `${Math.round(100 * (ask.size / maxAskSize))}%`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
