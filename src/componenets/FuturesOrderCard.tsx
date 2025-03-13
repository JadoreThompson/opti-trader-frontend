import { FC, useState } from "react";
import { MarketType, OrderType, Side } from "../utils/types";

const FuturesOrderCard: FC<{
  marketType: MarketType;
  submitHandler: (arg: React.FormEvent<HTMLFormElement>) => Promise<void>;
  selectedOrderType?: OrderType;
  setSelectedOrderType: (arg?: OrderType) => void;
  changeMarketType: (arg: MarketType) => void;
}> = ({
  marketType,
  submitHandler,
  selectedOrderType,
  setSelectedOrderType,
  changeMarketType,
}) => {
  const [showTPSL, setShowTPSL] = useState<boolean>(false);

  return (
    <div className="h-full w-full order-card">
      <form className="h-full w-full flex-column g-2" onSubmit={submitHandler}>
        <div
          className="w-full flex justify-start align-center border-radius-primary snackbar p-xs"
          style={{ height: "2.5rem" }}
        >
          {Object.values(MarketType).map((val, ind) => (
            <button
              key={ind}
              className={`btn border-none bg-background-secondary hover-pointer h-full w-full ${
                marketType === val ? "active" : ""
              }`}
              onClick={() => changeMarketType(val)}
            >
              {val}
            </button>
          ))}
        </div>

        <div className="w-full flex justify-start align-center border-radius-primary border-bg-secondary p-xs">
          <input
            type="number"
            placeholder="Quantity"
            name="quantity"
            className="bold span-md w-full"
            min={1}
            step={1}
            required
          />
        </div>
        <div className="w-full h-full flex align-center border-bg-secondary border-radius-primary snackbar order-type overflow-hidden">
          {Object.values(OrderType).map((val, ind) => (
            <button
              key={ind}
              className={`btn ${
                val === selectedOrderType ? "active" : ""
              } text-grey hover-pointer w-full h-full`}
              type="button"
              name="order_type"
              value={val}
              onClick={() => setSelectedOrderType(val)}
            >
              {val.toUpperCase()}
            </button>
          ))}
        </div>
        {selectedOrderType === OrderType.LIMIT && (
          <div
            className="w-full h-full align-center"
            style={{ height: "3rem" }}
          >
            <span className="span-md">LIMIT PRICE</span>
            <input
              type="number"
              name="limit_price"
              className="border-bg-secondary border-radius-primary h-auto w-full p-xs"
              required
            />
          </div>
        )}
        <div className="w-full flex g-1 align-center p-xs">
          <input
            type="checkbox"
            onChange={() => setShowTPSL((prev) => !prev)}
          />
          <span>TP/SL</span>
        </div>
        {showTPSL && (
          <div className="w-full h-full flex-center g-1">
            <div
              className="w-full h-full align-center"
              style={{ height: "3.5rem" }}
            >
              <label htmlFor="">TAKE PROFIT</label>
              <br />
              <input
                type="number"
                name="take_profit"
                className="border-bg-secondary border-radius-primary h-auto w-full p-xs"
              />
            </div>
            <div
              className="w-full h-full align-center"
              style={{ height: "3.5rem" }}
            >
              <label htmlFor="">STOP LOSS</label>
              <br />
              <input
                type="number"
                name="stop_loss"
                className="border-bg-secondary border-radius-primary h-auto w-full p-xs"
              />
            </div>
          </div>
        )}

        <div className="w-full flex g-1 justify-between align-center">
          <button
            type="submit"
            className="btn btn-green long w-full h-full border-none hover-pointer scale-down"
            name="side"
            value={Side.BUY}
          >
            LONG
          </button>
          <button
            type="submit"
            className="btn btn-primary w-full h-full border-none hover-pointer short scale-down"
            name="side"
            value={Side.SELL}
          >
            SHORT
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuturesOrderCard;
