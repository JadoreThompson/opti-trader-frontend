import { FC, useEffect, useState } from "react";
import { useBodyStyles } from "./BodyStyles";

const DOM: FC<{
  asks: Record<number, number>;
  bids: Record<number, number>;
  ticker: string;
  currentPrice: Number;
  lastPrice: Number;
}> = ({ asks, bids, ticker, currentPrice, lastPrice }) => {
  const bodyStyles = useBodyStyles();
  const [increase, setIncrease] = useState<number>(0);
  // 0, 1, 2
  const [maxNum, setMaxNum] = useState<number>(0);

  useEffect(() => {
    currentPrice > lastPrice
      ? setIncrease(2)
      : currentPrice < lastPrice
      ? setIncrease(1)
      : setIncrease(0);
  }, [lastPrice, currentPrice]);

  useEffect(() => {
    let nums: number[] = [];
    Object.values(bids).forEach((item) => nums.push(item));

    const maxAsk = Math.max(...Object.values(asks));
    const maxBid = Math.max(...Object.values(bids));
    setMaxNum(maxAsk > maxBid ? maxAsk : maxBid);
  }, [asks, bids]);

  return (
    <div
      className="card w-100"
      style={{
        width: "100%",
        display: `${
          Object.keys(asks).length > 0 || Object.keys(bids).length > 0
            ? "flex"
            : "none"
        }`,
      }}
    >
      <div className="w-100 d-col">
        <ul className="w-100 d-flex justify-sb">
          <li className="secondary small w-100">Price (USDT)</li>
          <li className="secondary small w-100 right">Quantity ({ticker})</li>
          <li className="secondary small w-100 right">Total</li>
        </ul>

        {Object.entries(asks)
          .reverse()
          .map(([price, quantity], index) => (
            <>
              <div key={index} className="w-100" style={{ display: "grid" }}>
                <ul
                  className="w-100 d-flex justify-sb"
                  style={{ gridColumn: 1, gridRow: 1 }}
                >
                  <li className="w-100 small negative">{price}</li>
                  <li className="w-100 small right ">{quantity}</li>
                  <li className="w-100 small right ">{quantity * price}</li>
                </ul>
                <div
                  className="border-radius-1 dom-element"
                  style={{
                    gridColumn: 1,
                    gridRow: 1,
                    height: "100%",
                    width: `${(quantity * price) / maxNum}%`,
                    backgroundColor: bodyStyles.getPropertyValue("--red-soft"),
                  }}
                ></div>
              </div>
            </>
          ))}
        <div className="d-flex justify-sb">
          <div className="d-flex align-center">
            <h2
              className={
                currentPrice > lastPrice
                  ? "positive"
                  : currentPrice < lastPrice
                  ? "negative"
                  : ""
              }
            >
              {String(currentPrice)}
            </h2>
            {increase === 2 ? (
              <svg
                className="icon"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  className="positive"
                  d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2v12zM7 10V8h2v2H7zm0 0v2H5v-2h2zm10 0V8h-2v2h2zm0 0v2h2v-2h-2z"
                  fill="currentColor"
                />{" "}
              </svg>
            ) : increase === 1 ? (
              <svg
                className="icon"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  className="negative"
                  d="M11 4h2v12h2v2h-2v2h-2v-2H9v-2h2V4zM7 14v2h2v-2H7zm0 0v-2H5v2h2zm10 0v2h-2v-2h2zm0 0v-2h2v2h-2z"
                  fill="currentColor"
                />{" "}
              </svg>
            ) : null}
          </div>
          <div>
            <span>{String(currentPrice)}</span>
          </div>
        </div>
        {Object.entries(bids)
          .reverse()
          .map(([price, quantity], index) => (
            <>
              <div key={index} className="w-100" style={{ display: "grid" }}>
                <ul
                  className="w-100 d-flex justify-sb"
                  style={{ gridColumn: 1, gridRow: 1 }}
                >
                  <li className="w-100 small positive">{price}</li>
                  <li className="w-100 small right ">{quantity}</li>
                  <li className="w-100 small right ">{quantity * price}</li>
                </ul>
                <div
                  className="border-radius-1 dom-element"
                  style={{
                    gridColumn: 1,
                    gridRow: 1,
                    height: "100%",
                    width: `${(quantity * price) / maxNum}%`,
                    backgroundColor:
                      bodyStyles.getPropertyValue("--green-soft"),
                  }}
                ></div>
              </div>
            </>
          ))}
      </div>
    </div>
  );
};

export default DOM;
