import { FC, useState } from "react";
import { MarketType, OrderType, Side } from "../types/CommonTypes";

const OrderCreationForm: FC<{ ticker: string; websocket: WebSocket }> = ({
  ticker,
  websocket,
}) => {
  const [currentOrderType, setCurrentOrderType] = useState<OrderType>(
    OrderType.MARKET_ORDER
  );
  const [currentMarketType, setMarketType] = useState<null | MarketType>(null);

  const formSubmitHandler: (e: React.FormEvent<HTMLFormElement>) => void = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    if (!websocket) {
      return;
    }

    e.preventDefault();

    const form = e.target as HTMLFormElement;

    let payload: Record<string, null | string | number> = {
      market_type: currentMarketType,
      type: currentOrderType,
      ticker: ticker,
    };

    payload = {
      ...payload,
      ...Object.fromEntries(new FormData(form).entries()),
    };

    for (const field of [
      "quantity",
      "stop_loss",
      "take_profit",
      "limit_price",
    ]) {
      if (field in payload) {
        payload[field] = Number(payload[field]);
        if (payload[field] === 0) {
          payload[field] = null;
        }
      }
    }

    if (currentMarketType === MarketType.FUTURES) {
      payload["side"] = (
        (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
      ).value;
    }

    websocket.send(JSON.stringify(payload));
    form.reset();
  };

  return (
    <>
      <div className="card container w-100">
        <div className="tab-bar mb-2">
          <button
            className={`btn w-100 ${
              currentOrderType === OrderType.MARKET_ORDER ? "active" : ""
            }`}
            onClick={() => {
              setCurrentOrderType(OrderType.MARKET_ORDER);
            }}
          >
            <span className="secondary">Market</span>
          </button>
          <button
            className={`btn w-100 ${
              currentOrderType === OrderType.LIMIT_ORDER ? "active" : ""
            }`}
            onClick={() => {
              setCurrentOrderType(OrderType.LIMIT_ORDER);
            }}
          >
            <span className="secondary">Limit</span>
          </button>
        </div>
        <form
          action=""
          className="everything-center d-col"
          onSubmit={formSubmitHandler}
        >
          <div className="w-100">
            <label htmlFor="quantity">Quantity</label>
            <input
              className="w-100"
              type="number"
              id="quantity"
              name="quantity"
              min={1}
              step={1}
            />
          </div>
          <div className="w-100 d-row justify-sb gap-1">
            <div className="w-100 border-box">
              <label htmlFor="takeProfit">Take Profit</label>
              <input
                type="number"
                className="w-100 border-box"
                name="take_profit"
                id="takeProfit"
              />
            </div>
            <div className="w-100">
              <label htmlFor="stopLoss">Stop Loss</label>
              <input
                type="number"
                className="w-100 border-box"
                name="stop_loss"
                id="stopLoss"
              />
            </div>
          </div>
          {currentOrderType === OrderType.LIMIT_ORDER ? (
            <div className="w-100">
              <label htmlFor="limitPrice" style={{ marginBottom: "1rem" }}>
                Limit Price
              </label>
              <input
                className="w-100"
                type="number"
                name="limit_price"
                id="limitPrice"
                required={
                  currentOrderType === OrderType.LIMIT_ORDER ? true : false
                }
              />
            </div>
          ) : null}
          <div className="w-100 d-row dual-button">
            {Object.values(MarketType).map((value, index) => (
              <input
                type="button"
                key={index}
                className={`btn w-100 ${
                  currentMarketType == value ? "" : "text-secondary"
                }`}
                value={value.toUpperCase()}
                onMouseUp={(e) => {
                  setMarketType(value);
                }}
              />
            ))}
          </div>
          {currentMarketType === MarketType.FUTURES ? (
            <div className="w-100 d-row dual-button">
              {Object.values(Side).map((value, index) => (
                <button
                  key={index}
                  className={`btn w-100 ${
                    value === Side.LONG ? "positive" : "negative"
                  }`}
                  type="submit"
                  name="side"
                  value={value}
                >
                  {value.valueOf().charAt(0).toUpperCase() +
                    value.valueOf().slice(1)}
                </button>
              ))}
            </div>
          ) : currentMarketType === MarketType.SPOT ? (
            <div className="w-100">
              <button className="btn w-100" type="submit">
                Create
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </>
  );
};

export default OrderCreationForm;
