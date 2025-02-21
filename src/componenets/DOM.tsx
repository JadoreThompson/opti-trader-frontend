import { FC, useEffect, useRef } from "react";
import UtilsManager from "../utils/classses/UtilsManager";

// {price: quantity}
// Ordered
export interface Orderbook {
  bids: Record<number, number>;
  asks: Record<number, number>;
}

const DOM: FC<{
  price: number;
  orderbook: Orderbook;
}> = ({ price, orderbook }) => {
  const maxAskVolumeRef = useRef<number | undefined>(undefined);
  const maxBidVolumeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    maxAskVolumeRef.current = Math.max(
      ...Object.keys(orderbook.asks).map(
        (key) => Number(key) * orderbook.asks[Number(key)]
      )
    );

    maxBidVolumeRef.current = Math.max(
      ...Object.keys(orderbook.bids).map(
        (key) => Number(key) * orderbook.bids[Number(key)]
      )
    );
  }, [orderbook]);

  return (
    <div className="h-full w-full flex-col justify-start overflow-hidden border-bg-secondary border-radius-primary p-sm">
      <div className="w-full flex justify-between">
        <span className="text-grey">Price</span>
        <span className="text-grey">Quantity</span>
        <span className="text-grey">Total</span>
      </div>

      <ul>
        {Object.keys(orderbook.asks).map((key, ind) => (
          <li key={ind} style={{ height: "40%" }} className="grid w-full">
            <div
              className="grid-col-1 grid-row-1 h-full w-full"
              style={{
                direction: "rtl",
                zIndex: 1,
              }}
            >
              <span
                className="h-full flex border-radius-primary dom-volume"
                style={{
                  backgroundColor: "#2e1211",
                  width: `${
                    ((orderbook.asks[Number(key)] * Number(key)) /
                      maxAskVolumeRef.current!) *
                    100
                  }%`,
                  height: "100%",
                }}
              ></span>
            </div>
            <div
              className="grid-col-1 grid-row-1 h-full w-full flex justify-between align-center"
              style={{ zIndex: 2 }}
            >
              <span>{key}</span>
              <span>{orderbook.asks[Number(key)]}</span>
              <span>{orderbook.asks[Number(key)] * Number(key)}</span>
            </div>
          </li>
        ))}
      </ul>
      <span className="span-xl bold">{UtilsManager.formatPrice(price)}</span>
      <ul>
        {Object.keys(orderbook.bids).map((key, ind) => (
          <li key={ind} style={{ height: "40%" }} className="grid w-full">
            <div
              className="grid-col-1 grid-row-1 h-full w-full"
              style={{
                direction: "rtl",
                zIndex: 1,
              }}
            >
              <span
                className="h-full flex border-radius-primary dom-volume"
                style={{
                  backgroundColor: "#142e28",
                  width: `${
                    ((orderbook.bids[Number(key)] * Number(key)) /
                      maxBidVolumeRef.current!) *
                    100
                  }%`,
                  height: "100%",
                }}
              ></span>
            </div>
            <div
              className="grid-col-1 grid-row-1 h-full w-full flex justify-between align-center"
              style={{ zIndex: 2 }}
            >
              <span>{key}</span>
              <span>{orderbook.bids[Number(key)]}</span>
              <span>{orderbook.bids[Number(key)] * Number(key)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DOM;
