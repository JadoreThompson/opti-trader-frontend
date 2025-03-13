import { Value } from "@sinclair/typebox/value";
import { FC, useContext, useState } from "react";
import { FaCoins } from "react-icons/fa6";
import { SpotCloseOrderRequest } from "../utils/ValidationTypes";
import UtilsManager from "../utils/classses/UtilsManager";
import { MarketType, OrderType, Side } from "../utils/types";
import { UserOrdersContext } from "../contexts/OrdersContext";

const SpotOrderCard: FC<{
  instrument: string;
  marketType: MarketType;
  submitHandler: (arg: React.FormEvent<HTMLFormElement>) => Promise<void>;
  selectedOrderType?: OrderType;
  setSelectedOrderType: (arg?: OrderType) => void;
  changeMarketType: (arg: MarketType) => void;
}> = ({
  instrument,
  marketType,
  submitHandler,
  selectedOrderType,
  setSelectedOrderType,
  changeMarketType,
}) => {
  const { orders } = useContext(UserOrdersContext);
  const [showTPSL, setShowTPSL] = useState<boolean>(false);
  const [showBuyOptions, setShowBuyOptions] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  async function handleCloseRequest(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    const formData: Record<string, any> = Object.fromEntries(
      new FormData(e.target as HTMLFormElement).entries()
    );

    formData["quantity"] = Number(formData["quantity"]);
    formData["instrument"] = instrument;

    if (Value.Check(SpotCloseOrderRequest, formData)) {
      try {
        const rsp = await fetch(
          import.meta.env.VITE_BASE_URL + "/order/close",
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!rsp.ok) {
          const data = await rsp.json();
          throw new Error(data["detail"]);
        }
      } catch (err) {
        UtilsManager.toastError((err as Error).message);
      }
    } else {
      UtilsManager.toastError("Fields invalid");
    }
  }

  return (
    <div className="h-full w-full order-card scroll-hidden">
      <div
        className="w-full mb-3 flex justify-start align-center border-radius-primary snackbar p-xs"
        style={{ height: "2.5rem" }}
      >
        <button
          className={`btn border-none bg-background-secondary hover-pointer h-full w-full ${
            marketType === MarketType.FUTURES ? "active" : ""
          }`}
          onClick={() => changeMarketType(MarketType.FUTURES)}
        >
          {MarketType.FUTURES}
        </button>
        <button
          className={`btn border-none bg-background-secondary hover-pointer h-full w-full ${
            marketType === MarketType.SPOT ? "active" : ""
          }`}
          onClick={() => changeMarketType(MarketType.SPOT)}
        >
          {MarketType.SPOT}
        </button>
      </div>
      <div
        className="w-full mb-3 flex g-1 justify-start align-center border-radius-primary"
        style={{ height: "2rem" }}
      >
        <button
          className="btn btn-green scale-down long w-full h-full border-none hover-pointer"
          onClick={() => setShowBuyOptions(true)}
        >
          BUY
        </button>
        <button
          className="btn btn-primary scale-down short w-full h-full border-none hover-pointer"
          onClick={() => setShowBuyOptions(false)}
        >
          SELL
        </button>
      </div>
      {showBuyOptions && (
        <form
          className="h-full w-full flex-column g-2"
          onSubmit={submitHandler}
        >
          <>
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
                <span className="span-md">Limit Price</span>
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
            <div
              className={`w-full ${
                showTPSL ? "mt-2" : ""
              } flex justify-center align-center`}
            >
              <button
                type="submit"
                className="btn btn-green long w-full h-full border-none hover-pointer scale-down"
                name="side"
                value={Side.BUY}
              >
                PLACE
              </button>
            </div>
          </>
        </form>
      )}

      {!showBuyOptions && (
        <form
          className="h-full w-full flex-column g-2"
          onSubmit={handleCloseRequest}
        >
          <div
            className="w-full flex-column g-1 justify-start align-center border-radius-primary p-xs"
            style={{ height: "3.5rem" }}
          >
            <div className="w-full flex align-center justify-start">
              <label>Total AUM</label>
            </div>
            <div className="flex w-full g-1 align-center">
              <FaCoins fill="gold" />
              <span>100000</span>
            </div>
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
          <div className="flex justify-center align-center">
            <button
              type="submit"
              className="btn btn-primary short scale-down w-full h-full border-none hover-pointer scale-down"
              name="side"
            >
              SELL
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SpotOrderCard;
