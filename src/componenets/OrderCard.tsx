import { Value } from "@sinclair/typebox/value";
import { FC, FormEvent, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import UtilsManager from "../utils/classses/UtilsManager";

import { OrderRequest } from "../utils/ValidationTypes";
import Coin from "./icons/CoinIcon";

enum OrderType {
  MARKET = "market",
  LIMIT = "limit",
}

const OrderCard: FC<{ balance: number }> = ({ balance }) => {
  const [selectedOrderType, setSelectedOrderType] = useState<
    OrderType | undefined
  >(undefined);
  const [showTPSL, setShowTPSL] = useState<boolean>(false);

  async function placeTrade(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    if (selectedOrderType === undefined) {
      toast.error(
        "Please select an order type",
        UtilsManager.toastErrorOptions
      );
      return;
    }

    let payload: Record<any, any> = {
      ...(Object.fromEntries(
        new FormData(e.target as HTMLFormElement).entries()
      ) as unknown as OrderRequest),
      order_type: selectedOrderType!,
      side: ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)
        .value as "long" | "short",
    };

    ["amount", "limit_price", "stop_loss", "take_profit", "quantity"].forEach(
      (key) => {
        if (typeof payload[key] == "string") {
          payload[key] = Number(payload[key]);
        }
      }
    );

    payload["side"] = payload["side"] === "long" ? "buy" : "sell";
    payload["instrument"] = "BTCUSD";
    payload["market_type"] = "futures";

    if (Value.Check(OrderRequest, payload)) {
      try {
        if (balance < payload.amount) throw new Error("Amount exceeds balance");

        const rsp = await fetch(import.meta.env.VITE_BASE_URL + "/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await rsp.json();
        if (!rsp.ok) throw new Error(data["error"]);

        UtilsManager.toastSuccess(data["message"]);
      } catch (err) {
        UtilsManager.toastError((err as Error).message);
      }
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="h-full w-full order-card">
        <form className="h-full w-full flex-column g-2" onSubmit={placeTrade}>
          <div className="w-full flex justify-start align-center border-radius-primary border-bg-secondary p-xs">
            <div className="h-full" style={{ width: "10%" }}>
              <Coin size="100%" />
            </div>
            <div className="h-full w-full flex justify-start align-center">
              <span className="span-md bold">$</span>
              <input
                type="number"
                placeholder="100"
                name="amount"
                className="bold span-md w-full"
                min={1}
                step={0.01}
                required
              />
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
              className="btn btn-primary green long w-full h-full border-none hover-pointer scale-down"
              name="side"
              value="long"
            >
              LONG
            </button>
            <button
              type="submit"
              className="btn btn-primary w-full h-full border-none hover-pointer short scale-down"
              name="side"
              value="long"
            >
              SHORT
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default OrderCard;
